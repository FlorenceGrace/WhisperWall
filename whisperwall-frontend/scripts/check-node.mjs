import { JsonRpcProvider } from "ethers";

const HARDHAT_NODE_URL = "http://localhost:8545";

async function checkHardhatNode() {
  try {
    const provider = new JsonRpcProvider(HARDHAT_NODE_URL);
    const network = await provider.getNetwork();
    
    if (Number(network.chainId) === 31337) {
      console.log("✅ Hardhat node detected at", HARDHAT_NODE_URL);
      process.exit(0);
    } else {
      console.error("❌ Node at", HARDHAT_NODE_URL, "is not a Hardhat node (chainId:", network.chainId, ")");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Hardhat node not running at", HARDHAT_NODE_URL);
    console.error("   Please start the Hardhat node first:");
    console.error("   cd ../fhevm-hardhat-template && npx hardhat node");
    process.exit(1);
  }
}

checkHardhatNode();


