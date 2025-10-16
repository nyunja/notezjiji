import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { paymentService } from '../services/paymentService.js';
import { emailService } from '../services/emailService.js';
import { supabase } from '../config/database.js';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { nanoid } from 'nanoid';
import { pdf } from 'pdf-to-img';

interface FileMetadata {
  fileSize: number;
  processedAt: string;
  fileType: string;
  pageCount?: number;
  width?: number;
  height?: number;
  format?: string;
  [key: string]: unknown;
}

interface PurchaseWithRelations {
  buyer: {
    email: string;
    full_name: string;
  };
  item: {
    title: string;
  };
  amount: number;
}

const connection = redis;

const fileProcessingWorker = new Worker(
  'file-processing',
  async (job: Job) => {
    logger.info(`Processing file job: ${job.id}`, job.data);

    try {
      const { itemId, filePath } = job.data;

      // Update item status to processing
      await supabase
        .from('items')
        .update({ status: 'processing' })
        .eq('id', itemId);

      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('uploads')
        .download(filePath);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message}`);
      }

      // Convert blob to buffer
      const buffer = Buffer.from(await fileData.arrayBuffer());

      // Detect file type from buffer
      const fileType = await detectFileType(buffer);

      const metadata: FileMetadata = {
        fileSize: buffer.length,
        processedAt: new Date().toISOString(),
        fileType: fileType
      };

      let thumbnailPath: string | null = null;
      let previewPath: string | null = null;

      // Process based on file type
      if (fileType === 'application/pdf') {
        // Process PDF: extract metadata and generate thumbnail
        const pdfDoc = await PDFDocument.load(buffer);
        const pageCount = pdfDoc.getPageCount();

        metadata.pageCount = pageCount;
        logger.info(`PDF has ${pageCount} pages`);

        // Generate thumbnail from first page using pdf-lib
        // Note: For actual thumbnail generation, we'd need pdf2pic or similar
        // For now, we'll create a placeholder thumbnail
        const thumbnailBuffer = await generatePdfThumbnail(buffer);

        if (thumbnailBuffer) {
          // Upload thumbnail to Supabase Storage
          const thumbnailFileName = `${nanoid()}-thumb.png`;
          const { error: uploadError } = await supabase
            .storage
            .from('thumbnails')
            .upload(thumbnailFileName, thumbnailBuffer, {
              contentType: 'image/png',
              upsert: false
            });

          if (!uploadError) {
            thumbnailPath = thumbnailFileName;
            logger.info(`Thumbnail uploaded: ${thumbnailFileName}`);
          }
        }

        // Generate preview (smaller version for quick viewing)
        const previewBuffer = await generatePdfPreview(buffer);

        if (previewBuffer) {
          const previewFileName = `${nanoid()}-preview.pdf`;
          const { error: uploadError } = await supabase
            .storage
            .from('previews')
            .upload(previewFileName, previewBuffer, {
              contentType: 'application/pdf',
              upsert: false
            });

          if (!uploadError) {
            previewPath = previewFileName;
            logger.info(`Preview uploaded: ${previewFileName}`);
          }
        }

      } else if (fileType === 'image/jpeg' || fileType === 'image/png') {
        // Process images: extract metadata and generate thumbnail
        const imageMetadata = await sharp(buffer).metadata();

        metadata.width = imageMetadata.width;
        metadata.height = imageMetadata.height;
        metadata.format = imageMetadata.format;

        // Generate thumbnail (300x300 max, maintaining aspect ratio)
        const thumbnailBuffer = await sharp(buffer)
          .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .png()
          .toBuffer();

        const thumbnailFileName = `${nanoid()}-thumb.png`;
        const { error: uploadError } = await supabase
          .storage
          .from('thumbnails')
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: 'image/png',
            upsert: false
          });

        if (!uploadError) {
          thumbnailPath = thumbnailFileName;
          logger.info(`Image thumbnail uploaded: ${thumbnailFileName}`);
        }

        // Generate preview (800x800 max for quick viewing)
        const previewBuffer = await sharp(buffer)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        const previewFileName = `${nanoid()}-preview.jpg`;
        const { error: previewUploadError } = await supabase
          .storage
          .from('previews')
          .upload(previewFileName, previewBuffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (!previewUploadError) {
          previewPath = previewFileName;
          logger.info(`Image preview uploaded: ${previewFileName}`);
        }
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Update item with metadata and paths
      await supabase
        .from('items')
        .update({
          status: 'pending',
          thumbnail_path: thumbnailPath,
          preview_path: previewPath,
          file_size: buffer.length,
          page_count: metadata.pageCount || null
        })
        .eq('id', itemId);

      logger.info(`File processing completed for item ${itemId}`);
      return { processed: true, metadata, thumbnailPath, previewPath };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('File processing failed:', error);

      // Update item status to failed
      if (job.data.itemId) {
        await supabase
          .from('items')
          .update({ status: 'rejected', rejection_reason: `File processing failed: ${errorMessage}` })
          .eq('id', job.data.itemId);
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 2
  }
);

// Helper function to detect file type from buffer
async function detectFileType(buffer: Buffer): Promise<string> {
  // Check PDF signature
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }

  // Check JPEG signature
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }

  // Check PNG signature
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }

  throw new Error('Unknown file type');
}

// Helper function to generate PDF thumbnail from first page
async function generatePdfThumbnail(pdfBuffer: Buffer): Promise<Buffer | null> {
  try {
    // Convert PDF first page to image using pdf-to-img
    const document = await pdf(pdfBuffer, { scale: 2.0 });

    // Get the first page
    let firstPageBuffer: Buffer | null = null;

    for await (const page of document) {
      firstPageBuffer = page;
      break; // Only need the first page
    }

    if (!firstPageBuffer) {
      throw new Error('Failed to extract first page from PDF');
    }

    // Resize to thumbnail size (300x300 max) using Sharp
    const thumbnailBuffer = await sharp(firstPageBuffer)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();

    logger.info('PDF thumbnail generated successfully');
    return thumbnailBuffer;
  } catch (error) {
    logger.error('Failed to generate PDF thumbnail:', error);
    // Return placeholder on error
    try {
      const placeholderSvg = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="300" fill="#f3f4f6"/>
          <text x="150" y="140" font-family="Arial" font-size="18" fill="#6b7280" text-anchor="middle">
            PDF Document
          </text>
          <text x="150" y="170" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">
            Preview unavailable
          </text>
        </svg>
      `;

      return await sharp(Buffer.from(placeholderSvg))
        .png()
        .toBuffer();
    } catch (fallbackError) {
      logger.error('Failed to generate placeholder thumbnail:', fallbackError);
      return null;
    }
  }
}

