import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

task("seed-whispers", "Seed test whispers to WhisperWall contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments, fhevm } = hre;
    
    const WhisperWallDeployment = await deployments.get("WhisperWall");
    const WhisperWall = await ethers.getContractAt(
      "WhisperWall",
      WhisperWallDeployment.address
    );

    const [deployer, user1, user2] = await ethers.getSigners();

    console.log("🌱 Seeding WhisperWall with test data...");
    console.log("Contract address:", WhisperWallDeployment.address);
    console.log("Deployer:", deployer.address);
    console.log("User1:", user1.address);
    console.log("User2:", user2.address);

    // Public Plain Whispers
    console.log("\n📝 Creating public plain whispers...");
    
    let tx = await WhisperWall.connect(deployer).postWhisper(
      0, // PUBLIC
      0, // PLAIN
      "Hello WhisperWall! This is my first public message 🎉",
      ethers.ZeroHash,
      "0x",
      ethers.ZeroAddress,
      "Random",
      false
    );
    await tx.wait();
    console.log("✅ Whisper 1 posted");

    tx = await WhisperWall.connect(user1).postWhisper(
      0, // PUBLIC
      0, // PLAIN
      "Just discovered this amazing privacy-first message board!",
      ethers.ZeroHash,
      "0x",
      ethers.ZeroAddress,
      "Appreciation",
      false
    );
    await tx.wait();
    console.log("✅ Whisper 2 posted");

    tx = await WhisperWall.connect(user2).postWhisper(
      0, // PUBLIC
      0, // PLAIN
      "Testing anonymous posting feature... Can you see who I am? 👀",
      ethers.ZeroHash,
      "0x",
      ethers.ZeroAddress,
      "Secret",
      true // Anonymous
    );
    await tx.wait();
    console.log("✅ Whisper 3 posted (anonymous)");

    tx = await WhisperWall.connect(deployer).postWhisper(
      0, // PUBLIC
      0, // PLAIN
      "FHEVM makes privacy so easy! Love the encryption features 🔐",
      ethers.ZeroHash,
      "0x",
      ethers.ZeroAddress,
      "Random",
      false
    );
    await tx.wait();
    console.log("✅ Whisper 4 posted");

    tx = await WhisperWall.connect(user1).postWhisper(
      0, // PUBLIC
      0, // PLAIN
      "Can't wait to try the encrypted messaging feature next!",
      ethers.ZeroHash,
      "0x",
      ethers.ZeroAddress,
      "Confession",
      false
    );
    await tx.wait();
    console.log("✅ Whisper 5 posted");

    // Private Plain Whispers
    console.log("\n💌 Creating private plain whispers...");
    
    tx = await WhisperWall.connect(deployer).postWhisper(
      1, // PRIVATE
      0, // PLAIN
      "Hey User1! This is a private message just for you 📨",
      ethers.ZeroHash,
      "0x",
      user1.address,
      "Random",
      false
    );
    await tx.wait();
    console.log("✅ Private whisper to User1 posted");

    tx = await WhisperWall.connect(user1).postWhisper(
      1, // PRIVATE
      0, // PLAIN
      "Thanks for the message! Private messaging works great 🎉",
      ethers.ZeroHash,
      "0x",
      deployer.address,
      "Appreciation",
      false
    );
    await tx.wait();
    console.log("✅ Private whisper to Deployer posted");

    // Add some votes
    console.log("\n👍 Adding some votes...");
    tx = await WhisperWall.connect(user1).voteWhisper(0, 1); // Like whisper 0
    await tx.wait();
    tx = await WhisperWall.connect(user2).voteWhisper(0, 1); // Like whisper 0
    await tx.wait();
    tx = await WhisperWall.connect(deployer).voteWhisper(1, 1); // Like whisper 1
    await tx.wait();
    tx = await WhisperWall.connect(user2).voteWhisper(2, 2); // Dislike whisper 2
    await tx.wait();
    console.log("✅ Votes added");

    // Get stats
    const totalCount = await WhisperWall.getTotalWhisperCount();
    const publicCount = await WhisperWall.getPublicWhisperCount();

    console.log("\n📊 Stats:");
    console.log("Total whispers:", totalCount.toString());
    console.log("Public whispers:", publicCount.toString());
    console.log("Private whispers:", (Number(totalCount) - Number(publicCount)).toString());
    console.log("\n✨ Seeding complete!");
    console.log("\n🌐 Test accounts:");
    console.log("  Deployer:", deployer.address);
    console.log("  User1:", user1.address);
    console.log("  User2:", user2.address);
    console.log("\n💡 Tips:");
    console.log("  - Visit http://localhost:3000/public-wall to see public whispers");
    console.log("  - Connect with different accounts to see /my-whispers");
    console.log("  - User1 and Deployer have private messages to each other");
  });

