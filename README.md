# RestroSphere Backend

A robust Node.js/Express backend API for the RestroSphere restaurant management platform, featuring secure authentication, user management, and business operations.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Complete user registration and profile management
- **Business Profiles**: Support for different business types (restaurant, cafe, food truck, etc.)
- **Input Validation**: Comprehensive request validation using express-validator
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Error Handling**: Centralized error handling with detailed logging
- **Database**: MongoDB with Mongoose ODM
- **API Documentation**: RESTful API endpoints with clear documentation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Restrosphere/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/restrosphere
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   ```

5. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

6. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database Models

### User Model
- `firstName`, `lastName`: User's personal information
- `email`: Unique email address (used for login)
- `password`: Hashed password using bcrypt
- `businessName`: Name of the business
- `businessType`: Type of business (restaurant, cafe, food-truck, etc.)
- `phone`: Contact phone number
- `role`: User role (owner, manager, staff)
- `isActive`: Account status
- `emailVerified`: Email verification status
- `lastLogin`: Last login timestamp

## 🔐 Authentication Endpoints

### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@restaurant.com",
  "password": "SecurePass123!",
  "businessName": "John's Restaurant",
  "businessType": "restaurant",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@restaurant.com",
    "businessName": "John's Restaurant",
    "businessType": "restaurant",
    "phone": "+1234567890",
    "role": "owner",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/api/auth/login`
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@restaurant.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@restaurant.com",
    "businessName": "John's Restaurant",
    "businessType": "restaurant",
    "phone": "+1234567890",
    "role": "owner",
    "isActive": true,
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@restaurant.com",
    "businessName": "John's Restaurant",
    "businessType": "restaurant",
    "phone": "+1234567890",
    "role": "owner",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/api/auth/logout`
Logout user (client-side token removal).

### POST `/api/auth/refresh`
Refresh JWT token.

## 🔒 Security Features

- **Password Hashing**: Bcrypt with configurable salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **Input Sanitization**: XSS and injection protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Request validation
├── models/
│   └── User.js              # User data model
├── routes/
│   └── auth.js              # Authentication routes
├── utils/
│   └── errorHandler.js      # Error handling utilities
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restrosphere
JWT_SECRET=very-long-random-secret-key
JWT_EXPIRE=1d
RATE_LIMIT_MAX_REQUESTS=50
ALLOWED_ORIGINS=https://yourdomain.com
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "restrosphere-backend"

# Monitor
pm2 monit

# Logs
pm2 logs restrosphere-backend
```

## 🔧 Configuration

### Database Connection
The application automatically connects to MongoDB using the `MONGODB_URI` environment variable. For local development, ensure MongoDB is running on the default port (27017).

### JWT Configuration
- `JWT_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRE`: Token expiration time (default: 7 days)

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting (default: 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window (default: 100)

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "token": "jwt-token" // if applicable
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ] // validation errors
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest changes:
- Watch the repository
- Check the changelog
- Follow the development blog

---

**Built with ❤️ for the RestroSphere team**
