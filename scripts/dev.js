#!/usr/bin/env node

/**
 * Development Server Script
 * Starts the Vite development server with proper configuration
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}[INFO]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      logWarning('No .env file found. Creating from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      log('Please update .env with your API URL and other settings.');
    } else {
      logWarning('No .env file found. You may need to create one manually.');
    }
  }
}

// Check if node_modules exists
function checkDependencies() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('Installing dependencies...');
    const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
    
    install.on('close', (code) => {
      if (code === 0) {
        logSuccess('Dependencies installed successfully!');
        startDevServer();
      } else {
        logError('Failed to install dependencies.');
        process.exit(1);
      }
    });
  } else {
    startDevServer();
  }
}

// Start the development server
function startDevServer() {
  log('Starting React development server on http://localhost:3000...');
  log('Make sure your backend API is running on http://localhost:8000');
  log('Press Ctrl+C to stop the server');
  
  const devServer = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });
  
  devServer.on('close', (code) => {
    if (code === 0) {
      logSuccess('Development server stopped.');
    } else {
      logError('Development server exited with code ' + code);
    }
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    log('Stopping development server...');
    devServer.kill('SIGINT');
  });
}

// Main execution
function main() {
  log('Resume Scanner Frontend Development Server');
  log('==========================================');
  
  checkEnvFile();
  checkDependencies();
}

main();
