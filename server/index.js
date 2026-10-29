const path = require('path');
const dotenv = require('dotenv');

// Load environment variables early from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { initializeSocket } = require('./config/socket');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const hearingRoutes = require('./routes/hearingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const documentRoutes = require('./routes/documentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const judgmentRoutes = require('./routes/judgmentRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const casePartyRoutes = require('./routes/casePartyRoutes');
const judgeRoutes = require('./routes/judgeRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
initializeSocket(server);

// Setup Morgan request log streaming into Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || isLocalhost) {
      return callback(null, origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const rootUploads = path.join(__dirname, '..', 'uploads');
const serverUploads = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(rootUploads)) require('fs').mkdirSync(rootUploads, { recursive: true });
if (!require('fs').existsSync(serverUploads)) require('fs').mkdirSync(serverUploads, { recursive: true });
app.use('/uploads', express.static(rootUploads));
app.use('/uploads', express.static(serverUploads));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 120 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/judgments', judgmentRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/cases', casePartyRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/judges', judgeRoutes);

app.get('/api/health', async (_req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const isDbReady = mongoose.connection.readyState === 1;
  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';

  let aiStatus = 'unreachable';
  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResp = await axios.get(`${aiUrl}/health`, { timeout: 1500 });
    if (aiResp.status === 200) aiStatus = 'connected';
  } catch (e) {
    aiStatus = 'offline';
  }

  const emailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

  res.json({
    status: isDbReady ? 'healthy' : 'degraded',
    service: 'Court Case Allocation & Legal Aid Management Portal',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: {
      status: dbState,
      connected: isDbReady,
      name: mongoose.connection.name || 'court_case_db',
      clusterType: mongoose.connection.host ? (mongoose.connection.host.includes('mongodb.net') ? 'MongoDB Atlas Cluster' : 'Local In-Memory MongoDB') : 'unknown'
    },
    aiRecommender: {
      status: aiStatus,
      endpoint: (process.env.AI_SERVICE_URL || 'http://localhost:8000')
    },
    emailService: {
      status: emailConfigured ? 'smtp_configured' : 'simulation_mode',
      from: process.env.SMTP_FROM || 'no-reply@legalaid.gov'
    }
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed if database is empty
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Auto-seeding initial data...');
      const seed = require('./seed');
      await seed();
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Auto-schedule daily check for tomorrow's hearings
      const { checkTomorrowHearings } = require('./services/reminderService');
      setInterval(() => {
        console.log('⏰ Running automatic background tomorrow-hearings check...');
        checkTomorrowHearings()
          .then(res => {
            if (res.length > 0) {
              console.log(`⏰ Dispatched ${res.length} tomorrow-hearing notifications.`);
            }
          })
          .catch(err => console.error('⏰ Tomorrow check failed:', err));
      }, 12 * 60 * 60 * 1000); // 12 hrs
    });
  } catch (error) {
    const errorMsg = error?.message || String(error || '');
    const safeMsg = errorMsg.replace(/\/\/(.*?):(.*?)@/g, '//' + '$1:****@');
    console.error('❌ Failed to start server:', safeMsg);
    process.exit(1);
  }
};

startServer();

