const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Store nonces for address verification
const nonces = {};

exports.getNonce = async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ msg: 'Invalid Ethereum address' });
    }

    const nonce = crypto.randomBytes(32).toString('hex');
    nonces[address.toLowerCase()] = nonce;
    
    res.json({ nonce });
  } catch (err) {
    console.error('Error generating nonce:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.verifySignature = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { address, signature } = req.body;
    const lowerAddress = address.toLowerCase();
    
    // Check if address matches admin address
    const adminAddress = process.env.ADMIN_ADDRESS?.toLowerCase();
    if (adminAddress && lowerAddress !== adminAddress) {
      return res.status(403).json({ msg: 'Unauthorized address' });
    }
    
    if (!nonces[lowerAddress]) {
      return res.status(400).json({ msg: 'Please request a nonce first' });
    }
    
    const nonce = nonces[lowerAddress];
    const message = `Sign this message to authenticate with Evidence Integrity System: ${nonce}`;
    
    // Verify signature using ethers.js or web3.js
    const web3 = new (require('web3'))();
    const recoveredAddress = web3.eth.accounts.recover(message, signature);
    
    if (recoveredAddress.toLowerCase() !== lowerAddress) {
      return res.status(401).json({ msg: 'Invalid signature' });
    }
    
    // Clear the nonce to prevent replay attacks
    delete nonces[lowerAddress];
    
    // Generate auth token
    const authToken = crypto.randomBytes(32).toString('hex');
    
    res.json({
      success: true,
      address,
      authToken,
      isAdmin: true
    });
  } catch (err) {
    console.error('Error verifying signature:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};