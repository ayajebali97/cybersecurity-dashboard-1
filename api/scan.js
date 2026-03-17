const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
};

let pool;

async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    });
  }
  return pool;
}

// Helper function to verify JWT
function verifyToken(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Simulated port scanning logic
function simulateScan(target) {
  const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
  const openPorts = [];
  const issues = [];
  const recommendations = [];
  let riskScore = 0;

  // Randomly determine open ports
  commonPorts.forEach(port => {
    if (Math.random() > 0.6) {
      openPorts.push(port);
      
      // Add issues based on open ports
      if (port === 21) {
        issues.push('FTP port is open - consider using SFTP instead');
        recommendations.push('Close FTP port or use secure FTP (SFTP)');
        riskScore += 2;
      }
      if (port === 22) {
        issues.push('SSH port is open - ensure strong passwords are used');
        recommendations.push('Use SSH key authentication instead of passwords');
        riskScore += 1;
      }
      if (port === 23) {
        issues.push('Telnet port is open - insecure protocol');
        recommendations.push('Close Telnet port and use SSH instead');
        riskScore += 3;
      }
      if (port === 80) {
        issues.push('HTTP port is open - consider using HTTPS');
        recommendations.push('Implement SSL/TLS encryption');
        riskScore += 1;
      }
      if (port === 443) {
        // HTTPS is good, no issue
        recommendations.push('Ensure SSL certificate is valid and up-to-date');
      }
    }
  });

  // Determine risk level
  let risk = 'LOW';
  if (riskScore >= 5) risk = 'HIGH';
  else if (riskScore >= 3) risk = 'MEDIUM';

  // Add general recommendations
  if (openPorts.length > 5) {
    recommendations.push('Consider closing unnecessary ports to reduce attack surface');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Regularly update your system and security patches');
  }

  return {
    target,
    openPorts,
    issues,
    risk,
    recommendations,
    riskScore: Math.min(riskScore, 7)
  };
}

// Scan endpoint
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify JWT token
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { target } = req.body;

    if (!target) {
      return res.status(400).json({ error: 'Target is required' });
    }

    // Perform simulated scan
    const scanResult = simulateScan(target);

    // Save scan to database
    const connection = await getConnection();
    await connection.execute(
      'INSERT INTO scans (user_id, target, result) VALUES (?, ?, ?)',
      [decoded.userId, target, JSON.stringify(scanResult)]
    );
    await connection.end();

    res.status(200).json(scanResult);

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
