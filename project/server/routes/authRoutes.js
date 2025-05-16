const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');

// @route   GET api/auth/nonce/:address
// @desc    Get nonce for MetaMask signing
// @access  Public
router.get('/nonce/:address', authController.getNonce);

// @route   POST api/auth/verify
// @desc    Verify signature and authenticate
// @access  Public
router.post(
  '/verify',
  [
    check('address', 'Valid Ethereum address is required').matches(/^0x[a-fA-F0-9]{40}$/),
    check('signature', 'Signature is required').not().isEmpty()
  ],
  authController.verifySignature
);

module.exports = router;