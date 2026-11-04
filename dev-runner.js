const { spawn } = require('child_process');
const path = require('path');

console.log('\n🚀 ចាប់ផ្តើមប្រព័ន្ធសិក្សា English for Education Studies I...');
console.log('------------------------------------------------------------');

const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

const client = spawn('npm.cmd', ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

function cleanup() {
  console.log('\n🛑 កំពុងបិទប្រព័ន្ធ...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

