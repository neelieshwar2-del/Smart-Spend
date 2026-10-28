import os from 'os';
import { app } from './app.js';
import { config } from './config/index.js';
import { prisma } from './prisma/client.js';

function getNetworkAddresses(): { name: string; address: string }[] {
  const interfaces = os.networkInterfaces();
  const addresses: { name: string; address: string }[] = [];
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (ifaceList) {
      for (const net of ifaceList) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push({ name, address: net.address });
        }
      }
    }
  }
  return addresses;
}

const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  SmartSpend Backend API Server Started Successfully  `);
  console.log(`======================================================`);
  console.log(`  > Local:       http://localhost:${config.PORT}${config.API_PREFIX}`);
  console.log(`  > Health:      http://localhost:${config.PORT}${config.API_PREFIX}/health`);

  const netAddrs = getNetworkAddresses();
  netAddrs.forEach(net => {
    console.log(`  > Network (${net.name}): http://${net.address}:${config.PORT}${config.API_PREFIX}`);
  });
  console.log(`======================================================\n`);
});

// Graceful Shutdown
async function handleShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Gracefully shutting down SmartSpend API server...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database connection disconnected.');
    } catch (e) {
      // safe ignore
    }
    console.log('Server process terminated.');
    process.exit(0);
  });

  // Force exit if not closed within 5 seconds
  setTimeout(() => {
    console.error('Forcefully terminating server.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
