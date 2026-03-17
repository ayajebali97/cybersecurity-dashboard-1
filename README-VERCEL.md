# 🛡️ CyberShield Dashboard - Vercel Deployment

A modern, full-stack cybersecurity dashboard built with Next.js, featuring real-time security scanning, user authentication, and comprehensive scan history management.

## 🚀 Quick Deploy on Vercel

### Prerequisites
- GitHub repository with the project code
- MySQL database (PlanetScale, Railway, or any MySQL hosting)
- Vercel account

### Step 1: Database Setup
1. Create a MySQL database (recommended: [PlanetScale](https://planetscale.com/) or [Railway](https://railway.app/))
2. Run the SQL schema from `database.sql` to create tables
3. Get your database connection details

### Step 2: Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repository to [Vercel](https://vercel.com)
3. Vercel will auto-detect the Next.js application
4. Configure environment variables in Vercel dashboard:

### Step 3: Environment Variables
Add these in your Vercel project settings:

```bash
DB_HOST=your-mysql-host
DB_USER=your-mysql-username  
DB_PASSWORD=your-mysql-password
DB_NAME=cybersecurity_dashboard
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### Step 4: Deploy
Click "Deploy" - Vercel will build and deploy your application!

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **State Management**: React hooks
- **Authentication**: JWT tokens stored in localStorage

### Backend (Serverless Functions)
- **API Routes**: `/api/login`, `/api/register`, `/api/scan`, `/api/history`
- **Database**: MySQL with connection pooling
- **Authentication**: bcrypt for password hashing, JWT for tokens
- **Security**: CORS enabled, input validation

### Database Schema
```sql
-- Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scans table for storing scan results
CREATE TABLE scans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  target VARCHAR(255) NOT NULL,
  result JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🎨 Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt
- Session management

### 🛡️ Security Scanning
- Simulated port scanning
- Risk assessment (LOW/MEDIUM/HIGH)
- Security issue detection
- Actionable recommendations

### 📊 Dashboard
- Real-time statistics
- Recent scan activity
- Quick action buttons
- Security tips

### 📜 Scan History
- Complete scan history
- Filtering by risk level
- Search functionality
- Detailed scan results modal

### 📱 Responsive Design
- Mobile-first approach
- Sidebar navigation
- Touch-friendly interface
- Modern card-based layouts

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL database host | ✅ |
| `DB_USER` | MySQL username | ✅ |
| `DB_PASSWORD` | MySQL password | ✅ |
| `DB_NAME` | Database name | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Scanning
- `POST /api/scan` - Perform security scan
- `GET /api/history` - Get scan history

### Request Examples

```javascript
// Register
POST /api/register
{
  "email": "user@example.com",
  "password": "password123"
}

// Login
POST /api/login
{
  "email": "user@example.com", 
  "password": "password123"
}

// Scan
POST /api/scan
Headers: Authorization: Bearer <jwt-token>
{
  "target": "example.com"
}

// History
GET /api/history
Headers: Authorization: Bearer <jwt-token>
```

## 🎯 Deployment Checklist

- [ ] Database created and schema imported
- [ ] Environment variables configured in Vercel
- [ ] Code pushed to GitHub
- [ ] Repository connected to Vercel
- [ ] Build successful
- [ ] Database connection working
- [ ] Authentication working
- [ ] Scanning functionality working

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
- Check all dependencies are in package.json
- Verify TypeScript configuration
- Ensure all API files are in `/api` directory

**Database Connection**
- Verify database credentials
- Check if database allows remote connections
- Ensure SSL is properly configured for cloud databases

**Authentication Issues**
- Verify JWT_SECRET is set and at least 32 characters
- Check token expiration settings
- Ensure proper CORS headers

**API Errors**
- Check Vercel function logs
- Verify environment variables
- Ensure proper error handling

### Debugging Tips
1. Check Vercel function logs in dashboard
2. Use `console.log` in serverless functions
3. Test API endpoints with Postman
4. Verify environment variables are set correctly

## 🚀 Performance Optimization

### Database
- Use connection pooling
- Add indexes to frequently queried columns
- Consider caching for repeated scans

### Frontend
- Images optimized with Next.js Image component
- Code splitting with dynamic imports
- Proper caching strategies

### Serverless Functions
- Keep functions warm
- Optimize cold start times
- Use appropriate memory allocation

## 📈 Monitoring

### Vercel Analytics
- Page views and visitors
- Web Vitals performance
- Build and deployment metrics

### Database Monitoring
- Connection pool usage
- Query performance
- Error rates

## 🔒 Security Considerations

- JWT tokens with expiration
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Database connection security

## 📞 Support

For issues with:
- **Vercel Deployment**: Check [Vercel Docs](https://vercel.com/docs)
- **Database Issues**: Refer to your database provider docs
- **Application Bugs**: Check GitHub Issues or create new one

---

**Built with ❤️ using Next.js, Tailwind CSS, and Vercel**
