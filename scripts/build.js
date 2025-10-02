#!/usr/bin/env node

/**
 * Build Script
 * Builds the React application for production with proper configuration
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

function logError(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log('No .env file found. Creating from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      log('Please update .env with your production settings.');
    } else {
      log('No .env file found. Using default environment variables.');
    }
  }
}

// Clean dist directory
function cleanDist() {
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    log('Cleaning dist directory...');
    fs.rmSync(distPath, { recursive: true, force: true });
  }
}

// Build the application
function buildApp() {
  log('Building React application for production...');
  
  const buildProcess = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      logSuccess('Build completed successfully!');
      log('Built files are available in the dist/ directory.');
      log('You can now deploy the dist/ directory to any static hosting service.');
    } else {
      logError('Build failed with code ' + code);
      process.exit(1);
    }
  });
}

// Main execution
function main() {
  log('Resume Scanner Frontend Build Script');
  log('====================================');
  
  checkEnvFile();
  cleanDist();
  buildApp();
}

main();
