const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const { validationResult } = require('express-validator');

// @route   POST api/cases
// @desc    Create a new case
// @access  Private (Admin)
exports.createCase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { caseNumber, title, description, status } = req.body;

    // Check if case already exists
    let existingCase = await Case.findOne({ caseNumber });
    if (existingCase) {
      return res.status(400).json({ msg: 'Case with this number already exists' });
    }

    // Create new case
    const newCase = new Case({
      caseNumber,
      title,
      description,
      status: status || 'open'
    });

    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    console.error('Error creating case:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET api/cases
// @desc    Get all cases with statistics
// @access  Private (Admin)
exports.getAllCases = async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    
    // Get evidence statistics
    const evidenceStats = await Evidence.aggregate([
      {
        $group: {
          _id: null,
          totalEvidence: { $sum: 1 },
          verifiedEvidence: {
            $sum: {
              $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0]
            }
          },
          tamperedEvidence: {
            $sum: {
              $cond: [{ $eq: ["$verificationStatus", "tampered"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = evidenceStats.length > 0 ? evidenceStats[0] : {
      totalEvidence: 0,
      verifiedEvidence: 0,
      tamperedEvidence: 0
    };

    res.json({
      cases,
      stats: {
        totalCases: cases.length,
        totalEvidence: stats.totalEvidence,
        verifiedEvidence: stats.verifiedEvidence,
        tamperedEvidence: stats.tamperedEvidence
      }
    });
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET api/cases/:id
// @desc    Get case by ID
// @access  Private (Admin)
exports.getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ msg: 'Case not found' });
    }

    res.json(caseItem);
  } catch (err) {
    console.error('Error fetching case:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Case not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   PUT api/cases/:id
// @desc    Update case
// @access  Private (Admin)
exports.updateCase = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, status } = req.body;

    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ msg: 'Case not found' });
    }

    // Update case fields
    if (title) caseItem.title = title;
    if (description) caseItem.description = description;
    if (status) caseItem.status = status;
    caseItem.updatedAt = Date.now();

    await caseItem.save();
    res.json(caseItem);
  } catch (err) {
    console.error('Error updating case:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Case not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET api/cases/:id/evidence
// @desc    Get all evidence for a case
// @access  Private (Admin)
exports.getCaseEvidence = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    
    if (!caseItem) {
      return res.status(404).json({ msg: 'Case not found' });
    }

    const evidence = await Evidence.find({ caseId: req.params.id }).sort({ uploadTimestamp: -1 });
    
    // Don't send actual file data in the response to reduce payload size
    const evidenceWithoutData = evidence.map(item => {
      const { fileData, ...rest } = item.toObject();
      return {
        ...rest,
        hasData: !!fileData
      };
    });

    res.json(evidenceWithoutData);
  } catch (err) {
    console.error('Error fetching case evidence:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Case not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};