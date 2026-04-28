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

app.get('/debug/user-sql-check', async (req: Request, res: Response) => {
  // #region agent log
  fetch('http://127.0.0.1:7438/ingest/21726050-dd8e-4b71-9db2-be2af43eee7d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bda4c4'},body:JSON.stringify({sessionId:'bda4c4',runId:'pre-fix',hypothesisId:'H0',location:'backend/src/index.ts:42',message:'Entered /debug/user-sql-check route',data:{method:req.method,path:req.path},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  try {
    const userSqlModule = await import('./sql/authentication/user.sql');
    const userSqlObject = userSqlModule?.userSql;
    const getLanguagesQuery = userSqlObject?.getLanguages;
    const languageUpdateQuery = userSqlObject?.languageUpdate;

    // #region agent log
    fetch('http://127.0.0.1:7438/ingest/21726050-dd8e-4b71-9db2-be2af43eee7d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bda4c4'},body:JSON.stringify({sessionId:'bda4c4',runId:'pre-fix',hypothesisId:'H3',location:'backend/src/index.ts:53',message:'Imported user.sql module',data:{hasUserSql:!!userSqlObject,keys:userSqlObject?Object.keys(userSqlObject):[]},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7438/ingest/21726050-dd8e-4b71-9db2-be2af43eee7d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bda4c4'},body:JSON.stringify({sessionId:'bda4c4',runId:'pre-fix',hypothesisId:'H4',location:'backend/src/index.ts:57',message:'Validated SQL query strings',data:{getLanguagesType:typeof getLanguagesQuery,languageUpdateType:typeof languageUpdateQuery,languageUpdatePlaceholderCount:typeof languageUpdateQuery==='string'?(languageUpdateQuery.match(/\?/g)||[]).length:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    res.status(200).json({
      ok: true,
      moduleLoaded: true,
      getLanguagesType: typeof getLanguagesQuery,
      languageUpdateType: typeof languageUpdateQuery,
    });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7438/ingest/21726050-dd8e-4b71-9db2-be2af43eee7d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bda4c4'},body:JSON.stringify({sessionId:'bda4c4',runId:'pre-fix',hypothesisId:'H1',location:'backend/src/index.ts:69',message:'Failed to import user.sql module',data:{name:error?.name,message:error?.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    res.status(500).json({ ok: false, error: error?.message ?? 'Unknown error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



