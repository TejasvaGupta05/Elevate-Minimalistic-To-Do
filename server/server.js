require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const clientUrl = process.env.CLIENT_URL?.trim().replace(/\/+$/, '');
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (clientUrl) allowedOrigins.push(clientUrl);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy does not allow origin ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

connectDB();

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
