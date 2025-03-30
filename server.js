require('dotenv').config(); // Load environment variables at the top

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const medicineRoutes = require('./routes/medicineRoutes');
const authRoutes = require('./routes/authRoutes');
const alertRoutes = require('./routes/alertRoutes');
const { setupScheduledTasks } = require('./utils/scheduler');

// Debugging: Check if environment variables are loaded
console.log("🔍 Checking environment variables...");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "❌ Undefined!");
console.log("PORT:", process.env.PORT || 5000);

// Initialize express app
const app = express();

// ✅ Enhanced CORS Configuration (Allow Netlify & Localhost)
app.use(cors({
  origin: ['http://localhost:3000', 'https://medicine-management-system.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Debug route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Routes
app.use('/api/medicines', medicineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).send({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    setupScheduledTasks(); // Set up alerts & tasks
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Server Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
