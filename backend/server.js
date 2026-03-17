const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;
async function initDB() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cybersecurity_dashboard'
        });
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// JWT Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Auth Routes
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        // Generate JWT
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'User created successfully',
            token,
            user: { id: result.insertId, email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const [users] = await db.execute(
            'SELECT id, email, password FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: users[0].id, email: users[0].email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: users[0].id, email: users[0].email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Scan simulation function
function simulateScan(target) {
    const commonPorts = [21, 22, 80, 443];
    const openPorts = [];
    const issues = [];
    let riskScore = 0;
    const recommendations = [];

    // Randomly select open ports
    commonPorts.forEach(port => {
        if (Math.random() > 0.5) {
            openPorts.push(port);
        }
    });

    // Detect issues and calculate risk
    if (openPorts.includes(22)) {
        issues.push('SSH port open (22)');
        riskScore += 2;
        recommendations.push('Close unused SSH port');
    }

    if (openPorts.includes(21)) {
        issues.push('FTP port open (21)');
        riskScore += 2;
        recommendations.push('Disable FTP or secure it');
    }

    if (!target.startsWith('https')) {
        issues.push('No HTTPS detected');
        riskScore += 3;
        recommendations.push('Enable HTTPS');
    }

    // Determine risk level
    let risk;
    if (riskScore <= 2) {
        risk = 'LOW';
    } else if (riskScore <= 4) {
        risk = 'MEDIUM';
    } else {
        risk = 'HIGH';
    }

    return {
        target,
        openPorts,
        issues,
        risk,
        recommendations,
        riskScore
    };
}

// Scan Routes
app.post('/api/scan', authenticateToken, async (req, res) => {
    try {
        const { target } = req.body;

        if (!target) {
            return res.status(400).json({ error: 'Target (IP or URL) required' });
        }

        // Simulate scan
        const scanResult = simulateScan(target);

        // Save to database
        const [result] = await db.execute(
            'INSERT INTO scans (user_id, target, result) VALUES (?, ?, ?)',
            [req.user.userId, target, JSON.stringify(scanResult)]
        );

        res.json({
            message: 'Scan completed',
            scanId: result.insertId,
            ...scanResult
        });
    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const [scans] = await db.execute(
            'SELECT id, target, result, created_at FROM scans WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );

        // Parse JSON results
        const scanHistory = scans.map(scan => ({
            ...scan,
            result: JSON.parse(scan.result)
        }));

        res.json(scanHistory);
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
