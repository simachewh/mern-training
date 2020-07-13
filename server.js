const express = require('express');
const connectDB = require('./config/db')


const app = express();

connectDB();

// Init middleware
app.use(express.json({
    extended: false
}));

app.get('/', (req, res) => res.send('API running'));

// definee routes
app.use('/users', require('./routes/api/users'));
app.use('/profile', require('./routes/api/profile'));
app.use('/auth', require('./routes/api/auth'));
app.use('/postts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running ar port ${PORT}`));