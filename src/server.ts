import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';

// --- CONFIGURATION ---
const app = Fastify({ logger: true });
app.register(fastifyWebsocket);

// FIXED: Use 'any' map to allow any type of connection object
const clients = new Map<string, any>();

// --- MOCK ROUTER ---
async function getBestRoute(amount: number) {
  await new Promise(r => setTimeout(r, 500));
  const basePrice = 100;
  const raydium = basePrice * (0.98 + Math.random() * 0.04);
  const meteora = basePrice * (0.97 + Math.random() * 0.05);
  
  if (raydium > meteora) return { dex: 'Raydium', price: raydium };
  return { dex: 'Meteora', price: meteora };
}

// --- WORKER ---
async function processOrder(orderId: string, amount: number) {
  const notify = (status: string, data?: any) => {
    const client = clients.get(orderId);
    // FIXED: safely check if client exists and is open
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ status, ...data }));
    }
    console.log(`Order ${orderId}: ${status}`);
  };

  try {
    notify('routing');
    const route = await getBestRoute(amount);
    
    notify('building', { dex: route.dex, price: route.price.toFixed(2) });
    await new Promise(r => setTimeout(r, 1000));
    
    notify('submitted');
    await new Promise(r => setTimeout(r, 1500));
    
    const txHash = 'sol_' + Math.random().toString(36).substring(7);
    notify('confirmed', { txHash, finalPrice: route.price.toFixed(2) });
    
  } catch (err) {
    notify('failed', { error: 'Transaction failed' });
  }
}

// --- API ROUTES ---
app.post('/api/orders/execute', async (req: any, reply) => {
  const orderId = uuidv4();
  const { amount } = req.body || { amount: 10 };
  
  processOrder(orderId, amount);
  
  return { orderId, status: 'pending', message: 'Connect to WebSocket for updates' };
});

// FIXED: connection is typed as 'any' to prevent 'Property socket does not exist' error
app.get('/ws/orders/:orderId', { websocket: true }, (connection: any, req: any) => {
  const { orderId } = req.params;
  // Handle both cases: if connection IS the socket, or HAS the socket
  const socket = connection.socket || connection;
  clients.set(orderId, socket);
  console.log(`Client connected: ${orderId}`);
});

// --- START SERVER ---
const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
start();
