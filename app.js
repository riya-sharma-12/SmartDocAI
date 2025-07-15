const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const dns = require('dns');

const userRouter = require('./routes/user.routes.js');
const aiRouter = require('./routes/ai.routes.js');
const authMiddleware = require('./middlewares/authe'); // import here

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
require('./config/db.js')();

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => res.render('landing'));

// 🚀 PUT AUTH MIDDLEWARE AT ROOT FOR /user
app.use('/user', userRouter);

app.use('/api', aiRouter);

app.listen(3000, () => console.log('🚀 Server on http://localhost:3000'));
