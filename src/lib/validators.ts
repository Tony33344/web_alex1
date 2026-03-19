import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/\d/, 'Password must contain at least 1 number'),
    confirm_password: z.string(),
    preferred_language: z.enum(['en', 'de', 'it', 'fr', 'hi', 'si']),
    accept_terms: z.literal(true, {
      message: 'You must accept the Terms & Conditions',
    }),
    subscribe_newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords must match',
    path: ['confirm_password'],
  });

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  subject: z.enum(['general', 'membership', 'events', 'training', 'partnership', 'other']),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  preferred_language: z.enum(['en', 'de', 'it', 'fr', 'hi', 'si']),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/\d/, 'Password must contain at least 1 number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords must match',
    path: ['confirm_password'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
