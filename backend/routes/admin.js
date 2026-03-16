const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, verifyWorker, manageCategories, createCategory } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/workers/:id/verify', verifyWorker);
router.get('/categories', manageCategories);
router.post('/categories', createCategory);

module.exports = router;
