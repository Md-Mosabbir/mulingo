import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import cors from 'cors'


const app: Application = express();
const port = process.env.PORT || 3000;




app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Allow your React app
  credentials: true
}));

// Routes
app.use('/auth', authRoutes);

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



