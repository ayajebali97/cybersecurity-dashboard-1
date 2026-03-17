# Cybersecurity Dashboard

A clean full-stack cybersecurity dashboard built with Next.js (frontend), Node.js with Express (backend), and MySQL database.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Security Scanning**: Simulated cybersecurity scans with risk assessment
- **Dashboard**: Overview with quick actions and navigation
- **Scan History**: Track all previous scans with detailed results
- **Risk Assessment**: Automated risk scoring (LOW/MEDIUM/HIGH)
- **Recommendations**: Security recommendations based on scan results

## Project Structure

```
cybersecurity-dashboard/
├── frontend/                 # Next.js frontend
│   ├── pages/
│   │   ├── login.tsx        # Login page
│   │   ├── register.tsx     # Registration page
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── scan.tsx         # Security scanner
│   │   └── history.tsx      # Scan history
│   ├── styles/
│   │   └── globals.css      # Global styles
│   └── package.json
├── backend/                  # Node.js Express API
│   ├── server.js            # Main server file
│   ├── Dockerfile           # Docker configuration
│   ├── .dockerignore
│   └── package.json
├── database.sql             # MySQL database schema
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (XAMPP recommended)
- npm or yarn

### 1. Database Setup

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin or MySQL command line
3. Import the database schema:

```sql
-- Run the database.sql file in your MySQL client
-- This will create the database and required tables
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cybersecurity_dashboard
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Running the Application

1. **Start MySQL (XAMPP)**
   - Launch XAMPP Control Panel
   - Start Apache and MySQL services

2. **Run Backend**
   ```bash
   cd backend
   npm start
   ```

3. **Run Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Open your browser and go to `http://localhost:3000`
   - Register a new account or login
   - Start scanning!

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Scanning
- `POST /api/scan` - Perform security scan (requires auth)
- `GET /api/history` - Get scan history (requires auth)
- `GET /api/health` - Health check endpoint

## Docker Support

To run the backend with Docker:

```bash
cd backend
docker build -t cybersecurity-backend .
docker run -p 5000:5000 --env-file .env cybersecurity-backend
```

## Scan Simulation Logic

The application simulates cybersecurity scans with the following logic:

1. **Port Detection**: Randomly checks common ports [21, 22, 80, 443]
2. **Issue Detection**:
   - Port 22 open → "SSH port open (22)"
   - Port 21 open → "FTP port open (21)"
   - No HTTPS → "No HTTPS detected"
3. **Risk Scoring**:
   - SSH open: +2 points
   - FTP open: +2 points
   - No HTTPS: +3 points
   - 0-2: LOW risk
   - 3-4: MEDIUM risk
   - 5+: HIGH risk

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express, MySQL2
- **Authentication**: bcrypt, JWT
- **Database**: MySQL
- **Styling**: CSS (no external frameworks)
- **Docker**: Alpine Linux based container

## Development Notes

- The scan functionality is simulated for educational purposes
- No actual network scanning or hacking tools are used
- Passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- The application follows security best practices

## Troubleshooting

1. **Database Connection Error**
   - Ensure MySQL is running in XAMPP
   - Check database credentials in `.env` file
   - Verify database schema is imported

2. **CORS Issues**
   - Backend includes CORS middleware
   - Frontend proxy configuration in `next.config.js`

3. **Authentication Issues**
   - Check JWT secret in `.env` file
   - Ensure tokens are stored in localStorage

## License

MIT License - feel free to use for educational purposes.
