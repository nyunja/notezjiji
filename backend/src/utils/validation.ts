import { z } from 'zod';
import { UserRole } from '../types/index.js';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum([UserRole.BUYER, UserRole.UPLOADER]).default(UserRole.BUYER)
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const uploadItemSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  course: z.string().min(2, 'Course name is required'),
  year: z.string().regex(/^\d{4}$/, 'Year must be a valid 4-digit year'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  price: z.number().positive('Price must be greater than 0')
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_name: z.string().optional()
});

export const payoutRequestSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0').min(1000, 'Minimum payout amount is 1000')
});

export const validate = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    return schema.parse(data);
  };
};
