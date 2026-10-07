import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import tripRoutes from './routes/trips';

dotenv.config(); // loaded env

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev
    'http://localhost:3000',  // Alt
    process.env.CLIENT_URL || '',
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'VoyageAI Express Server',
    version: '2.0.0',
    database: 'MongoDB Atlas',
    agentService: process.env.AGENT_SERVICE_URL || 'http://localhost:8000',
  });
});

// Agent service proxy — for frontend to check agent health
app.get('/api/agents/health', async (_req, res) => {
  try {
    const agentUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${agentUrl}/health`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(503).json({ status: 'unavailable', error: 'Agent service not reachable' });
  }
});

// Start server
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 VoyageAI Server running on http://localhost:${PORT}`);
    console.log(`   Agent Service: ${process.env.AGENT_SERVICE_URL || 'http://localhost:8000'}`);
    console.log(`   MongoDB: ${process.env.MONGODB_URI ? '✅ Atlas' : '⚠️  Local'}\n`);
  });
}

start().catch(console.error);

