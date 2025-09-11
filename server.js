
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser'); 
const seedAdminUser = require('./utils/seedAdmin');

// Load env vars
dotenv.config();

// Connect to database
connectDB();
seedAdminUser();
const app = express();

app.use(cookieParser());
// View Engine Setup
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));
// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Enable CORS
app.use(cors({
  origin: '*', // به همه دامنه‌ها اجازه بده
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // به همه متدهای HTTP اجازه بده
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/questions', require('./routes/questions'));
app.use('/admin', require('./routes/admin'));
app.use('/api/quiz-attempts', require('./routes/quiz.js'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.get('/api/about-us',require('./admin/about-us'));
app.get('/', (req, res) => {
     res.send('API is running...');
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server started on port ${PORT} and listening on all interfaces`);
// });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});