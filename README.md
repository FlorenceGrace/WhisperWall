# 🗣️ WhisperWall - FHEVM Privacy Message Board

WhisperWall is a privacy-focused message board dApp built on FHEVM (Fully Homomorphic Encryption Virtual Machine). It enables users to post both public and private messages in either plain text or encrypted format. The application leverages FHEVM's homomorphic encryption capabilities to ensure sensitive content remains confidential while still allowing computational operations like voting.

## ✨ Features

- **🔓 Public Messages**: Visible to everyone on the public wall
- **🔐 Private Messages**: Direct encrypted messages between users
- **📝 Plain Text**: Standard readable messages
- **🔒 Encrypted Content**: FHEVM-encrypted messages with controlled access
- **👍 Voting System**: Like/dislike messages with encrypted vote counts
- **🔓 Decrypt on Demand**: Request decryption access for encrypted content
- **🎨 Beautiful UI**: Neumorphism design with purple theme

## 🏗️ Architecture

### Smart Contracts (`fhevm-hardhat-template/`)
- **WhisperWall.sol**: Main contract with encrypted message storage
- **FHEVM Integration**: Uses `euint256`, `ebool` types and FHE operations
- **Access Control**: Implements `FHE.allow()` for decryption permissions

### Frontend (`whisperwall-frontend/`)
- **Next.js App Router**: Modern React application
- **Dual Mode Support**: 
  - `dev:mock`: Local development with `@fhevm/mock-utils`
  - `dev`: Testnet/mainnet with `@zama-fhe/relayer-sdk`
- **MetaMask Integration**: EIP-6963 wallet discovery
- **FHEVM SDK**: Complete encrypt→store→decrypt flow

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- Sepolia ETH for testnet deployment

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd WhisperWall
   ```

2. **Setup Smart Contracts**
   ```bash
   cd fhevm-hardhat-template
   npm install
   
   # Start local node (Terminal 1)
   npx hardhat node
   
   # Deploy contracts (Terminal 2)
   npx hardhat deploy --network localhost
   
   # Optional: Seed test data
   npx hardhat seed-whispers --network localhost
   ```

3. **Setup Frontend**
   ```bash
   cd whisperwall-frontend
   npm install
   
   # Start frontend in mock mode
   npm run dev:mock
   ```

4. **Access Application**
   - Open http://localhost:3000
   - Connect MetaMask to localhost:8545
   - Chain ID: 31337

### Testnet Deployment (Sepolia)

1. **Configure Environment**
   ```bash
   cd fhevm-hardhat-template
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   ```

2. **Deploy to Sepolia**
   ```bash
   npx hardhat deploy --network sepolia
   ```

3. **Run Frontend (Testnet Mode)**
   ```bash
   cd whisperwall-frontend
   npm run dev  # Uses real FHEVM Relayer SDK
   ```

## 📖 Usage Guide

### Creating Messages

1. **Connect Wallet**: Click "Connect Wallet" in navigation
2. **Create Whisper**: Use "✏️ Post Whisper" button
3. **Choose Type**:
   - **Public**: Visible on public wall (`/public-wall`)
   - **Private**: Only sender and recipient can see (`/private-messages`)
4. **Choose Mode**:
   - **Plain Text**: Readable by authorized users
   - **Encrypted**: FHEVM-encrypted, requires decryption

### Decrypting Messages

1. **Find Encrypted Message**: Look for 🔒 icon
2. **Request Decrypt**: Click "🔓 Request Decrypt" button
3. **Grant Permission**: Confirm transaction (calls `requestDecryptAccess()`)
4. **Sign Decryption**: Sign EIP-712 message for decryption key
5. **View Content**: Decrypted text appears in message card

### Voting

- **Like**: 👍 button (encrypted vote count)
- **Dislike**: 👎 button (encrypted vote count)
- Vote counts are homomorphically encrypted

## 🔧 Technical Details

### FHEVM Integration

```solidity
// Encrypted content storage
euint256 encryptedContent = FHE.fromExternal(encryptedContentHandle, inputProof);

// Access control
FHE.allowThis(encryptedContent);           // Contract access
FHE.allow(encryptedContent, msg.sender);    // User access

// Voting with encrypted counters
euint32 likeCount = FHE.add(_likeCount[whisperId], FHE.asEuint32(1));
```

### Frontend Encryption Flow

```typescript
// 1. Encrypt user input
const input = fhevmInstance.encrypt_uint256(messageText);

// 2. Submit to contract
await contract.postWhisper(/*...*/, input.handles[0], input.inputProof);

// 3. Request decryption access
await contract.requestDecryptAccess(whisperId);

// 4. Decrypt content
const decrypted = await fhevmInstance.userDecrypt(handles, signature);
```

## 🛠️ Development Scripts

### Smart Contracts
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Query whispers
npx hardhat query-whispers --network localhost

# Debug specific whisper
npx hardhat debug-whisper --id 0 --network localhost
```

### Frontend
```bash
# Generate ABI files
npm run genabi

# Build production
npm run build

# Type checking
npm run type-check
```

## 📁 Project Structure

```
WhisperWall/
├── fhevm-hardhat-template/          # Smart contracts
│   ├── contracts/                   # Solidity contracts
│   ├── deploy/                      # Deployment scripts
│   ├── test/                        # Contract tests
│   ├── tasks/                       # Hardhat tasks
│   └── deployments/                 # Deployment artifacts
├── whisperwall-frontend/            # Next.js frontend
│   ├── app/                         # App Router pages
│   ├── components/                  # React components
│   ├── hooks/                       # Custom React hooks
│   ├── fhevm/                       # FHEVM integration
│   └── abi/                         # Generated contract ABIs
└── README.md
```

## 🔐 Security Features

- **Homomorphic Encryption**: Messages encrypted with FHEVM
- **Access Control**: Fine-grained permissions via `FHE.allow()`
- **Wallet Signatures**: EIP-712 signatures for decryption
- **No Private Keys**: Client-side encryption with public keys
- **Audit Ready**: Open source smart contracts

## 🌐 Deployed Contracts

### Sepolia Testnet
- **WhisperWall**: `0x31c8eA068F1cDaf5A18306B275b5cd428D15d9f7`
- **Chain ID**: 11155111
- **Explorer**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x31c8eA068F1cDaf5A18306B275b5cd428D15d9f7)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](fhevm-hardhat-template/LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama**: For FHEVM technology and SDK
- **Hardhat**: For development framework
- **Next.js**: For React framework
- **Tailwind CSS**: For styling system

## 📞 Support

For questions and support:
- Open an issue in this repository
- Check the [TESTING_GUIDE.md](whisperwall-frontend/TESTING_GUIDE.md) for debugging tips

---

**Built with ❤️ using FHEVM for true privacy-preserving computation**
