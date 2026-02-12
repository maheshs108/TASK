const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUsersToCsv,
} = require('../controllers/userController');

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    // Ensure uploads directory exists to avoid ENOENT
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

router.get('/', getUsers);
router.get('/export', exportUsersToCsv);
router.get('/:id', getUserById);
router.post('/', upload.single('profileImage'), createUser);
router.put('/:id', upload.single('profileImage'), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

