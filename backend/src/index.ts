import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import cors from 'cors'
import helmet from 'helmet';
import { createServer } from 'http';
import { initSocket } from './socket';
import searchRoutes from './routes/searchRoutes';
import chatRoutes from "./routes/chatRoutes"
import userRoutes from './routes/userRoutes';
import roomRoutes from './routes/roomRoutes';
import groupRoutes from './routes/groupRoutes';
import llmRoutes from './routes/llmRoutes';
import { globalApiLimiter } from './middleware/security';
import reportRoutes from './routes/reportRoutes';


const app: Application = express();

const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const httpServer = createServer(app)



initSocket(httpServer)

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json());
app.use(globalApiLimiter);

app.use(cors({
  origin: (origin, callback) => {
    // Allow browserless tools and same-origin requests without an Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Routes
app.use('/auth', authRoutes);
app.use('/search', searchRoutes)
app.use("/chat", chatRoutes)
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/groups', groupRoutes);
app.use('/llm', llmRoutes);
app.use('/reports', reportRoutes);

// Boilerplate health route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

app.get('/test-db', async (req: Request, res: Response) => {
  try {
    // You "call" the db by using the pool imported from db.ts
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ status: 'connected', data: rows });
  } catch (error) {
    console.error('Database connection failed:', error); // Essential logging
    res.status(500).json({ error: 'Database connection failed' });
  }
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port} with socket`);
});



