#!/usr/bin/env node

/**
 * Setup Script
 * Sets up the development environment for the Resume Scanner Frontend
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

// Check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  log(`Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 18) {
    logWarning('Node.js 18 or higher is recommended for optimal performance.');
  } else {
    logSuccess('Node.js version is compatible.');
  }
}

// Check if package.json exists
function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json not found. Please run this script from the project root.');
    process.exit(1);
  }
  logSuccess('package.json found.');
}

// Install dependencies
function installDependencies() {
  return new Promise((resolve, reject) => {
    log('Installing dependencies...');
    
    const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
    
    install.on('close', (code) => {
      if (code === 0) {
        logSuccess('Dependencies installed successfully!');
        resolve();
      } else {
        logError('Failed to install dependencies.');
        reject(new Error('npm install failed'));
      }
    });
  });
}

// Setup environment file
function setupEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log('Creating .env file from .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      logSuccess('.env file created successfully!');
      log('Please update .env with your API URL and other settings.');
    } else {
      logWarning('No .env.example file found. You may need to create .env manually.');
    }
  } else {
    logSuccess('.env file already exists.');
  }
}

// Run linting
function runLinting() {
  return new Promise((resolve) => {
    log('Running ESLint...');
    
    const lint = spawn('npm', ['run', 'lint'], { stdio: 'inherit', shell: true });
    
    lint.on('close', (code) => {
      if (code === 0) {
        logSuccess('Linting passed!');
      } else {
        logWarning('Linting found issues. Please fix them before committing.');
      }
      resolve();
    });
  });
}

// Test build
function testBuild() {
  return new Promise((resolve, reject) => {
    log('Testing production build...');
    
    const build = spawn('npx', ['vite', 'build'], { stdio: 'inherit', shell: true });
    
    build.on('close', (code) => {
      if (code === 0) {
        logSuccess('Production build test passed!');
        resolve();
      } else {
        logError('Production build test failed.');
        reject(new Error('Build test failed'));
      }
    });
  });
}

// Main setup function
async function setup() {
  try {
    log('Resume Scanner Frontend Setup');
    log('============================');
    
    checkNodeVersion();
    checkPackageJson();
    await installDependencies();
    setupEnvFile();
    await runLinting();
    await testBuild();
    
    logSuccess('Setup completed successfully!');
    log('');
    log('Next steps:');
    log('1. Update .env with your API URL and other settings');
    log('2. Run "npm run dev" to start the development server');
    log('3. Visit http://localhost:3000 to view the application');
    log('');
    log('Available commands:');
    log('- npm run dev: Start development server');
    log('- npm run build: Build for production');
    log('- npm run lint: Run ESLint');
    log('- npm run preview: Preview production build');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run setup
setup();
