import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "WhisperWall";

// Path to fhevm-hardhat-template
const rel = "../fhevm-hardhat-template";

// Output directory for ABI
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/fhevm-hardhat-template${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function deployOnHardhatNode() {
  if (process.platform === "win32") {
    // Not supported on Windows
    return;
  }
  try {
    execSync(`./deploy-hardhat-node.sh`, {
      cwd: path.resolve("./scripts"),
      stdio: "inherit",
    });
  } catch (e) {
    console.error(`${line}Script execution failed: ${e}${line}`);
    process.exit(1);
  }
}

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir) && chainId === 31337) {
    // Try to auto-deploy the contract on hardhat node!
    deployOnHardhatNode();
  }

  if (!fs.existsSync(chainDeploymentDir)) {
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const contractFile = path.join(chainDeploymentDir, `${contractName}.json`);
  
  if (!fs.existsSync(contractFile)) {
    console.error(
      `${line}Contract file '${contractFile}' not found.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    if (!optional) {
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(contractFile, "utf-8");
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Auto deployed on Linux/Mac (will fail on windows)
const deployLocalhost = readDeployment(
  "localhost",
  31337,
  CONTRACT_NAME,
  true /* optional - make it optional to allow build without deployment */
);

if (!deployLocalhost) {
  console.warn("⚠️  No localhost deployment found. Using placeholder ABI.");
  console.warn("   To generate real ABI:");
  console.warn("   1. Start Hardhat node: cd ../fhevm-hardhat-template && npx hardhat node");
  console.warn("   2. Deploy contracts: npx hardhat deploy --network localhost");
  
  // Create placeholder
  const placeholderABI = { abi: [] };
  const placeholderAddress = "0x0000000000000000000000000000000000000000";
  
  const tsCode = `
/*
  This file is auto-generated (PLACEHOLDER).
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify(placeholderABI, null, 2)} as const;
\n`;

  const tsAddresses = `
/*
  This file is auto-generated (PLACEHOLDER).
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${placeholderAddress}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${placeholderAddress}", chainId: 31337, chainName: "hardhat" },
};
`;

  fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
  fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}Addresses.ts`), tsAddresses, "utf-8");
  
  console.log(`Generated placeholder ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
  console.log(`Generated placeholder ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);
  process.exit(0);
}

// Sepolia is optional
let deploySepolia = readDeployment(
  "sepolia",
  11155111,
  CONTRACT_NAME,
  true /* optional */
);
if (!deploySepolia) {
  deploySepolia = {
    abi: deployLocalhost.abi,
    address: "0x0000000000000000000000000000000000000000",
  };
}

if (deployLocalhost && deploySepolia) {
  if (
    JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
  ) {
    console.error(
      `${line}Deployments on localhost and Sepolia differ. Cant use the same abi on both networks. Consider re-deploying the contracts on both networks.${line}`
    );
    process.exit(1);
  }
}

const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: deployLocalhost.abi }, null, 2)} as const;
\n`;

const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);
console.log(tsAddresses);

fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}ABI.ts`),
  tsCode,
  "utf-8"
);
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);

