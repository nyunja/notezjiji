export enum UserRole {
  BUYER = 'buyer',
  UPLOADER = 'uploader',
  ADMIN = 'admin'
}

export enum ItemStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELETED = 'deleted'
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PayoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FAILED = 'failed'
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  is_verified: boolean;
  is_suspended: boolean;
  failed_login_attempts: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  uploader_id: string;
  title: string;
  description: string;
  course: string;
  year: string;
  tags: string[];
  price: number;
  status: ItemStatus;
  approval_status: ItemStatus;
  file_path: string;
  preview_path?: string;
  thumbnail_path?: string;
  page_count?: number;
  file_size: number;
  view_count: number;
  purchase_count: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  item_id: string;
  amount: number;
  payment_status: PaymentStatus;
  paystack_reference: string;
  paystack_access_code?: string;
  transaction_date?: string;
  download_count: number;
  max_downloads: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Payout {
  id: string;
  uploader_id: string;
  amount: number;
  platform_fee: number;
  paystack_fee: number;
  net_amount: number;
  bank_details: Record<string, unknown>;
  status: PayoutStatus;
  paystack_transfer_code?: string;
  admin_notes?: string;
  requested_at: string;
  processed_at?: string;
  created_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
