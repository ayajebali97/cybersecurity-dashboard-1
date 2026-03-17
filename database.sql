-- Cybersecurity Dashboard Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS cybersecurity_dashboard;
USE cybersecurity_dashboard;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scans table
CREATE TABLE scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target VARCHAR(255) NOT NULL,
    result TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for better performance
CREATE INDEX idx_user_id ON scans(user_id);
CREATE INDEX idx_email ON users(email);
