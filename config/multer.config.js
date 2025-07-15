// const multer = require('multer');
// const firebaseStorage = require('multer-firebase-storage');
// const firebase = require('./firebase.config');
// const serviceAccount = require('../drive-ef473-firebase-adminsdk-fbsvc-93d5ceff4a.json');

// const storage = firebaseStorage({
//     credentials: FirebaseFirestore.credential.cert(serviceAccount),
//     bucketName: 'drive-222ea.appspot.com',
//     unique:true
// })

// const upload = multer({
//     storage: storage,
    
// })

//-----UPADTED ONE IS BELOW----



// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure the uploads folder exists
// const uploadPath = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
