const Evidence = require('../models/Evidence');
const Case = require('../models/Case');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { 
  addEvidenceToBlockchain, 
  verifyEvidenceOnBlockchain 
} = require('../utils/blockchain');

// Generate SHA-256 hash of file
const generateFileHash = (buffer) => {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
};

// @route   POST api/evidence
// @desc    Upload evidence for a case
// @access  Private (Admin)
exports.uploadEvidence = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const { caseId, description, uploadedBy } = req.body;

    // Find the case
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ msg: 'Case not found' });
    }

    // Generate unique evidence ID
    const evidenceId = `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Generate file hash
    const fileBuffer = req.file.buffer;
    const fileHash = generateFileHash(fileBuffer);

    // Create new evidence
    const newEvidence = new Evidence({
      evidenceId,
      caseId,
      caseNumber: caseItem.caseNumber,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileData: fileBuffer,
      fileHash,
      uploadedBy,
      description
    });

    // Save evidence to MongoDB
    await newEvidence.save();

    // Add evidence hash to blockchain
    try {
      const receipt = await addEvidenceToBlockchain(
        caseItem.caseNumber,
        evidenceId,
        fileHash
      );
      
      // Update evidence with blockchain transaction hash
      newEvidence.blockchainTxHash = receipt.transactionHash;
      await newEvidence.save();
      
      // Return evidence without file data
      const { fileData, ...evidenceResponse } = newEvidence.toObject();
      res.status(201).json(evidenceResponse);
    } catch (blockchainErr) {
      console.error('Blockchain error:', blockchainErr);
      
      // Even if blockchain fails, the evidence is saved in MongoDB
      const { fileData, ...evidenceResponse } = newEvidence.toObject();
      res.status(201).json({
        ...evidenceResponse,
        blockchainStatus: 'pending',
        warning: 'Evidence saved but blockchain verification pending'
      });
    }
  } catch (err) {
    console.error('Error uploading evidence:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET api/evidence/:id
// @desc    Get evidence by ID
// @access  Private (Admin)
exports.getEvidenceById = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({ msg: 'Evidence not found' });
    }

    // Don't send actual file data in the response
    const { fileData, ...evidenceResponse } = evidence.toObject();
    res.json({
      ...evidenceResponse,
      hasData: !!fileData
    });
  } catch (err) {
    console.error('Error fetching evidence:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evidence not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   GET api/evidence/:id/file
// @desc    Get evidence file
// @access  Private (Admin)
exports.getEvidenceFile = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({ msg: 'Evidence not found' });
    }

    if (!evidence.fileData) {
      return res.status(404).json({ msg: 'File data not found' });
    }

    res.set('Content-Type', evidence.fileType);
    res.set('Content-Disposition', `attachment; filename="${evidence.fileName}"`);
    res.send(evidence.fileData);
  } catch (err) {
    console.error('Error fetching evidence file:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evidence not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

// @route   POST api/evidence/:id/verify
// @desc    Verify evidence integrity
// @access  Private (Admin)
exports.verifyEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({ msg: 'Evidence not found' });
    }

    // Generate hash from stored file
    const fileHash = generateFileHash(evidence.fileData);
    
    // Check if current hash matches stored hash
    const hashesMatch = fileHash === evidence.fileHash;
    
    let blockchainVerified = false;
    let verificationStatus = 'unknown';
    
    // Verify on blockchain if stored hash matches
    if (hashesMatch) {
      try {
        blockchainVerified = await verifyEvidenceOnBlockchain(
          evidence.evidenceId,
          evidence.fileHash
        );
        
        verificationStatus = blockchainVerified ? 'verified' : 'tampered';
      } catch (blockchainErr) {
        console.error('Blockchain verification error:', blockchainErr);
        verificationStatus = 'unknown';
      }
    } else {
      verificationStatus = 'tampered';
    }
    
    // Update evidence verification status
    evidence.verified = blockchainVerified && hashesMatch;
    evidence.verificationStatus = verificationStatus;
    evidence.verificationTime = Date.now();
    await evidence.save();
    
    res.json({
      evidenceId: evidence._id,
      evidenceHash: evidence.fileHash,
      currentHash: fileHash,
      hashesMatch,
      blockchainVerified,
      verificationStatus,
      verificationTime: evidence.verificationTime
    });
  } catch (err) {
    console.error('Error verifying evidence:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Evidence not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};