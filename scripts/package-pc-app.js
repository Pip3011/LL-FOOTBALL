import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.resolve(rootDir, 'desktop-app');

console.log('📦 Starting PC Application Packaging (No Internet Required)...');

// 1. Build client bundle
console.log('⚙️ Building production client bundle...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// 2. Prepare output directory
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// 3. Copy dist/ to desktop-app/dist/
console.log('📁 Copying static assets to desktop application bundle...');
const distSrc = path.resolve(rootDir, 'dist');
const distDest = path.resolve(outputDir, 'dist');
fs.cpSync(distSrc, distDest, { recursive: true });

// 4. Create standalone zero-dependency offline server
console.log('🖥️ Generating standalone zero-dependency offline server...');
const offlineServerCode = `
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, 'http://localhost:' + PORT);
  let pathname = urlObj.pathname;

  // Offline mock API responses
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (pathname === '/api/health') {
      res.end(JSON.stringify({ status: 'ok', offline: true, service: 'leisure-leagues-offline' }));
      return;
    }
    if (pathname === '/api/leagues/popular' || pathname === '/api/leagues/search') {
      // Returns offline popular leagues
      const popular = [
        { name: "Aylesbury Monday 6-a-side", venue: "Aylesbury Vale Academy", city: "Aylesbury", day: "Monday", format: "6-a-side", url: "https://www.leisureleagues.net/league/aylesbury-vale-academy/aylesbury-monday" },
        { name: "Manchester Sunday 6-a-side", venue: "Manchester Academy", city: "Manchester", day: "Sunday", format: "6-a-side", url: "https://www.leisureleagues.net/league/manchester-academy/manchester-sunday" },
        { name: "Curzon Ashton Sunday 6-a-side", venue: "Curzon Ashton Football Club", city: "Ashton-Under-Lyne", day: "Sunday", format: "6-a-side", url: "https://www.leisureleagues.net/league/curzon-ashton-football-club/ashton-under-lyne-sunday" },
        { name: "Curzon Ashton Monday 6-a-side", venue: "Curzon Ashton Football Club", city: "Ashton-Under-Lyne", day: "Monday", format: "6-a-side", url: "https://www.leisureleagues.net/league/curzon-ashton-football-club/ashton-under-lyne-monday" },
        { name: "Oldham Tuesday 6-a-side", venue: "Oasis Academy", city: "Oldham", day: "Tuesday", format: "6-a-side", url: "https://www.leisureleagues.net/league/oasis-academy/oldham-tuesday" },
        { name: "Salford Sunday 6-a-side", venue: "Albert Park", city: "Salford", day: "Sunday", format: "6-a-side", url: "https://www.leisureleagues.net/league/albert-park/salford-sunday" }
      ];
      res.end(JSON.stringify({ success: true, leagues: popular, offline: true }));
      return;
    }
  }

  // Serve static files
  let filePath = path.join(DIST_DIR, pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('⚽ Leisure Leagues Offline PC Application is running!');
  console.log('🌐 Local URL: http://localhost:' + PORT);
  console.log('⚡ Running 100% offline with zero internet required.');
});
`;
fs.writeFileSync(path.join(outputDir, 'offline-server.js'), offlineServerCode.trim());

// 5. Create Windows Batch Launcher (Launch-PC-App.bat)
console.log('🪟 Creating Windows PC 1-Click Launchers...');
const winBatchLauncher = `@echo off
title Leisure Leagues Offline Coordinator
echo ======================================================================
echo    LEISURE LEAGUES MATCHDAY COORDINATOR - PC OFFLINE APPLICATION
echo ======================================================================
echo.
echo Starting local offline server...
echo Running 100%% offline with zero internet required!
echo.
echo Launching application window...

:: Start the offline server in background
start "" /B node offline-server.js

:: Wait a brief moment for the server to bind
timeout /t 1 /nobreak >nul

:: Try opening in Microsoft Edge App Mode (Chromium standalone window)
start msedge.exe --app=http://localhost:3000 2>nul
if %ERRORLEVEL% EQU 0 goto done

:: Or try Google Chrome App Mode
start chrome.exe --app=http://localhost:3000 2>nul
if %ERRORLEVEL% EQU 0 goto done

:: Fallback to default browser
start http://localhost:3000

:done
echo.
echo App is now running at http://localhost:3000
echo You can minimize this window while using the application.
echo To close, simply close this window.
echo.
pause
`;
fs.writeFileSync(path.join(outputDir, 'Launch-PC-App.bat'), winBatchLauncher.replace(/\n/g, '\r\n'));

// 6. Create Silent VBScript Launcher (no cmd window)
const vbsLauncher = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "Launch-PC-App.bat", 0, False
`;
fs.writeFileSync(path.join(outputDir, 'Launch-Silent.vbs'), vbsLauncher.replace(/\n/g, '\r\n'));

// 7. Create Mac / Linux Launcher
const unixLauncher = `#!/usr/bin/env bash
echo "⚽ Starting Leisure Leagues Offline Application..."
node offline-server.js &
SERVER_PID=$!

sleep 1

if which open > /dev/null; then
  open "http://localhost:3000"
elif which xdg-open > /dev/null; then
  xdg-open "http://localhost:3000"
fi

echo "App running on http://localhost:3000 (PID: $SERVER_PID)"
wait $SERVER_PID
`;
fs.writeFileSync(path.join(outputDir, 'Launch-Mac-Linux.sh'), unixLauncher);
try {
  fs.chmodSync(path.join(outputDir, 'Launch-Mac-Linux.sh'), '755');
} catch {}

// 8. Create Offline Instructions Readme
const readme = `======================================================================
  LEISURE LEAGUES MATCHDAY & PITCH COORDINATOR - PC OFFLINE EDITION
======================================================================

HOW TO RUN ON YOUR PC (NO INTERNET NEEDED):

Method 1 (Recommended - Double-Click Launcher):
1. Make sure Node.js is installed on your PC (https://nodejs.org if needed).
2. Double-click "Launch-PC-App.bat".
3. The app will immediately launch in its own standalone window running 
   100% offline from your PC with no internet connection required!

Method 2 (Browser / PWA Native Installation):
1. In Microsoft Edge or Google Chrome, open: http://localhost:3000
2. Click the "Install App" icon in the address bar (or in the top header).
3. The application will be permanently installed onto your PC's Desktop 
   and Start Menu as a native application that opens with zero internet!

FEATURES AVAILABLE OFFLINE:
• Full fixture view and division management
• Pitch assignment & collision detection
• Referee roster & bulk assignment
• Extra time slots & extra pitch hire bookings
• One-click Plain Text Fixture Copy with Kick-off Time, Teams & Goal Scorers
• All assignments automatically saved locally on your PC!
======================================================================
`;
fs.writeFileSync(path.join(outputDir, 'README-OFFLINE-PC.txt'), readme.replace(/\n/g, '\r\n'));

console.log('✅ Packaging complete! Distribution created at: /desktop-app');
console.log('Files generated:');
console.log('  ├── Launch-PC-App.bat (Windows 1-click launcher)');
console.log('  ├── Launch-Silent.vbs (Silent launcher)');
console.log('  ├── Launch-Mac-Linux.sh (Mac/Linux launcher)');
console.log('  ├── offline-server.js (Zero-dependency offline engine)');
console.log('  ├── README-OFFLINE-PC.txt');
console.log('  └── dist/ (Built offline application bundle)');
