const { spawn } = require('child_process');

console.log('Starting Next.js Dev Server and WebSocket Server...');

// Start socket server
const socketServer = spawn('node', ['socket-server.js'], { stdio: 'inherit' });

// Start Next.js server
const nextDev = spawn('npx', ['cross-env', "NODE_OPTIONS=--dns-result-order=ipv4first", 'next', 'dev'], { 
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\nShutting down servers...');
  try {
    socketServer.kill();
  } catch (e) {}
  try {
    nextDev.kill();
  } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
