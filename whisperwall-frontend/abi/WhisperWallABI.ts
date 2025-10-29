
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const WhisperWallABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ContentRequired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidContentMode",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidWhisperType",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "RecipientRequired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnauthorizedAccess",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "WhisperAlreadyDeleted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "WhisperNotFound",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "grantee",
          "type": "address"
        }
      ],
      "name": "DecryptAccessGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "revokee",
          "type": "address"
        }
      ],
      "name": "DecryptAccessRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        }
      ],
      "name": "WhisperDeleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum WhisperWall.WhisperType",
          "name": "whisperType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "enum WhisperWall.ContentMode",
          "name": "contentMode",
          "type": "uint8"
        }
      ],
      "name": "WhisperPosted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum WhisperWall.VoteType",
          "name": "voteType",
          "type": "uint8"
        }
      ],
      "name": "WhisperVoted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        }
      ],
      "name": "deleteWhisper",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        }
      ],
      "name": "getMyVote",
      "outputs": [
        {
          "internalType": "enum WhisperWall.VoteType",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "offset",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getMyWhispers",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "offset",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getPrivateInbox",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPublicWhisperCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "offset",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "limit",
          "type": "uint256"
        }
      ],
      "name": "getPublicWhispers",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalWhisperCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        }
      ],
      "name": "getWhisper",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "internalType": "enum WhisperWall.WhisperType",
          "name": "whisperType",
          "type": "uint8"
        },
        {
          "internalType": "enum WhisperWall.ContentMode",
          "name": "contentMode",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "plainContent",
          "type": "string"
        },
        {
          "internalType": "euint256",
          "name": "encryptedContent",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "tag",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isAnonymous",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isDeleted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        }
      ],
      "name": "getWhisperVoteCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "targetAddress",
          "type": "address"
        }
      ],
      "name": "grantDecryptAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum WhisperWall.WhisperType",
          "name": "whisperType",
          "type": "uint8"
        },
        {
          "internalType": "enum WhisperWall.ContentMode",
          "name": "contentMode",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "plainContent",
          "type": "string"
        },
        {
          "internalType": "externalEuint256",
          "name": "encryptedContentHandle",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "tag",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isAnonymous",
          "type": "bool"
        }
      ],
      "name": "postWhisper",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        }
      ],
      "name": "requestDecryptAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "targetAddress",
          "type": "address"
        }
      ],
      "name": "revokeDecryptAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whisperId",
          "type": "uint256"
        },
        {
          "internalType": "enum WhisperWall.VoteType",
          "name": "voteType",
          "type": "uint8"
        }
      ],
      "name": "voteWhisper",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

