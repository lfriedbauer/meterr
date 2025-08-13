#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Get the server name from command line args
const serverName = process.argv[2] || 'llm-research';

// Path to the config file
const configPath = path.join(__dirname, '..', 'mcp-config.json');

// Run mcp-inspector-cli with the config
const args = [
  '--config', configPath,
  '--server', serverName,
  '--cli'
];

console.log(`Starting MCP Inspector for server: ${serverName}`);
console.log(`Using config: ${configPath}`);

const inspector = spawn('mcp-inspector-cli', args, {
  stdio: 'inherit',
  shell: true
});

inspector.on('close', (code) => {
  console.log(`MCP Inspector exited with code ${code}`);
  process.exit(code);
});

inspector.on('error', (err) => {
  console.error('Failed to start MCP Inspector:', err);
  process.exit(1);
});