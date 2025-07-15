// const express = require('express');
// const router = express.Router();
// const { body, validationResult } = require('express-validator');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { Types } = require('mongoose');

// const userModel = require('../models/user.model');
// const fileModel = require('../models/files.models');
// const Chat = require('../models/chat.models');
// const supabase = require('../config/supabase.config');
// const upload = require('../config/multer.config');
// const authMiddleware = require('../middlewares/authe');

// // -------------------
// // Public routes
// // -------------------

// router.get('/signup', (req, res) => {
//     res.render('signup');
// });

// router.post('/signup',
//     body('username').trim().isLength({ min: 3 }),
//     body('password').trim().isLength({ min: 3 }),
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).render('signup', {
//                 error: 'Invalid data',
//                 old: req.body
//             });
//         }

//         const { username, password } = req.body;
//         try {
//             const existingUser = await userModel.findOne({ username });
//             if (existingUser) {
//                 return res.status(400).render('signup', {
//                     error: 'Username already exists',
//                     old: req.body
//                 });
//             }

//             const hashedPassword = await bcrypt.hash(password, 10);
//             await userModel.create({ username, password: hashedPassword });

//             res.redirect('/user/login');
//         } catch (err) {
//             console.error(err);
//             res.status(500).render('signup', {
//                 error: 'Something went wrong. Please try again.',
//                 old: req.body
//             });
//         }
//     }
// );

// router.get('/login', (req, res) => {
//     res.render('login');
// });

// router.post('/login',
//     body('username').trim().isLength({ min: 3 }),
//     body('password').trim().isLength({ min: 3 }),
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).render('login', {
//                 error: 'Invalid data',
//                 old: req.body
//             });
//         }

//         const { username, password } = req.body;
//         try {
//             const user = await userModel.findOne({ username }).lean();
//             if (!user || !(await bcrypt.compare(password, user.password))) {
//                 return res.status(400).render('login', {
//                     error: 'Username or password is incorrect',
//                     old: req.body
//                 });
//             }

//             const token = jwt.sign({
//                 userId: user._id,
//                 username: user.username
//             }, process.env.JWT_SECRET);

//             res.cookie('token', token);
//             res.redirect('/user/home');
//         } catch (err) {
//             console.error(err);
//             res.status(500).render('login', {
//                 error: 'Something went wrong. Please try again.',
//                 old: req.body
//             });
//         }
//     }
// );

// // -------------------
// // Auth-protected routes
// // -------------------


// router.get('/home', async (req, res) => {
//     try {
//         const files = await fileModel.find({ user: req.user.userId }).sort({ _id: -1 }).lean();
//         res.render('home', { files, username: req.user.username });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });

// router.post('/upload', upload.single('file'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const fileExt = req.file.originalname.split('.').pop();
//         const fileName = `${require('uuid').v4()}.${fileExt}`;

//         const { data, error } = await supabase
//             .storage
//             .from('drive')
//             .upload(fileName, req.file.buffer, {
//                 contentType: req.file.mimetype,
//             });

//         if (error) throw error;

//         const { data: publicUrlData } = supabase
//             .storage
//             .from('drive')
//             .getPublicUrl(fileName);

//         await fileModel.create({
//             path: publicUrlData.publicUrl,
//             originalname: req.file.originalname,
//             user: req.user.userId
//         });

//         res.redirect('/user/home');
//     } catch (err) {
//         console.error("Upload error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

// router.post('/delete/:id', async (req, res) => {
//     try {
//         const fileId = new Types.ObjectId(req.params.id);
//         const fileRecord = await fileModel.findOne({ _id: fileId, user: req.user.userId });

//         if (fileRecord && fileRecord.path.startsWith('http')) {
//             const fileKey = fileRecord.path.split('/drive/')[1];
//             if (fileKey) {
//                 await supabase.storage.from('drive').remove([fileKey]);
//             }
//         }

//         if (fileRecord) {
//             await fileModel.deleteOne({ _id: fileRecord._id });
//         }

//         res.json({ success: true, message: 'File deleted successfully' });
//     } catch (err) {
//         console.error("Delete error:", err);
//         res.status(500).json({ success: false, error: 'Server failed to delete file' });
//     }
// });

// router.get('/chat-history/:fileId', async (req, res) => {
//     try {
//         const chat = await Chat.findOne({
//             user: req.user.userId,
//             file: req.params.fileId
//         });
//         res.json({ history: chat ? chat.history : [] });
//     } catch (err) {
//         console.error("Chat load error:", err);
//         res.status(500).json({ error: "Failed to load chat history" });
//     }
// });

// module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');
const upload = require('../config/multer.config');
const authMiddleware = require('../middlewares/authe');
require('dotenv').config();

const userModel = require('../models/user.model');
const fileModel = require('../models/files.models');
const Chat = require('../models/chat.models');
const supabase = require('../config/supabase.config');

const router = express.Router();

// ---------------------
// PUBLIC ROUTES
// ---------------------

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('signup', {
                error: 'Invalid data', old: req.body
            });
        }

        const { username, password } = req.body;
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(400).render('signup', {
                error: 'Username already exists', old: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.create({ username, password: hashedPassword });

        res.redirect('/user/login');
    });

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login',
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 3 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('login', {
                error: 'Invalid data', old: req.body
            });
        }

        const { username, password } = req.body;
        const user = await userModel.findOne({ username }).lean();
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).render('login', {
                error: 'Username or password is incorrect', old: req.body
            });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET
        );

res.cookie('token', token, {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    maxAge: 3600000 // 1 hour in ms
});
        res.redirect('/user/home');
    });

// ---------------------
// AUTHENTICATED ROUTES
// ---------------------
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});
router.use(authMiddleware);

router.get('/home', async (req, res) => {
    const files = await fileModel.find({ user: req.user.userId }).sort({ _id: -1 }).lean();
    res.render('home', { files, username: req.user.username });
});

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${require('uuid').v4()}.${fileExt}`;

    const { error } = await supabase
        .storage
        .from('drive')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (error) throw error;

    const { data: publicUrlData } = supabase
        .storage
        .from('drive')
        .getPublicUrl(fileName);

    await fileModel.create({
        path: publicUrlData.publicUrl,
        originalname: req.file.originalname,
        user: req.user.userId
    });

    res.redirect('/user/home');
});

router.post('/delete/:id', async (req, res) => {
    const fileId = new Types.ObjectId(req.params.id);
    const fileRecord = await fileModel.findOne({ _id: fileId, user: req.user.userId });

    if (fileRecord && fileRecord.path.startsWith('http')) {
        const fileKey = fileRecord.path.split('/drive/')[1];
        if (fileKey) await supabase.storage.from('drive').remove([fileKey]);
    }

    if (fileRecord) await fileModel.deleteOne({ _id: fileRecord._id });

    res.json({ success: true, message: 'File deleted successfully' });
});

router.get('/chat-history/:fileId', async (req, res) => {
    const chat = await Chat.findOne({ user: req.user.userId, file: req.params.fileId });
    res.json({ history: chat ? chat.history : [] });
});

module.exports = router;
