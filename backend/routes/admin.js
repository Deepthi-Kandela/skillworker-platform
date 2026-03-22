const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, verifyWorker, manageCategories, createCategory, getAnalytics } = require('../controllers/adminController');
const { getAllComplaints, updateComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/workers/:id/verify', verifyWorker);
router.get('/categories', manageCategories);
router.post('/categories', createCategory);
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', updateComplaint);

module.exports = router;
