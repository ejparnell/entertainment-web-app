import { NextRequest } from 'next/server';

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

export interface RateLimitOptions {
    maxRequests: number;
    windowMs: number;
}

export function rateLimit(options: RateLimitOptions) {
    const { maxRequests, windowMs } = options;

    return (
        request: NextRequest
    ): { success: boolean; resetTime?: number; remaining?: number } => {
        const clientId = getClientId(request);
        const now = Date.now();

        // Clean up expired entries
        for (const [key, value] of rateLimitMap.entries()) {
            if (value.resetTime < now) {
                rateLimitMap.delete(key);
            }
        }

        const current = rateLimitMap.get(clientId);

        if (!current || current.resetTime < now) {
            // New window or expired window
            rateLimitMap.set(clientId, {
                count: 1,
                resetTime: now + windowMs,
            });
            return {
                success: true,
                remaining: maxRequests - 1,
                resetTime: now + windowMs,
            };
        }

        if (current.count >= maxRequests) {
            // Rate limit exceeded
            return {
                success: false,
                remaining: 0,
                resetTime: current.resetTime,
            };
        }

        // Increment count
        current.count += 1;
        return {
            success: true,
            remaining: maxRequests - current.count,
            resetTime: current.resetTime,
        };
    };
}

function getClientId(request: NextRequest): string {
    // Get client identifier (IP address)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    
    if (realIp) {
        return realIp;
    }
    
    // Fallback for development
    return 'localhost';
}

// Predefined rate limiters for common use cases
export const authRateLimit = rateLimit({
    maxRequests: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // 15 minutes
});

export const apiRateLimit = rateLimit({
    maxRequests: 100, // 100 requests
    windowMs: 15 * 60 * 1000, // 15 minutes
});