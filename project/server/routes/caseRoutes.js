const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const caseController = require('../controllers/caseController');

// @route   POST api/cases
// @desc    Create a new case
// @access  Private (Admin)
router.post(
  '/',
  [
    check('caseNumber', 'Case number is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
  ],
  caseController.createCase
);

// @route   GET api/cases
// @desc    Get all cases
// @access  Private (Admin)
router.get('/', caseController.getAllCases);

// @route   GET api/cases/:id
// @desc    Get case by ID
// @access  Private (Admin)
router.get('/:id', caseController.getCaseById);

// @route   PUT api/cases/:id
// @desc    Update case
// @access  Private (Admin)
router.put(
  '/:id',
  [
    check('title', 'Title is required').optional(),
    check('description', 'Description is required').optional(),
    check('status', 'Status must be open, closed, or pending').optional().isIn(['open', 'closed', 'pending'])
  ],
  caseController.updateCase
);

// @route   GET api/cases/:id/evidence
// @desc    Get all evidence for a case
// @access  Private (Admin)
router.get('/:id/evidence', caseController.getCaseEvidence);

module.exports = router;