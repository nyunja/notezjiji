# Academic Notes Marketplace - Backend API

Production-grade backend API for the Academic Notes Marketplace with comprehensive security, rate limiting, and queue processing.

## Features

### Authentication & Security
- JWT authentication with refresh token rotation
- Multi-layer rate limiting with Redis
- Role-based access control (RBAC)
- Account lockout protection after failed attempts
- Session management with device tracking
- Input validation with Zod

### File Processing
- Automated PDF and image processing
- PDF page count extraction and metadata
- Thumbnail generation from first page of PDFs
- Image resizing and optimization with Sharp
- Preview generation (first 3 pages for PDFs, resized for images)
- Automatic file type detection via magic bytes
- Storage integration with Supabase buckets

### Background Processing
- BullMQ job queues for async processing
- File processing worker for uploads
- Email notification worker
- Payment processing worker
- Comprehensive error handling and logging

## Prerequisites

- Node.js 18+
- Supabase account and project
- Upstash Redis account
- Paystack account (for payments)
- SendGrid account (for emails)

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Required environment variables:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `UPSTASH_REDIS_URL` - Your Upstash Redis connection URL
   - `JWT_ACCESS_SECRET` - Random string (min 32 chars)
   - `JWT_REFRESH_SECRET` - Random string (min 32 chars)
   - `PAYSTACK_SECRET_KEY` - Your Paystack secret key
   - `SENDGRID_API_KEY` - Your SendGrid API key

4. Run database migrations (already done via Supabase MCP)

5. Start development server:
```bash
npm run dev
```

6. Start worker processes (in separate terminal):
```bash
npm run worker
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/sessions` - Get user sessions
- `DELETE /api/v1/auth/sessions/:id` - Revoke session

### Items (coming soon)
- Upload, browse, search marketplace items

### Payments (coming soon)
- Initialize payment, verify payment, webhooks

### Admin (coming soon)
- Approve/reject items, manage users, payouts

## Architecture

### Core Stack
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database, file storage, RLS
- **Upstash Redis** - Caching, rate limiting, session storage
- **BullMQ** - Job queue processing

### Security & Auth
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing (12 rounds)
- **Zod** - Input validation

### File Processing
- **pdf-to-img** - PDF to image conversion for thumbnails
- **pdf-lib** - PDF metadata extraction and manipulation
- **Sharp** - Image processing and optimization

### Observability
- **Winston** - Structured logging

## Security Features

- Rate limiting on all endpoints
- JWT with short-lived access tokens (15min)
- Refresh token rotation in database
- Account lockout after 5 failed login attempts
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- CORS and Helmet.js security headers
- Row Level Security in database

## Development

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Compile TypeScript
npm run start      # Start production server
npm run typecheck  # Type check without building
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong secrets for JWT
3. Enable HTTPS only
4. Configure proper CORS origins
5. Set up monitoring and alerts
6. Run workers as separate processes/containers
7. Configure Redis persistence
8. Set up database backups

## Offline Redis Fail-safe

* **Graceful Redis Fallback**: The backend is configured to fail fast and bypass caching when Redis is disconnected or offline (`enableOfflineQueue: false` is set). All operations in `CacheService` immediately fallback to direct database queries to prevent the application from hanging.

## License

MIT
