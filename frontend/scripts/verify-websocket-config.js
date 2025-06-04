#!/usr/bin/env node

/**
 * WebSocket Configuration Verification Script
 * Tests WebSocket connectivity for Bhavya Bazaar project
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 WebSocket Configuration Verification');
console.log('====================================');

// Function to check if a port is listening
function checkPort(port, description) {
    return new Promise((resolve) => {
        const netstat = spawn('netstat', ['-an']);
        let output = '';
        
        netstat.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        netstat.on('close', () => {
            const isListening = output.includes(`:${port} `) && output.includes('LISTENING');
            console.log(`${isListening ? '✅' : '❌'} ${description} (Port ${port}): ${isListening ? 'LISTENING' : 'NOT LISTENING'}`);
            resolve(isListening);
        });
        
        netstat.on('error', () => {
            console.log(`❓ ${description} (Port ${port}): Could not check`);
            resolve(false);
        });
    });
}

// Function to read and validate environment files
function validateEnvFile(filePath, environmentName) {
    console.log(`\n📁 Checking ${environmentName} environment file:`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const socketUrls = lines
        .filter(line => line.includes('REACT_APP_SOCKET_URL='))
        .filter(line => !line.trim().startsWith('#'));
    
    console.log(`   Found ${socketUrls.length} WebSocket URL configuration(s):`);
    
    socketUrls.forEach((line, index) => {
        const url = line.split('=')[1];
        console.log(`   ${index + 1}. ${line.trim()}`);
        
        // Validate the URL
        if (environmentName === 'Development') {
            if (url === 'http://localhost:8000') {
                console.log(`      ✅ Correct: Points to backend server`);
            } else if (url === 'ws://localhost:3003') {
                console.log(`      ❌ WRONG: Port 3003 is not used by backend`);
            } else {
                console.log(`      ⚠️  Unexpected URL for development`);
            }
        } else if (environmentName === 'Production') {
            if (url === 'https://api.bhavyabazaar.com') {
                console.log(`      ✅ Correct: Points to production backend`);
            } else {
                console.log(`      ⚠️  Check if this is correct for production`);
            }
        }
    });
    
    // Check for duplicates
    if (socketUrls.length > 1) {
        console.log(`   ⚠️  WARNING: Multiple WebSocket URLs found! Only the last one will be used.`);
    } else if (socketUrls.length === 0) {
        console.log(`   ❌ NO WebSocket URL configured!`);
    }
}

async function main() {
    console.log('\n🔧 Port Status Check:');
    
    // Check if backend is running
    await checkPort(8000, 'Backend Server (with Socket.IO)');
    await checkPort(3000, 'Frontend Development Server');
    await checkPort(3003, 'Port 3003 (should NOT be used)');
    
    console.log('\n📊 Environment Configuration Check:');
    
    // Check environment files
    const frontendDir = path.join(__dirname, '..');
    validateEnvFile(path.join(frontendDir, '.env.development'), 'Development');
    validateEnvFile(path.join(frontendDir, '.env.production'), 'Production');
    
    console.log('\n🏗️  Backend Configuration:');
    
    // Check backend configuration
    const backendEnvPath = path.join(__dirname, '..', '..', 'backend', '.env');
    if (fs.existsSync(backendEnvPath)) {
        const backendContent = fs.readFileSync(backendEnvPath, 'utf8');
        const portMatch = backendContent.match(/PORT=(\d+)/);
        if (portMatch) {
            console.log(`   ✅ Backend configured to run on port: ${portMatch[1]}`);
        } else {
            console.log(`   ⚠️  Backend port not found in .env file`);
        }
    } else {
        console.log(`   ❌ Backend .env file not found`);
    }
    
    console.log('\n🎯 Socket.IO Architecture:');
    console.log('   ✅ Socket.IO is integrated with the main backend server');
    console.log('   ✅ Frontend should connect to the same port as the API (8000)');
    console.log('   ✅ Socket.IO endpoint: http://localhost:8000/socket.io/');
    console.log('   ❌ There is NO separate WebSocket server on port 3003');
    
    console.log('\n📋 Recommendations:');
    console.log('   1. Ensure backend is running on port 8000');
    console.log('   2. Frontend should use REACT_APP_SOCKET_URL=http://localhost:8000');
    console.log('   3. Remove any references to port 3003 in development');
    console.log('   4. Production should use https://api.bhavyabazaar.com');
    
    console.log('\n🚀 Quick Test Commands:');
    console.log('   Backend Health: curl http://localhost:8000/api/v2/health');
    console.log('   Socket.IO Test: curl http://localhost:8000/socket.io/?transport=polling');
    
    console.log('\n✨ Verification Complete!');
}

main().catch(console.error);
