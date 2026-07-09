import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from "path";
import { connectDB } from './config/db.js';
import { fileURLToPath } from "url";
import userRoute from './routes/userRoute.js';
import providerRoute from './routes/providerRoute.js';
import gameRoute from './routes/gameRoute.js';
import cricketGameRoute from './routes/cricketGameRoute.js';
import gameLaunchRoute from './routes/GameLaunchRoute.js';
import cookieParser from "cookie-parser";
// const __filename = fileURLToPath(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const PORT = process.env.PORT || 4001;

const app = express();



/* =====================
   MIDDLEWARES
===================== */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        connectSrc: [
          "'self'",
          "https://api-doc.space",
          "https://playnosys.live",
          "ws:",
          "wss:"
        ],

        imgSrc: ["'self'", "data:", "https:"],

        scriptSrc: ["'self'", "'unsafe-inline'"],

        styleSrc: ["'self'", "'unsafe-inline'"],

        fontSrc: ["'self'", "https:", "data:"]
      },
    },
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:5173", 
      "http://localhost:5174", 
      "https://api-doc.space", 
      "https://playnosys.live"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(morgan(process.env.LOG_FORMAT || 'dev'));

/* =======================
   HEALTH CHECK
======================= */

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* =======================
   ROUTES
======================= */

app.use('/api', userRoute);
app.use('/api', providerRoute);
app.use('/api', gameRoute);
app.use('/api', cricketGameRoute);
app.use('/api', gameLaunchRoute);

app.use(express.static(path.join(__dirname, "client/dist")));

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    return res.sendFile(
      path.join(__dirname, "client/dist/index.html")
    );
  }
  next();
});



/* =======================
   ERROR HANDLER
======================= */

app.use((err, _req, res, _next) => {
  console.error('🔥 Error:', err);
  res.status(500).json({ error: 'internal_error' });
});

/* =======================
   START SERVER
======================= */

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http:${PORT}`);
});

/* =======================
   GRACEFUL SHUTDOWN
======================= */

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
