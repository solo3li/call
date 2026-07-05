import axios from 'axios';
import { spawn } from 'child_process';

const startServer = () => {
  return spawn('npx', ['expo', 'start', '--web'], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });
};

const testConnection = async (retries = 10) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get('http://localhost:8081');
      if (res.status === 200 && res.data.includes('<div id="root">')) {
        console.log('✅ Driver App is successfully running on the web (localhost:8081)!');
        return true;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.log('❌ Failed to connect to the driver app web server.');
  return false;
};

const run = async () => {
  console.log('Starting Expo Web Server...');
  const server = startServer();
  
  const success = await testConnection();
  
  console.log('Shutting down server...');
  server.kill();
  process.exit(success ? 0 : 1);
};

run();
