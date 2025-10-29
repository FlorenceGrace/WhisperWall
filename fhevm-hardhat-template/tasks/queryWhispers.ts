import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

task("query-whispers", "Query whispers from WhisperWall contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    
    const WhisperWallDeployment = await deployments.get("WhisperWall");
    const WhisperWall = await ethers.getContractAt(
      "WhisperWall",
      WhisperWallDeployment.address
    );

    console.log("📊 WhisperWall Stats");
    console.log("Contract address:", WhisperWallDeployment.address);
    console.log("Network:", hre.network.name);
    console.log("");

    const totalCount = await WhisperWall.getTotalWhisperCount();
    const publicCount = await WhisperWall.getPublicWhisperCount();

    console.log("Total whispers:", totalCount.toString());
    console.log("Public whispers:", publicCount.toString());
    console.log("");

    if (totalCount > 0) {
      console.log("📝 Recent Public Whispers:");
      const publicIds = await WhisperWall.getPublicWhispers(0, 10);
      
      for (const id of publicIds) {
        const whisper = await WhisperWall.getWhisper(id);
        
        console.log(`\n#${id.toString()}`);
        console.log(`  Author: ${whisper.isAnonymous ? "Anonymous" : whisper.author}`);
        console.log(`  Content: ${whisper.plainContent || "[Encrypted]"}`);
        console.log(`  Tag: ${whisper.tag}`);
        console.log(`  Time: ${new Date(Number(whisper.timestamp) * 1000).toLocaleString()}`);
        console.log(`  Type: ${whisper.whisperType === 0 ? "Public" : "Private"}`);
        console.log(`  Mode: ${whisper.contentMode === 0 ? "Plain" : "Encrypted"}`);
        
        const votes = await WhisperWall.getWhisperVoteCount(id);
        console.log(`  Votes: 👍 ${votes[0].toString()} | 👎 ${votes[1].toString()}`);
      }
    }
  });


