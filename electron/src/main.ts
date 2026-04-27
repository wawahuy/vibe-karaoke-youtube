import { app, BrowserWindow, shell, utilityProcess, UtilityProcess } from 'electron';
import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs';

/** Parse a .env file into key/value pairs (no shell expansion, handles quotes). */
function loadDotEnv(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) return {};
  const vars: Record<string, string> = {};
  for (const raw of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim().replace(/^(["'])(.*?)\1$/, '$2');
    vars[key] = val;
  }
  return vars;
}

/** Read user-saved path overrides from paths.json in userData. */
function loadPathsConfig(): { dataDir?: string; cacheDir?: string } {
  const configFile = path.join(app.getPath('userData'), 'paths.json');
  if (!fs.existsSync(configFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  } catch {
    return {};
  }
}

const BACKEND_PORT = 3123;
let backendProcess: UtilityProcess | null = null;

function getBackendRoot(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend');
  }
  return path.join(__dirname, '../../backend');
}

function getFrontendDist(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'frontend-dist');
  }
  return path.join(__dirname, '../../frontend/dist');
}

function waitForBackend(retries = 60, delayMs = 500): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const req = http.get(`http://localhost:${BACKEND_PORT}/api/settings`, (res) => {
        if (res.statusCode !== undefined && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
        res.resume();
      });
      req.on('error', () => retry());
      req.setTimeout(300, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      attempts++;
      if (attempts >= retries) {
        reject(new Error(`Backend did not start after ${retries * delayMs}ms`));
      } else {
        setTimeout(check, delayMs);
      }
    };
    setTimeout(check, delayMs);
  });
}

function startBackend(): void {
  const backendRoot = getBackendRoot();
  const pathsConfig = loadPathsConfig();
  const dataDir = pathsConfig.dataDir || path.join(app.getPath('userData'), 'data');
  const cacheDir = pathsConfig.cacheDir || path.join(dataDir, 'video-cache');
  const frontendDist = getFrontendDist();
  const mainScript = path.join(backendRoot, 'dist', 'main.js');

  const dotEnvVars = loadDotEnv(path.join(backendRoot, '.env'));

  backendProcess = utilityProcess.fork(mainScript, [], {
    cwd: backendRoot,
    env: {
      ...process.env,
      ...dotEnvVars,
      PORT: String(BACKEND_PORT),
      DATA_DIR: dataDir,
      CACHE_DIR: cacheDir,
      FRONTEND_DIST: frontendDist,
    },
    stdio: 'pipe',
  });

  backendProcess.stdout?.on('data', (data: Buffer) => {
    console.log('[backend]', data.toString().trimEnd());
  });
  backendProcess.stderr?.on('data', (data: Buffer) => {
    console.error('[backend]', data.toString().trimEnd());
  });
  backendProcess.on('exit', (code: number) => {
    console.log(`[backend] exited with code ${code}`);
    backendProcess = null;
  });
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    title: 'YouTube Karaoke',
  });

  win.once('ready-to-show', () => win.show());

  // Open external links in the system browser, keep local URLs in the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://localhost:${BACKEND_PORT}`)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.loadURL(`http://localhost:${BACKEND_PORT}`);
  return win;
}

app.whenReady().then(async () => {
  startBackend();
  try {
    await waitForBackend();
  } catch (err) {
    console.error('Backend startup failed:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
