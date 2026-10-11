import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './backend/src/lib/db';
import { apiRouter } from './backend/src/routes';

// Load environment variables
dotenv.config();

const app = express();

// Security and standard middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mount the modular REST API
app.use('/api', apiRouter);

// Database init
connectDB().catch(err => {
  console.error('[Database] Initial connection attempt:', err);
});

// Vite Integration & Static Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProduction) {
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), 'vite.config.ts'),
      server: {
        middlewareMode: true,
        hmr: {
          server: server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  let currentPort = Number(process.env.PORT) || 3000;

  function tryListen(port: number) {
    server.removeAllListeners('error');
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.warn(`⚠️ Port ${port} is currently busy. Automatically trying port ${nextPort}...`);
        tryListen(nextPort);
      } else {
        console.error('Server error:', err);
      }
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Foundlily Full-Stack running on http://localhost:${port}`);
      console.log(`📚 REST API mounted at http://localhost:${port}/api`);
    });
  }

  tryListen(currentPort);
}

startServer();
