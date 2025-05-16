const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  evidenceId: {
    type: String,
    required: true,
    unique: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  caseNumber: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileData: {
    type: Buffer,
    required: true
  },
  fileHash: {
    type: String,
    required: true
  },
  blockchainTxHash: {
    type: String
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadTimestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'tampered', 'unknown'],
    default: 'pending'
  },
  verificationTime: {
    type: Date
  }
});

module.exports = mongoose.model('Evidence', EvidenceSchema);