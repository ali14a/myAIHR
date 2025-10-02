#!/usr/bin/env node

/**
 * Docker Management Script
 * Provides convenient Docker commands for development and production
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

// Check if Docker is available
function checkDocker() {
  return new Promise((resolve, reject) => {
    const dockerCheck = spawn('docker', ['--version'], { stdio: 'pipe', shell: true });
    
    dockerCheck.on('close', (code) => {
      if (code === 0) {
        logSuccess('Docker is available.');
        resolve();
      } else {
        logError('Docker is not available. Please install Docker first.');
        reject(new Error('Docker not found'));
      }
    });
  });
}

// Check if docker-compose is available
function checkDockerCompose() {
  return new Promise((resolve, reject) => {
    const composeCheck = spawn('docker-compose', ['--version'], { stdio: 'pipe', shell: true });
    
    composeCheck.on('close', (code) => {
      if (code === 0) {
        logSuccess('Docker Compose is available.');
        resolve();
      } else {
        logError('Docker Compose is not available. Please install Docker Compose first.');
        reject(new Error('Docker Compose not found'));
      }
    });
  });
}

// Run Docker command
function runDockerCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    log(description);
    
    const dockerProcess = spawn(command, args, { stdio: 'inherit', shell: true });
    
    dockerProcess.on('close', (code) => {
      if (code === 0) {
        logSuccess(`${description} completed successfully!`);
        resolve();
      } else {
        logError(`${description} failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Development commands
async function dev() {
  try {
    await checkDocker();
    await checkDockerCompose();
    await runDockerCommand('docker-compose', ['-f', 'docker/docker-compose.dev.yml', 'up', '--build'], 'Starting development environment');
  } catch (error) {
    logError(`Development setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function stopDev() {
  try {
    await runDockerCommand('docker-compose', ['-f', 'docker/docker-compose.dev.yml', 'down'], 'Stopping development environment');
  } catch (error) {
    logError(`Failed to stop development environment: ${error.message}`);
    process.exit(1);
  }
}

async function logsDev() {
  try {
    await runDockerCommand('docker-compose', ['-f', 'docker/docker-compose.dev.yml', 'logs', '-f'], 'Viewing development logs');
  } catch (error) {
    logError(`Failed to view development logs: ${error.message}`);
    process.exit(1);
  }
}

// Production commands
async function prod() {
  try {
    await checkDocker();
    await checkDockerCompose();
    await runDockerCommand('docker-compose', ['-f', 'docker/docker-compose.prod.yml', 'up', '--build'], 'Starting production environment');
  } catch (error) {
    logError(`Production setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function stopProd() {
  try {
    await runDockerCommand('docker-compose', ['-f', 'docker/docker-compose.prod.yml', 'down'], 'Stopping production environment');
  } catch (error) {
    logError(`Failed to stop production environment: ${error.message}`);
    process.exit(1);
  }
}

async function logsProd() {
  try {
    await runDockerCommand('docker-compose', ['-f', 'docker/docker-compose.prod.yml', 'logs', '-f'], 'Viewing production logs');
  } catch (error) {
    logError(`Failed to view production logs: ${error.message}`);
    process.exit(1);
  }
}

// Build commands
async function build() {
  try {
    await checkDocker();
    await runDockerCommand('docker', ['build', '-f', 'docker/Dockerfile', '-t', 'resume-scanner-frontend', '.'], 'Building production image');
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

async function buildDev() {
  try {
    await checkDocker();
    await runDockerCommand('docker', ['build', '-f', 'docker/Dockerfile.dev', '-t', 'resume-scanner-frontend:dev', '.'], 'Building development image');
  } catch (error) {
    logError(`Development build failed: ${error.message}`);
    process.exit(1);
  }
}

async function buildProd() {
  try {
    await checkDocker();
    await runDockerCommand('docker', ['build', '-f', 'docker/Dockerfile.prod', '-t', 'resume-scanner-frontend:prod', '.'], 'Building production image with enhanced security');
  } catch (error) {
    logError(`Production build failed: ${error.message}`);
    process.exit(1);
  }
}

// Cleanup commands
async function clean() {
  try {
    await runDockerCommand('docker', ['system', 'prune', '-f'], 'Cleaning up Docker resources');
    await runDockerCommand('docker', ['volume', 'prune', '-f'], 'Cleaning up Docker volumes');
    logSuccess('Docker cleanup completed!');
  } catch (error) {
    logError(`Cleanup failed: ${error.message}`);
    process.exit(1);
  }
}

// Health check
async function health() {
  try {
    await runDockerCommand('docker', ['ps', '--format', 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'], 'Checking container health');
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    process.exit(1);
  }
}

// Show help
function showHelp() {
  console.log(`
Resume Scanner Frontend Docker Management

Usage: node scripts/docker.js <command>

Commands:
  dev         Start development environment
  stop-dev    Stop development environment
  logs-dev    View development logs
  prod        Start production environment
  stop-prod   Stop production environment
  logs-prod   View production logs
  build       Build production image
  build-dev   Build development image
  build-prod  Build production image with enhanced security
  clean       Clean up Docker resources
  health      Check container health
  help        Show this help message

Examples:
  node scripts/docker.js dev
  node scripts/docker.js build
  node scripts/docker.js clean
`);
}

// Main execution
function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  const commands = {
    'dev': dev,
    'stop-dev': stopDev,
    'logs-dev': logsDev,
    'prod': prod,
    'stop-prod': stopProd,
    'logs-prod': logsProd,
    'build': build,
    'build-dev': buildDev,
    'build-prod': buildProd,
    'clean': clean,
    'health': health
  };
  
  if (commands[command]) {
    commands[command]();
  } else {
    logError(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
}

main();
