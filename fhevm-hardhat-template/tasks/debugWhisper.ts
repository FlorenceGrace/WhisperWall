import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

task("debug-whisper", "Debug a specific whisper")
  .addParam("id", "Whisper ID")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    
    const WhisperWallDeployment = await deployments.get("WhisperWall");
    const WhisperWall = await ethers.getContractAt(
      "WhisperWall",
      WhisperWallDeployment.address
    );

    const id = BigInt(taskArgs.id);
    console.log(`\n🔍 Debugging Whisper #${id}`);
    console.log("Contract:", WhisperWallDeployment.address);
    console.log("");

    try {
      const whisper = await WhisperWall.getWhisper(id);
      
      console.log("Raw return values:");
      console.log("  [0] id:", whisper[0].toString());
      console.log("  [1] author:", whisper[1]);
      console.log("  [2] whisperType (0=PUBLIC, 1=PRIVATE):", whisper[2].toString());
      console.log("  [3] contentMode (0=PLAIN, 1=ENCRYPTED):", whisper[3].toString());
      console.log("  [4] plainContent:", whisper[4]);
      console.log("  [5] encryptedContent:", whisper[5]);
      console.log("  [6] recipient:", whisper[6]);
      console.log("  [7] tag:", whisper[7]);
      console.log("  [8] timestamp:", whisper[8].toString());
      console.log("  [9] isAnonymous:", whisper[9]);
      console.log("  [10] isDeleted:", whisper[10]);
      
      console.log("\nDecoded:");
      console.log("  Type:", whisper[2] === 0n ? "PUBLIC" : "PRIVATE");
      console.log("  Mode:", whisper[3] === 0n ? "PLAIN" : "ENCRYPTED");
      console.log("  Content:", whisper[4] || "[Encrypted]");
      console.log("  Author:", whisper[9] ? "Anonymous" : whisper[1]);
      
    } catch (error) {
      console.error("Error:", error);
    }
  });


