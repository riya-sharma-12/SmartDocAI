// //Creating a schema

// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         unique: true,
//         minlength : [3, 'Username must be 3 letters']
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         lowercase: true,
//         unique: true,
//         minlength: [11, 'Email must be atleast 11 letters']
//     },
//     password: {
//         type: String,
//         required: true,
//         trim: true,
//         minlength: [3, 'Password must be 3 letters atleast']
//     }
// })

// const user = mongoose.model('user',userSchema)
// //Collection name = user, schema name using = userSchema
// module.exports = user;

// /models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Password must be at least 3 characters']
    }
});

const user = mongoose.model('user', userSchema);
module.exports = user;