// Helper function to generate PDF preview
async function generatePdfPreview(pdfBuffer: Buffer): Promise<Buffer | null> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    // Create preview with first 3 pages or all pages if less than 3
    const previewPageCount = Math.min(pageCount, 3);
    const previewDoc = await PDFDocument.create();

    for (let i = 0; i < previewPageCount; i++) {
      const [copiedPage] = await previewDoc.copyPages(pdfDoc, [i]);
      previewDoc.addPage(copiedPage);
    }

    return Buffer.from(await previewDoc.save());
  } catch (error) {
    logger.error('Failed to generate PDF preview:', error);
    return null;
  }
}

const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    logger.info(`Processing email job: ${job.id}`, job.data);

    try {
      switch (job.name) {
        case 'item-approved': {
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', job.data.uploaderId)
            .single();

          if (user) {
            await emailService.sendItemApprovalEmail(
              user.email,
              user.full_name,
              job.data.itemTitle
            );
          }
          break;
        }

        case 'item-rejected': {
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', job.data.uploaderId)
            .single();

          if (user) {
            await emailService.sendItemRejectionEmail(
              user.email,
              user.full_name,
              job.data.itemTitle,
              job.data.reason
            );
          }
          break;
        }

        case 'payout-approved': {
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', job.data.uploaderId)
            .single();

          if (user) {
            await emailService.sendPayoutApprovedEmail(
              user.email,
              user.full_name,
              job.data.amount
            );
          }
          break;
        }

        case 'payout-rejected': {
          const { data: user } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', job.data.uploaderId)
            .single();

          if (user) {
            await emailService.sendPayoutRejectedEmail(
              user.email,
              user.full_name,
              job.data.amount,
              job.data.reason
            );
          }
          break;
        }

        case 'purchase-confirmation': {
          const { data: purchase } = await supabase
            .from('purchases')
            .select('*, buyer:users!purchases_buyer_id_fkey(email, full_name), item:items(title)')
            .eq('id', job.data.purchaseId)
            .single();

          if (purchase) {
            const typedPurchase = purchase as unknown as PurchaseWithRelations;
            if (typedPurchase.buyer && typedPurchase.item) {
              await emailService.sendPurchaseConfirmationEmail(
                typedPurchase.buyer.email,
                typedPurchase.buyer.full_name,
                typedPurchase.item.title,
                typedPurchase.amount
              );
            }
          }
          break;
        }

        case 'welcome': {
          await emailService.sendWelcomeEmail(
            job.data.email,
            job.data.name,
            job.data.role
          );
          break;
        }
      }

      return { sent: true };
    } catch (error) {
      logger.error('Email job failed:', error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 3
  }
);

const paymentWorker = new Worker(
  'payment',
  async (job: Job) => {
    logger.info(`Processing payment job: ${job.id}`, job.data);

    if (job.name === 'process-payment') {
      await paymentService.processSuccessfulPayment(
        job.data.reference,
        job.data.paystackData
      );
    }

    if (job.name === 'webhook-payment') {
      if (job.data.event === 'charge.success') {
        await paymentService.processSuccessfulPayment(
          job.data.data.reference,
          job.data.data
        );
      }
    }

    return { processed: true };
  },
  {
    connection,
    concurrency: 2
  }
);

const payoutWorker = new Worker(
  'payout',
  async (job: Job) => {
    logger.info(`Processing payout job: ${job.id}`, job.data);

    return { processed: true };
  },
  {
    connection,
    concurrency: 1
  }
);

const analyticsWorker = new Worker(
  'analytics',
  async (job: Job) => {
    logger.info(`Processing analytics job: ${job.id}`, job.data);

    return { processed: true };
  },
  {
    connection,
    concurrency: 1
  }
);

fileProcessingWorker.on('completed', (job) => {
  logger.info(`File processing job ${job.id} completed`);
});

fileProcessingWorker.on('failed', (job, error) => {
  logger.error(`File processing job ${job?.id} failed:`, error);
});

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, error) => {
  logger.error(`Email job ${job?.id} failed:`, error);
});

paymentWorker.on('completed', (job) => {
  logger.info(`Payment job ${job.id} completed`);
});

paymentWorker.on('failed', (job, error) => {
  logger.error(`Payment job ${job?.id} failed:`, error);
});

logger.info('All workers started successfully');

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing workers...');
  await Promise.all([
    fileProcessingWorker.close(),
    emailWorker.close(),
    paymentWorker.close(),
    payoutWorker.close(),
    analyticsWorker.close()
  ]);
  process.exit(0);
});
