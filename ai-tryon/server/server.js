const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();
connectDB();

const app = express();

app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5173', 'http://127.0.0.1:5173']
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Static storage path for local file storage (users, outfit-previews, tryon-results)
app.use('/storage', express.static(path.join(__dirname, '../../storage')));

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 6000;
const server = app.listen(PORT, () => console.log(`AI Try-On Server running on port ${PORT}`));
server.timeout = 180000;
server.keepAliveTimeout = 185000;
server.headersTimeout = 190000;

// Trigger restart

// Trigger restart for port change

// Restart after killing orphan
