const path = require('path');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const User = require('../models/User');

// Basic server-side validation for user fields
function validateUserPayload(body) {
  const errors = [];
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'mobile',
    'gender',
    'status',
    'location',
  ];

  requiredFields.forEach((field) => {
    if (!body[field] || String(body[field]).trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  if (body.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    errors.push('Email is invalid');
  }

  if (body.mobile && !/^[0-9]{10}$/.test(body.mobile)) {
    errors.push('Mobile must be a 10 digit number');
  }

  if (body.gender && !['Male', 'Female'].includes(body.gender)) {
    errors.push('Gender must be Male or Female');
  }

  if (body.status && !['Active', 'Inactive'].includes(body.status)) {
    errors.push('Status must be Active or Inactive');
  }

  return errors;
}

// GET /api/users?page=&limit=&search=
async function getUsers(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const search = req.query.search ? String(req.query.search).trim() : '';

  const filter = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { location: regex },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
}

// GET /api/users/:id
async function getUserById(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
}

// POST /api/users
async function createUser(req, res) {
  const payload = { ...req.body };
  if (req.file) {
    payload.profileImage = req.file.filename;
  }

  const errors = validateUserPayload(payload);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const user = await User.create(payload);
  res.status(201).json({ success: true, data: user });
}

// PUT /api/users/:id
async function updateUser(req, res) {
  const existingUser = await User.findById(req.params.id);
  if (!existingUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const payload = { ...req.body };

  if (req.file) {
    // delete old image if any
    if (existingUser.profileImage) {
      const oldPath = path.join(__dirname, '..', '..', 'uploads', existingUser.profileImage);
      fs.unlink(oldPath, () => {});
    }
    payload.profileImage = req.file.filename;
  }

  const merged = { ...existingUser.toObject(), ...payload };
  const errors = validateUserPayload(merged);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  // prevent email duplication with other users
  if (payload.email) {
    const otherWithEmail = await User.findOne({
      _id: { $ne: existingUser._id },
      email: payload.email.toLowerCase(),
    });
    if (otherWithEmail) {
      return res
        .status(400)
        .json({ success: false, message: 'Another user with this email already exists' });
    }
  }

  Object.assign(existingUser, payload);
  await existingUser.save();

  res.json({ success: true, data: existingUser });
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.profileImage) {
    const imgPath = path.join(__dirname, '..', '..', 'uploads', user.profileImage);
    fs.unlink(imgPath, () => {});
  }

  await user.deleteOne();

  res.json({ success: true, message: 'User deleted successfully' });
}

// GET /api/users/export?search=
async function exportUsersToCsv(req, res) {
  const search = req.query.search ? String(req.query.search).trim() : '';

  const filter = {};
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { location: regex },
      { mobile: regex }
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  const tempDir = path.join(__dirname, '..', '..', 'tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const filePath = path.join(tempDir, `users-${Date.now()}.csv`);

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'firstName', title: 'First Name' },
      { id: 'lastName', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'mobile', title: 'Mobile' },
      { id: 'gender', title: 'Gender' },
      { id: 'status', title: 'Status' },
      { id: 'location', title: 'Location' },
      { id: 'profileImage', title: 'Profile Image URL' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'updatedAt', title: 'Last Updated' }
    ],
  });

  const records = users.map((u, index) => ({
    id: index + 1,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    mobile: u.mobile || '',
    gender: u.gender || '',
    status: u.status || '',
    location: u.location || '',
    profileImage: u.profileImage ? `${req.protocol}://${req.get('host')}/uploads/${u.profileImage}` : '',
    createdAt: u.createdAt ? u.createdAt.toISOString() : '',
    updatedAt: u.updatedAt ? u.updatedAt.toISOString() : ''
  }));

  await csvWriter.writeRecords(records);

  res.download(filePath, 'users_export.csv', (err) => {
    if (err) {
      console.error('Error sending CSV file', err);
    }
    fs.unlink(filePath, () => {});
  });
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUsersToCsv,
};

