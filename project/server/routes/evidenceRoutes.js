const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const multer = require('multer');
const evidenceController = require('../controllers/evidenceController');

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST api/evidence
// @desc    Upload evidence for a case
// @access  Private (Admin)
router.post(
  '/',
  upload.single('file'),
  [
    check('caseId', 'Case ID is required').not().isEmpty(),
    check('uploadedBy', 'Uploader address is required').matches(/^0x[a-fA-F0-9]{40}$/)
  ],
  evidenceController.uploadEvidence
);

// @route   GET api/evidence/:id
// @desc    Get evidence by ID
// @access  Private (Admin)
router.get('/:id', evidenceController.getEvidenceById);

// @route   GET api/evidence/:id/file
// @desc    Get evidence file
// @access  Private (Admin)
router.get('/:id/file', evidenceController.getEvidenceFile);

// @route   POST api/evidence/:id/verify
// @desc    Verify evidence integrity
// @access  Private (Admin)
router.post('/:id/verify', evidenceController.verifyEvidence);

module.exports = router;