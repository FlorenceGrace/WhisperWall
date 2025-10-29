import { expect } from "chai";
import { ethers, deployments, fhevm } from "hardhat";

describe("WhisperWall", function () {
  let whisperWall: any;
  let alice: any, bob: any, carol: any;

  beforeEach(async function () {
    // Skip if not mock environment
    if (!fhevm.isMock) {
      console.warn("This test suite requires FHEVM mock environment");
      this.skip();
    }

    await deployments.fixture(["WhisperWall"]);
    [alice, bob, carol] = await ethers.getSigners();
    
    const whisperWallDeployment = await deployments.get("WhisperWall");
    whisperWall = await ethers.getContractAt("WhisperWall", whisperWallDeployment.address);
  });

  describe("Posting Whispers", function () {
    it("should post a public plain whisper", async function () {
      const tx = await whisperWall.connect(alice).postWhisper(
        0, // PUBLIC
        0, // PLAIN
        "Hello World!",
        ethers.ZeroHash, // Dummy encrypted content handle
        "0x",
        ethers.ZeroAddress,
        "Random",
        false
      );

      await expect(tx).to.emit(whisperWall, "WhisperPosted");

      const whisperIds = await whisperWall.getPublicWhispers(0, 10);
      expect(whisperIds.length).to.equal(1);

      const whisper = await whisperWall.getWhisper(whisperIds[0]);
      expect(whisper.plainContent).to.equal("Hello World!");
      expect(whisper.author).to.equal(alice.address);
    });

    it("should post a public encrypted whisper", async function () {
      const contractAddress = await whisperWall.getAddress();
      
      // Convert "Secret Message" to bytes and encrypt
      const messageBytes = ethers.toUtf8Bytes("Secret Message");
      const messageBigInt = BigInt("0x" + Buffer.from(messageBytes).toString("hex"));
      
      const encryptedInput = await fhevm.createEncryptedInput(contractAddress, alice.address);
      encryptedInput.add256(messageBigInt);
      const encrypted = await encryptedInput.encrypt();

      const tx = await whisperWall.connect(alice).postWhisper(
        0, // PUBLIC
        1, // ENCRYPTED
        "",
        encrypted.handles[0],
        encrypted.inputProof,
        ethers.ZeroAddress,
        "Secret",
        true // anonymous
      );

      await expect(tx).to.emit(whisperWall, "WhisperPosted");

      const whisperIds = await whisperWall.getPublicWhispers(0, 10);
      expect(whisperIds.length).to.equal(1);

      const whisper = await whisperWall.getWhisper(whisperIds[0]);
      expect(whisper.contentMode).to.equal(1); // ENCRYPTED
      expect(whisper.isAnonymous).to.equal(true);
    });

    it("should post a private encrypted whisper", async function () {
      const contractAddress = await whisperWall.getAddress();
      
      const messageBytes = ethers.toUtf8Bytes("Private Secret");
      const messageBigInt = BigInt("0x" + Buffer.from(messageBytes).toString("hex"));
      
      const encryptedInput = await fhevm.createEncryptedInput(contractAddress, alice.address);
      encryptedInput.add256(messageBigInt);
      const encrypted = await encryptedInput.encrypt();

      const tx = await whisperWall.connect(alice).postWhisper(
        1, // PRIVATE
        1, // ENCRYPTED
        "",
        encrypted.handles[0],
        encrypted.inputProof,
        bob.address,
        "Confession",
        false
      );

      await expect(tx).to.emit(whisperWall, "WhisperPosted");

      // Bob should see it in inbox
      const bobInbox = await whisperWall.connect(bob).getPrivateInbox(0, 10);
      expect(bobInbox.length).to.equal(1);

      const whisper = await whisperWall.getWhisper(bobInbox[0]);
      expect(whisper.recipient).to.equal(bob.address);
      expect(whisper.whisperType).to.equal(1); // PRIVATE
    });

    it("should revert when posting private whisper without recipient", async function () {
      await expect(
        whisperWall.connect(alice).postWhisper(
          1, // PRIVATE
          0, // PLAIN
          "Private message",
          ethers.ZeroHash,
          "0x",
          ethers.ZeroAddress, // Missing recipient
          "Random",
          false
        )
      ).to.be.revertedWithCustomError(whisperWall, "RecipientRequired");
    });

    it("should revert when posting plain whisper with empty content", async function () {
      await expect(
        whisperWall.connect(alice).postWhisper(
          0, // PUBLIC
          0, // PLAIN
          "", // Empty content
          ethers.ZeroHash,
          "0x",
          ethers.ZeroAddress,
          "Random",
          false
        )
      ).to.be.revertedWithCustomError(whisperWall, "ContentRequired");
    });
  });

  describe("Deleting Whispers", function () {
    it("should allow author to delete their whisper", async function () {
      await whisperWall.connect(alice).postWhisper(
        0, // PUBLIC
        0, // PLAIN
        "Delete me",
        ethers.ZeroHash,
        "0x",
        ethers.ZeroAddress,
        "Random",
        false
      );

      const whisperIds = await whisperWall.getPublicWhispers(0, 10);
      const whisperId = whisperIds[0];

      const tx = await whisperWall.connect(alice).deleteWhisper(whisperId);
      await expect(tx).to.emit(whisperWall, "WhisperDeleted").withArgs(whisperId);

      const whisper = await whisperWall.getWhisper(whisperId);
      expect(whisper.isDeleted).to.equal(true);
    });

    it("should not allow non-author to delete whisper", async function () {
      await whisperWall.connect(alice).postWhisper(
        0, // PUBLIC
        0, // PLAIN
        "Alice's message",
        ethers.ZeroHash,
        "0x",
        ethers.ZeroAddress,
        "Random",
        false
      );

      const whisperIds = await whisperWall.getPublicWhispers(0, 10);
      const whisperId = whisperIds[0];

      await expect(
        whisperWall.connect(bob).deleteWhisper(whisperId)
      ).to.be.revertedWithCustomError(whisperWall, "UnauthorizedAccess");
    });
  });

  describe("Voting on Whispers", function () {
    let whisperId: number;

    beforeEach(async function () {
      await whisperWall.connect(alice).postWhisper(
        0, // PUBLIC
        0, // PLAIN
        "Vote for me!",
        ethers.ZeroHash,
        "0x",
        ethers.ZeroAddress,
        "Random",
        false
      );

      const whisperIds = await whisperWall.getPublicWhispers(0, 10);
      whisperId = whisperIds[0];
    });

    it("should allow liking a whisper", async function () {
      const tx = await whisperWall.connect(bob).voteWhisper(whisperId, 1); // LIKE
      await expect(tx).to.emit(whisperWall, "WhisperVoted");

      const myVote = await whisperWall.connect(bob).getMyVote(whisperId);
      expect(myVote).to.equal(1); // LIKE
    });

    it("should allow disliking a whisper", async function () {
      const tx = await whisperWall.connect(bob).voteWhisper(whisperId, 2); // DISLIKE
      await expect(tx).to.emit(whisperWall, "WhisperVoted");

      const myVote = await whisperWall.connect(bob).getMyVote(whisperId);
      expect(myVote).to.equal(2); // DISLIKE
    });

    it("should allow changing vote", async function () {
      await whisperWall.connect(bob).voteWhisper(whisperId, 1); // LIKE
      
      let myVote = await whisperWall.connect(bob).getMyVote(whisperId);
      expect(myVote).to.equal(1);

      await whisperWall.connect(bob).voteWhisper(whisperId, 2); // Change to DISLIKE
      
      myVote = await whisperWall.connect(bob).getMyVote(whisperId);
      expect(myVote).to.equal(2);
    });

    it("should allow removing vote", async function () {
      await whisperWall.connect(bob).voteWhisper(whisperId, 1); // LIKE
      await whisperWall.connect(bob).voteWhisper(whisperId, 0); // NONE (remove)
      
      const myVote = await whisperWall.connect(bob).getMyVote(whisperId);
      expect(myVote).to.equal(0); // NONE
    });
  });

  describe("Access Control", function () {
    it("should allow author to grant decrypt access", async function () {
      const contractAddress = await whisperWall.getAddress();
      
      const messageBytes = ethers.toUtf8Bytes("Secret");
      const messageBigInt = BigInt("0x" + Buffer.from(messageBytes).toString("hex"));
      
      const encryptedInput = await fhevm.createEncryptedInput(contractAddress, alice.address);
      encryptedInput.add256(messageBigInt);
      const encrypted = await encryptedInput.encrypt();

      await whisperWall.connect(alice).postWhisper(
        0, // PUBLIC
        1, // ENCRYPTED
        "",
        encrypted.handles[0],
        encrypted.inputProof,
        ethers.ZeroAddress,
        "Secret",
        false
      );

      const whisperIds = await whisperWall.getPublicWhispers(0, 10);
      const whisperId = whisperIds[0];

      const tx = await whisperWall.connect(alice).grantDecryptAccess(whisperId, carol.address);
      await expect(tx).to.emit(whisperWall, "DecryptAccessGranted");
    });

    it("should not allow non-author to grant decrypt access", async function () {
      const contractAddress = await whisperWall.getAddress();
      
      const messageBytes = ethers.toUtf8Bytes("Secret");
      const messageBigInt = BigInt("0x" + Buffer.from(messageBytes).toString("hex"));
      
      const encryptedInput = await fhevm.createEncryptedInput(contractAddress, alice.address);
      encryptedInput.add256(messageBigInt);
      const encrypted = await encryptedInput.encrypt();

      await whisperWall.connect(alice).postWhisper(
        0, // PUBLIC
        1, // ENCRYPTED
        "",
        encrypted.handles[0],
        encrypted.inputProof,
        ethers.ZeroAddress,
        "Secret",
        false
      );

      const whisperIds = await whisperWall.getPublicWhispers(0, 10);
      const whisperId = whisperIds[0];

      await expect(
        whisperWall.connect(bob).grantDecryptAccess(whisperId, carol.address)
      ).to.be.revertedWithCustomError(whisperWall, "UnauthorizedAccess");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Alice posts 3 public whispers
      for (let i = 0; i < 3; i++) {
        await whisperWall.connect(alice).postWhisper(
          0, // PUBLIC
          0, // PLAIN
          `Message ${i}`,
          ethers.ZeroHash,
          "0x",
          ethers.ZeroAddress,
          "Random",
          false
        );
      }

      // Bob posts 2 public whispers
      for (let i = 0; i < 2; i++) {
        await whisperWall.connect(bob).postWhisper(
          0, // PUBLIC
          0, // PLAIN
          `Bob's message ${i}`,
          ethers.ZeroHash,
          "0x",
          ethers.ZeroAddress,
          "Appreciation",
          false
        );
      }
    });

    it("should return correct public whisper count", async function () {
      const count = await whisperWall.getPublicWhisperCount();
      expect(count).to.equal(5);
    });

    it("should return public whispers with pagination", async function () {
      const firstPage = await whisperWall.getPublicWhispers(0, 3);
      expect(firstPage.length).to.equal(3);

      const secondPage = await whisperWall.getPublicWhispers(3, 3);
      expect(secondPage.length).to.equal(2);
    });

    it("should return user's whispers", async function () {
      const aliceWhispers = await whisperWall.connect(alice).getMyWhispers(0, 10);
      expect(aliceWhispers.length).to.equal(3);

      const bobWhispers = await whisperWall.connect(bob).getMyWhispers(0, 10);
      expect(bobWhispers.length).to.equal(2);
    });

    it("should return total whisper count", async function () {
      const total = await whisperWall.getTotalWhisperCount();
      expect(total).to.equal(5);
    });
  });
});

