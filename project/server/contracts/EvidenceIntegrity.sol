// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EvidenceIntegrity {
    address public admin;
    
    struct Evidence {
        string caseId;
        string evidenceId;
        string fileHash;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from evidence ID to Evidence struct
    mapping(string => Evidence) public evidences;
    
    // Events
    event EvidenceAdded(string indexed caseId, string evidenceId, string fileHash, uint256 timestamp);
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
    
    // Constructor
    constructor() {
        admin = msg.sender;
    }
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    // Functions
    function addEvidence(string memory _caseId, string memory _evidenceId, string memory _fileHash) public onlyAdmin {
        require(!evidences[_evidenceId].exists, "Evidence already exists");
        
        uint256 timestamp = block.timestamp;
        
        Evidence memory newEvidence = Evidence({
            caseId: _caseId,
            evidenceId: _evidenceId,
            fileHash: _fileHash,
            timestamp: timestamp,
            exists: true
        });
        
        evidences[_evidenceId] = newEvidence;
        
        emit EvidenceAdded(_caseId, _evidenceId, _fileHash, timestamp);
    }
    
    function verifyEvidence(string memory _evidenceId, string memory _fileHash) public view returns (bool) {
        require(evidences[_evidenceId].exists, "Evidence does not exist");
        return keccak256(abi.encodePacked(evidences[_evidenceId].fileHash)) == keccak256(abi.encodePacked(_fileHash));
    }
    
    function getEvidenceDetails(string memory _evidenceId) public view returns (string memory, string memory, uint256, bool) {
        require(evidences[_evidenceId].exists, "Evidence does not exist");
        Evidence memory evidence = evidences[_evidenceId];
        return (evidence.caseId, evidence.fileHash, evidence.timestamp, true);
    }
    
    function changeAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "New admin is the zero address");
        address oldAdmin = admin;
        admin = _newAdmin;
        emit AdminChanged(oldAdmin, _newAdmin);
    }
}