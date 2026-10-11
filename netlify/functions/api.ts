import express from 'express';
import serverless from 'serverless-http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../../backend/src/lib/db';
import { apiRouter } from '../../backend/src/routes';

// Load environment variables
dotenv.config();

const app = express();

// Security and standard middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Connect to MongoDB
connectDB().catch(err => {
  console.error('[Netlify Function Database Initial Connection Error]:', err);
});

// Route handlers for various Netlify rewrite prefixes
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);
app.use('/', apiRouter);

export const handler = serverless(app);
