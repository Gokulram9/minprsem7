const http = require('http');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
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
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5175' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Legal Aid Portal API is running.' });
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

