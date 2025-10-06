import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    name: string;
    role: 'user' | 'admin';
    isEmailVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    refreshTokens: string[];
    // Entertainment app specific fields
    bookmarkedMovies: string[];
    watchHistory: string[];
    preferences: {
        favoriteGenres: string[];
        maturityRating: string;
    };
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // Don't include password in queries by default
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        refreshTokens: [
            {
                type: String,
            },
        ],
        // Entertainment app specific fields
        bookmarkedMovies: [
            {
                type: String, // Movie/TV show IDs
            },
        ],
        watchHistory: [
            {
                type: String, // Movie/TV show IDs with timestamps
            },
        ],
        preferences: {
            favoriteGenres: [String],
            maturityRating: {
                type: String,
                enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'],
                default: 'PG-13',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
UserSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    return userObject;
};

export default mongoose.models.User ||
    mongoose.model<IUser>('User', UserSchema);