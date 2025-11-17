const express = require('express');
const app = express();
require('dotenv').config();
const mediaRouter = require('./routes/media');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.use('/media', mediaRouter);
app.get('/', (req, res) => res.redirect('/media'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
