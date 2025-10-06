# Authentication Integration Guide

This project now includes a complete authentication system integrated with your entertainment web app.

## 🚀 **Features Added:**

### **Authentication System:**
- ✅ User registration and login
- ✅ JWT-based bearer token authentication
- ✅ Refresh token rotation
- ✅ Protected API routes
- ✅ User profile management
- ✅ Password hashing with bcrypt
- ✅ Input validation with Zod
- ✅ Rate limiting on auth endpoints

### **Entertainment App Features:**
- ✅ User bookmarks for movies/TV shows
- ✅ Watch history tracking
- ✅ User preferences (genres, ratings)
- ✅ Personalized dashboard

## 📦 **New Dependencies Added:**

```json
{
  "mongoose": "Database ODM for MongoDB",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT token generation/verification", 
  "zod": "Input validation schemas",
  "@types/bcryptjs": "TypeScript types",
  "@types/jsonwebtoken": "TypeScript types"
}
```

## 🔧 **Setup Instructions:**

### **1. Environment Variables**
Update your `.env.local` file with your actual values:

```env
# MongoDB Connection - Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/entertainment-web-app?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# JWT Secrets - Generate these with: openssl rand -hex 32
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Optional
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

### **2. MongoDB Atlas Setup**
1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account
2. Create a new cluster
3. Add your IP address to the IP whitelist
4. Create a database user
5. Get your connection string and update `MONGODB_URI`

### **3. Generate Secrets**
Generate strong, unique secrets:
```bash
# Generate JWT secrets
openssl rand -hex 32
```

## 📁 **Project Structure:**

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts    # User registration
│   │   │   ├── login/route.ts       # User login
│   │   │   ├── logout/route.ts      # User logout
│   │   │   └── refresh/route.ts     # Token refresh
│   │   └── user/
│   │       ├── profile/route.ts     # User profile
│   │       └── bookmarks/route.ts   # Movie bookmarks
│   ├── layout.tsx                   # Root layout with AuthProvider
│   └── page.tsx                     # Main page with auth flow
├── components/
│   ├── LoginForm.tsx               # Login form component
│   └── RegisterForm.tsx            # Registration form component
├── contexts/
│   └── AuthContext.tsx             # Authentication context
├── lib/
│   ├── mongodb.ts                  # Database connection
│   ├── jwt.ts                      # JWT utilities
│   ├── validations.ts              # Zod validation schemas
│   └── rate-limit.ts               # Rate limiting
├── middleware/
│   └── auth.ts                     # Authentication middleware
├── models/
│   └── User.ts                     # User database model
└── ui/                             # Your existing UI components
```

## 🎯 **How to Use:**

### **Starting the Application**
```bash
npm run dev
```

### **User Registration/Login**
1. Visit `http://localhost:3000`
2. You'll see the login/register forms
3. Create an account or sign in
4. Access the protected dashboard

### **API Endpoints**

#### **Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh tokens

#### **User Management:**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/bookmarks` - Get user bookmarks
- `POST /api/user/bookmarks` - Add/remove bookmarks

### **Using the Auth Context:**

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
    const { user, login, logout, toggleBookmark, isBookmarked } = useAuth();

    if (!user) {
        return <div>Please log in</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>
            <button onClick={() => toggleBookmark('movie-123')}>
                {isBookmarked('movie-123') ? 'Remove Bookmark' : 'Add Bookmark'}
            </button>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

## 🔒 **Security Features:**

- **Password Hashing:** Passwords are hashed with bcrypt (12 salt rounds)
- **JWT Security:** Short-lived access tokens (15 min) with refresh tokens (7 days)
- **Rate Limiting:** 5 login attempts per 15 minutes per IP
- **Input Validation:** All inputs validated with Zod schemas
- **CORS Protection:** Configurable allowed origins
- **Security Headers:** Added security headers via middleware

## 🚀 **Next Steps:**

1. **Connect to your movie data:** Update the bookmarks system to work with your actual movie/TV data
2. **Add movie components:** Integrate authentication with your existing entertainment components
3. **Protected routes:** Add route protection for different user roles
4. **Email verification:** Add email verification for new users
5. **Password reset:** Implement password reset functionality

## 🐛 **Troubleshooting:**

### **MongoDB Connection Issues:**
- Check your connection string format
- Verify IP whitelist includes your development IP
- Ensure database credentials are correct

### **JWT Token Issues:**
- Make sure `JWT_SECRET` is set
- Check if tokens are being stored in localStorage
- Verify token expiration times

### **CORS Errors:**
- Update `ALLOWED_ORIGINS` in `.env.local`
- Check middleware configuration

## 📚 **Additional Resources:**

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

🎉 **Congratulations!** Your entertainment web app now has a complete authentication system. You can now build upon this foundation to create a fully-featured entertainment platform with user accounts, personalized experiences, and secure data management.