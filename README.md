# Notezjiji - Academic Notes Marketplace

A full-stack web application for buying and selling academic notes, built with React, TypeScript, Express, and Supabase.

## Overview

Notezjiji is a marketplace platform where students can upload, share, and monetize their academic notes. The platform features secure payments via Paystack, automated PDF processing with preview generation, and comprehensive admin moderation tools.

## Features

### For Users
- **Authentication System**: Secure registration and login with JWT-based authentication
- **Marketplace**: Browse and purchase academic notes with advanced search and filtering
- **Upload & Sell**: Upload PDF notes with automatic preview generation and processing
- **Purchase History**: Track all purchased items with download access
- **User Profiles**: Manage account details and view transaction history
- **Real-time Notifications**: Get updates on purchases, approvals, and system events

### For Sellers
- **Dashboard**: Track uploaded items, sales, and earnings
- **Analytics**: View performance metrics and download statistics
- **Payout Management**: Request payouts for earned revenue
- **Item Management**: Edit or remove uploaded content

### For Administrators
- **Content Moderation**: Review and approve/reject uploaded notes
- **User Management**: Manage user accounts and permissions
- **Payout Approval**: Process seller payout requests
- **Platform Analytics**: Monitor platform health and activity

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API requests
- **Supabase Client** for authentication and storage

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **Redis** (Upstash) for rate limiting and caching
- **BullMQ** for background job processing
- **JWT** for authentication tokens
- **Paystack** for payment processing

### Infrastructure
- **Supabase**: PostgreSQL database, authentication, and file storage
- **Redis**: Rate limiting and session management
- **Background Workers**: PDF processing and preview generation

## Project Structure

```
notezjiji/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── validators/        # Input validation
│   │   ├── workers/           # Background job processors
│   │   └── index.ts           # Server entry point
│   └── package.json
├── src/                        # React frontend
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── lib/                   # Utilities and API client
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── supabase/
│   └── migrations/            # Database migrations
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Redis instance (Upstash recommended)
- Paystack account for payment processing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notezjiji
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Configure environment variables:

**Frontend** (`.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001/api/v1
```

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

UPSTASH_REDIS_URL=your_upstash_redis_url

JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars

PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

FRONTEND_URL=http://localhost:5173

EMAIL_SERVICE=console
EMAIL_FROM=noreply@yourapp.com

MAX_UPLOAD_SIZE=104857600
MAX_UPLOADS_PER_USER=10
PLATFORM_FEE_PERCENTAGE=15
```

4. Set up the database:
```bash
# Run Supabase migrations
npx supabase db push
```

5. Start the development servers:

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start worker (for background jobs)
cd backend
npm run worker
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3001`.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile

### Items
- `GET /api/v1/items` - List marketplace items
- `GET /api/v1/items/:id` - Get item details
- `POST /api/v1/items` - Upload new item
- `PATCH /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item
- `GET /api/v1/items/user/uploads` - Get user uploads
- `GET /api/v1/items/user/purchases` - Get purchase history

### Payments
- `POST /api/v1/payments/initiate` - Initiate payment
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/payout/request` - Request payout

### Admin
- `GET /api/v1/admin/items/pending` - Get pending items
- `PATCH /api/v1/admin/items/:id/approve` - Approve item
- `PATCH /api/v1/admin/items/:id/reject` - Reject item
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/payouts/pending` - Get pending payouts
- `POST /api/v1/admin/payouts/:id/process` - Process payout

## Features in Detail

### PDF Processing
- Automatic page count extraction
- File size validation
- Preview image generation (first 3 pages)
- Watermarking for preview images
- Secure file storage in Supabase

### Payment Processing
- Integration with Paystack payment gateway
- Secure payment verification
- Automated revenue distribution
- Platform fee calculation (configurable)
- Payout request system for sellers

### Security Features
- JWT-based authentication with refresh tokens
- Rate limiting on all endpoints
- Input validation with Zod
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection

### Background Jobs
- PDF preview generation
- Email notifications
- File processing
- Cleanup tasks

## Development

### Type Checking
```bash
# Frontend
npm run typecheck

# Backend
cd backend
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

## Database Schema

Key tables:
- `users` - User accounts and profiles
- `items` - Uploaded academic notes
- `transactions` - Purchase history
- `payouts` - Seller payout requests
- `notifications` - User notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.

## Recent Reliability & Stability Improvements

### Frontend Layout Stability
* **No-Hover Static Cards**: Introduced `.premium-card-static` class to support stationary display containers. This prevents double hover animations and jitter when elements inside cards are hovered.
* **Scrollbar Stabilization**: Configured custom scrollbar styles and `.no-scrollbar` behavior inside `index.css` to hide scrollbars as intended and prevent layout shifts.

### Backend Fail-safes
* **Graceful Redis Bypassing**: Configured Redis connections to fail fast and disable offline command queuing (`enableOfflineQueue: false`). The `CacheService` detects if Redis is unavailable and bypasses the cache immediately to query Supabase directly, preventing endpoint hangs.

## Support

For issues and questions, please open an issue in the repository.
