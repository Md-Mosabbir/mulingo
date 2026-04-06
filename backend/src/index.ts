import express, { Application, Request, Response } from 'express';


const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Boilerplate health route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is healthy' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
