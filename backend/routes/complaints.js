const express = require('express');
const router = express.Router();
const { createComplaint, getMyComplaints, getAllComplaints, updateComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/all', authorize('admin'), getAllComplaints);
router.put('/:id', authorize('admin'), updateComplaint);

module.exports = router;
