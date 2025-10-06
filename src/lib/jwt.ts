import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export interface RefreshTokenPayload {
    userId: string;
    tokenVersion: number;
}

export const generateTokens = (user: IUser) => {
    const payload: JWTPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET!, {
        expiresIn: '15m', // Short-lived access token
    });

    const refreshPayload: RefreshTokenPayload = {
        userId: user._id,
        tokenVersion: Date.now(), // Simple versioning
    };

    const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET!, {
        expiresIn: '7d', // Long-lived refresh token
    });

    return {
        accessToken,
        refreshToken,
    };
};

export const verifyAccessToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET!) as JWTPayload;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (
    token: string
): RefreshTokenPayload | null => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET!) as RefreshTokenPayload;
    } catch (error) {
        return null;
    }
};

export const extractTokenFromHeader = (
    authHeader: string | null
): string | null => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};