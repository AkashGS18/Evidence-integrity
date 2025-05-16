# Evidence Integrity System

A blockchain-based evidence integrity verification system for secure case management and evidence tracking.

## Features

- MetaMask authentication for secure admin access
- Case management system for organizing evidence
- Evidence upload, storage, and integrity verification
- Blockchain integration for tamper-proof evidence validation
- MongoDB storage for evidence files and metadata
- Responsive, intuitive user interface

## Tech Stack

- **Frontend**: React.js with styled-components
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Authentication**: MetaMask wallet integration
- **File Storage**: MongoDB with GridFS

## Project Structure

```
evidence-integrity/
├── client/                  # Frontend React app
│   ├── public/              # Public assets
│   └── src/                 # React source code
│       ├── components/      # React components
│       ├── contexts/        # React contexts
│       ├── App.js           # Main App component
│       └── ...              # Other React files
├── server/                  # Backend Node.js app
│   ├── contracts/           # Solidity smart contracts
│   ├── controllers/         # API controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   └── server.js            # Express server
└── package.json             # Root package.json
```

## Smart Contract

The system uses a Solidity smart contract deployed on the Sepolia testnet for storing evidence hashes and verification.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- MetaMask browser extension
- Infura or Alchemy account for Ethereum connectivity

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/evidence-integrity.git
   cd evidence-integrity
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   ```
   # In server/.env
   MONGO_URI=your_mongodb_uri
   WEB3_PROVIDER_URL=your_infura_or_alchemy_url
   CONTRACT_ADDRESS=your_deployed_contract_address
   CONTRACT_OWNER_PRIVATE_KEY=your_private_key
   ```

4. Deploy the smart contract to Sepolia testnet using Remix IDE.

5. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Connect with MetaMask to authenticate
2. Create new cases as needed
3. Upload evidence files for each case
4. Verify evidence integrity using the blockchain verification feature

## License

This project is licensed under the MIT License.