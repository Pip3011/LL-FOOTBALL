import React, { useState } from 'react';
import { X, Monitor, Download, Terminal, Check, FolderArchive, ArrowRight, ShieldCheck, Play } from 'lucide-react';

interface DesktopPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopPackageModal: React.FC<DesktopPackageModalProps> = ({ isOpen, onClose }) => {
  const [downloadedLauncher, setDownloadedLauncher] = useState(false);

  if (!isOpen) return null;

  const downloadWindowsLauncher = () => {
    const launcherScript = `@echo off
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
    const blob = new Blob([launcherScript.replace(/\n/g, '\r\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Launch-PC-App.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedLauncher(true);
    setTimeout(() => setDownloadedLauncher(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">PC Offline Application Package</h2>
              <p className="text-xs text-slate-400">
                Run this entire application on any PC with zero internet required
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Method 1: The Packaging Script */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Option 1: Build Desktop App Bundle Script</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                Automated
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Run this command in the terminal to package the entire app into a ready-to-run desktop distribution:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 flex items-center justify-between">
              <span>npm run package:pc</span>
            </div>
            <p className="text-[11px] text-slate-400">
              This outputs a standalone <strong className="text-white">desktop-app/</strong> folder containing:
              <br />• <code className="text-emerald-400">Launch-PC-App.bat</code> (Windows double-click launcher)
              <br />• <code className="text-emerald-400">offline-server.js</code> (Zero-dependency offline engine)
              <br />• <code className="text-emerald-400">dist/</code> (Pre-compiled offline bundle)
            </p>
          </div>

          {/* Method 2: 1-Click PWA Installation on PC */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Option 2: Install as Native Windows App</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">
                No Terminal Needed
              </span>
            </div>
            <p className="text-xs text-slate-300">
              This application is configured as an installable Progressive Web App with offline service worker caching:
            </p>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal pl-4">
              <li>In your browser (Edge or Chrome), click the <strong>&ldquo;Install PC App&rdquo;</strong> button in the top bar.</li>
              <li>Or click the <strong>App Install icon</strong> in the browser URL bar.</li>
              <li>It installs directly to your <strong>Windows Desktop &amp; Start Menu</strong> and runs offline with no browser tabs!</li>
            </ol>
          </div>

          {/* Download Launcher Directly */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Windows Launcher (.bat)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                1-click batch script that opens the app in standalone window
              </p>
            </div>
            <button
              onClick={downloadWindowsLauncher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              {downloadedLauncher ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadedLauncher ? 'Downloaded!' : 'Download .bat'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Runs 100% offline with zero internet</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
