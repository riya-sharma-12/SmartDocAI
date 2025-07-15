// resetUsers.js
const mongoose = require('mongoose');

async function resetUsers() {
    await mongoose.connect('mongodb://127.0.0.1:27017/men-drive');
    console.log('Connected to MongoDB');

    await mongoose.connection.collection('users').deleteMany({});
    console.log('All users deleted.');

    mongoose.disconnect();
}

resetUsers();
