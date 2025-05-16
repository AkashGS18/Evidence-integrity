const Web3 = require('web3');
const contractAbi = require('../contracts/EvidenceIntegrityABI.json');
require('dotenv').config();

// Connect to Ethereum network
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER_URL));

// Contract instance
const contract = new web3.eth.Contract(
  contractAbi,
  process.env.CONTRACT_ADDRESS
);

// Private key of contract owner
const privateKey = process.env.CONTRACT_OWNER_PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
web3.eth.accounts.wallet.add(account);

/**
 * Add evidence hash to blockchain
 * @param {string} caseId - Case ID
 * @param {string} evidenceId - Evidence ID
 * @param {string} fileHash - Hash of the evidence file
 * @returns {Promise} - Transaction receipt
 */
const addEvidenceToBlockchain = async (caseId, evidenceId, fileHash) => {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    const gas = await contract.methods.addEvidence(caseId, evidenceId, fileHash).estimateGas({ from: account.address });
    
    const tx = {
      from: account.address,
      to: process.env.CONTRACT_ADDRESS,
      gas,
      gasPrice,
      data: contract.methods.addEvidence(caseId, evidenceId, fileHash).encodeABI()
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    return receipt;
  } catch (error) {
    console.error('Error adding evidence to blockchain:', error);
    throw error;
  }
};

/**
 * Verify evidence hash on blockchain
 * @param {string} evidenceId - Evidence ID
 * @param {string} fileHash - Hash of the evidence file to verify
 * @returns {Promise<boolean>} - True if verified, false otherwise
 */
const verifyEvidenceOnBlockchain = async (evidenceId, fileHash) => {
  try {
    const isVerified = await contract.methods.verifyEvidence(evidenceId, fileHash).call();
    return isVerified;
  } catch (error) {
    console.error('Error verifying evidence on blockchain:', error);
    throw error;
  }
};

/**
 * Get evidence details from blockchain
 * @param {string} evidenceId - Evidence ID
 * @returns {Promise<Object>} - Evidence details
 */
const getEvidenceDetailsFromBlockchain = async (evidenceId) => {
  try {
    const details = await contract.methods.getEvidenceDetails(evidenceId).call();
    return {
      caseId: details[0],
      fileHash: details[1],
      timestamp: details[2],
      exists: details[3]
    };
  } catch (error) {
    console.error('Error getting evidence details from blockchain:', error);
    throw error;
  }
};

module.exports = {
  addEvidenceToBlockchain,
  verifyEvidenceOnBlockchain,
  getEvidenceDetailsFromBlockchain
};