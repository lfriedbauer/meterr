const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

const customerRooms = new Map();
const thresholds = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe:customer', ({ customerId }) => {
    socket.join(`customer:${customerId}`);
    customerRooms.set(socket.id, customerId);
    console.log(`Socket ${socket.id} subscribed to customer ${customerId}`);
  });

  socket.on('unsubscribe:customer', ({ customerId }) => {
    socket.leave(`customer:${customerId}`);
    customerRooms.delete(socket.id);
  });

  socket.on('set:thresholds', (data) => {
    const customerId = customerRooms.get(socket.id);
    if (customerId) {
      thresholds.set(customerId, data);
      console.log(`Thresholds set for customer ${customerId}:`, data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    customerRooms.delete(socket.id);
  });
});

// Simulate cost alerts (replace with real monitoring)
setInterval(() => {
  const mockAlert = {
    type: 'spike',
    amount: Math.random() * 100,
    model: 'gpt-4',
    timestamp: new Date().toISOString(),
    message: `Cost spike detected: $${(Math.random() * 100).toFixed(2)} in the last hour`
  };

  io.emit('cost-alert', mockAlert);
}, 30000); // Every 30 seconds for demo

// Simulate usage updates
setInterval(() => {
  const mockUsage = {
    customerId: 'demo-customer',
    model: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'][Math.floor(Math.random() * 3)],
    tokens: Math.floor(Math.random() * 1000),
    cost: Math.random() * 10,
    timestamp: new Date().toISOString()
  };

  io.to(`customer:${mockUsage.customerId}`).emit('usage-update', mockUsage);
}, 5000); // Every 5 seconds for demo

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  io.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});