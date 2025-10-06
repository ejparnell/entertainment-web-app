import { z } from 'zod';

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .optional(),
    email: z.string().email('Invalid email address').toLowerCase().optional(),
    preferences: z.object({
        favoriteGenres: z.array(z.string()).optional(),
        maturityRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR']).optional(),
    }).optional(),
});

export const bookmarkSchema = z.object({
    movieId: z.string().min(1, 'Movie ID is required'),
    action: z.enum(['add', 'remove']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;