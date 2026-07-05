const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const viteEntry = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const nodemonEntry = path.join(rootDir, 'backend', 'node_modules', 'nodemon', 'bin', 'nodemon.js');

const sharedEnv = {
  ...process.env,
  NODE_ENV: 'development',
};

const spawnProcess = (command, args, options = {}) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    cwd: options.cwd || rootDir,
    env: { ...sharedEnv, ...(options.env || {}) },
    shell: false,
  });

  child.on('error', (error) => {
    console.error(`[dev] Failed to start ${options.name || command}:`, error.message);
    process.exitCode = 1;
  });

  return child;
};

const frontend = spawnProcess(process.execPath, [viteEntry], { name: 'frontend' });
const backend = spawnProcess(process.execPath, [nodemonEntry, 'index.js'], {
  cwd: path.join(rootDir, 'backend'),
  name: 'backend',
  env: { NODE_ENV: 'development' },
});

const shutdown = (signal) => {
  if (!frontend.killed) frontend.kill(signal);
  if (!backend.killed) backend.kill(signal);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

frontend.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[dev] Frontend exited with code ${code}`);
    shutdown('SIGTERM');
  }
});

backend.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[dev] Backend exited with code ${code}`);
    shutdown('SIGTERM');
  }
});
