// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint32, euint256, ebool, externalEuint256} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title WhisperWall - Privacy-Preserving Message Board
/// @author WhisperWall Team
/// @notice A decentralized message board supporting public/private and plain/encrypted messages using FHEVM
contract WhisperWall is SepoliaConfig {
    enum WhisperType { PUBLIC, PRIVATE }
    enum ContentMode { PLAIN, ENCRYPTED }
    enum VoteType { NONE, LIKE, DISLIKE }

    struct Whisper {
        uint256 id;
        address author;
        WhisperType whisperType;
        ContentMode contentMode;
        string plainContent;        // Plain text content (if PLAIN mode)
        euint256 encryptedContent;  // Encrypted content (if ENCRYPTED mode)
        address recipient;          // Recipient address (for PRIVATE whispers only)
        string tag;                 // Tag: Confession, Appreciation, Secret, Random
        uint256 timestamp;
        bool isAnonymous;           // Whether to hide author in UI (still on-chain)
        bool isDeleted;             // Soft delete flag
    }

    // State variables
    uint256 private _whisperIdCounter;
    mapping(uint256 => Whisper) private _whispers;
    mapping(uint256 => euint32) private _likeCount;
    mapping(uint256 => euint32) private _dislikeCount;
    mapping(uint256 => mapping(address => VoteType)) private _votes;
    
    uint256[] private _publicWhisperIds;
    mapping(address => uint256[]) private _userWhisperIds;
    mapping(address => uint256[]) private _privateInboxIds;

    // Events
    event WhisperPosted(uint256 indexed whisperId, address indexed author, WhisperType whisperType, ContentMode contentMode);
    event WhisperDeleted(uint256 indexed whisperId);
    event WhisperVoted(uint256 indexed whisperId, address indexed voter, VoteType voteType);
    event DecryptAccessGranted(uint256 indexed whisperId, address indexed grantee);
    event DecryptAccessRevoked(uint256 indexed whisperId, address indexed revokee);

    // Custom errors
    error UnauthorizedAccess();
    error WhisperNotFound();
    error WhisperAlreadyDeleted();
    error InvalidWhisperType();
    error InvalidContentMode();
    error RecipientRequired();
    error ContentRequired();

    /// @notice Post a new whisper
    /// @param whisperType PUBLIC or PRIVATE
    /// @param contentMode PLAIN or ENCRYPTED
    /// @param plainContent Plain text content (used if contentMode is PLAIN)
    /// @param encryptedContentHandle Encrypted content handle (used if contentMode is ENCRYPTED)
    /// @param inputProof Input proof for encrypted content
    /// @param recipient Recipient address (required for PRIVATE whispers)
    /// @param tag Message tag
    /// @param isAnonymous Whether to display as anonymous
    function postWhisper(
        WhisperType whisperType,
        ContentMode contentMode,
        string calldata plainContent,
        externalEuint256 encryptedContentHandle,
        bytes calldata inputProof,
        address recipient,
        string calldata tag,
        bool isAnonymous
    ) external returns (uint256) {
        // Validation
        if (whisperType == WhisperType.PRIVATE && recipient == address(0)) {
            revert RecipientRequired();
        }
        
        if (contentMode == ContentMode.PLAIN && bytes(plainContent).length == 0) {
            revert ContentRequired();
        }

        uint256 whisperId = _whisperIdCounter++;
        
        Whisper storage whisper = _whispers[whisperId];
        whisper.id = whisperId;
        whisper.author = msg.sender;
        whisper.whisperType = whisperType;
        whisper.contentMode = contentMode;
        whisper.recipient = recipient;
        whisper.tag = tag;
        whisper.timestamp = block.timestamp;
        whisper.isAnonymous = isAnonymous;
        whisper.isDeleted = false;

        // Handle content based on mode
        if (contentMode == ContentMode.PLAIN) {
            whisper.plainContent = plainContent;
        } else {
            // ENCRYPTED mode
            euint256 encryptedContent = FHE.fromExternal(encryptedContentHandle, inputProof);
            whisper.encryptedContent = encryptedContent;
            
            // Grant access to author
            FHE.allowThis(encryptedContent);
            FHE.allow(encryptedContent, msg.sender);
            
            // Grant access to recipient if PRIVATE
            if (whisperType == WhisperType.PRIVATE) {
                FHE.allow(encryptedContent, recipient);
            }
        }

        // Initialize vote counts
        _likeCount[whisperId] = FHE.asEuint32(0);
        _dislikeCount[whisperId] = FHE.asEuint32(0);
        FHE.allowThis(_likeCount[whisperId]);
        FHE.allowThis(_dislikeCount[whisperId]);

        // Index the whisper
        if (whisperType == WhisperType.PUBLIC) {
            _publicWhisperIds.push(whisperId);
        } else {
            _privateInboxIds[recipient].push(whisperId);
        }
        _userWhisperIds[msg.sender].push(whisperId);

        emit WhisperPosted(whisperId, msg.sender, whisperType, contentMode);
        
        return whisperId;
    }

    /// @notice Soft delete a whisper (only author can delete)
    /// @param whisperId The whisper ID to delete
    function deleteWhisper(uint256 whisperId) external {
        Whisper storage whisper = _whispers[whisperId];
        
        if (whisper.author != msg.sender) {
            revert UnauthorizedAccess();
        }
        
        whisper.isDeleted = true;
        
        emit WhisperDeleted(whisperId);
    }

    /// @notice Vote on a whisper (like or dislike)
    /// @param whisperId The whisper ID
    /// @param voteType LIKE or DISLIKE
    function voteWhisper(uint256 whisperId, VoteType voteType) external {
        if (whisperId >= _whisperIdCounter) {
            revert WhisperNotFound();
        }
        
        Whisper storage whisper = _whispers[whisperId];
        if (whisper.isDeleted) {
            revert WhisperAlreadyDeleted();
        }

        VoteType previousVote = _votes[whisperId][msg.sender];
        
        // Remove previous vote
        if (previousVote == VoteType.LIKE) {
            _likeCount[whisperId] = FHE.sub(_likeCount[whisperId], FHE.asEuint32(1));
        } else if (previousVote == VoteType.DISLIKE) {
            _dislikeCount[whisperId] = FHE.sub(_dislikeCount[whisperId], FHE.asEuint32(1));
        }

        // Add new vote
        if (voteType == VoteType.LIKE) {
            _likeCount[whisperId] = FHE.add(_likeCount[whisperId], FHE.asEuint32(1));
        } else if (voteType == VoteType.DISLIKE) {
            _dislikeCount[whisperId] = FHE.add(_dislikeCount[whisperId], FHE.asEuint32(1));
        }

        _votes[whisperId][msg.sender] = voteType;

        FHE.allowThis(_likeCount[whisperId]);
        FHE.allowThis(_dislikeCount[whisperId]);

        emit WhisperVoted(whisperId, msg.sender, voteType);
    }

    /// @notice Request decryption access for a PUBLIC encrypted whisper (anyone can call)
    /// @param whisperId ID of the whisper
    function requestDecryptAccess(uint256 whisperId) external {
        Whisper storage whisper = _whispers[whisperId];
        
        if (whisper.isDeleted) {
            revert WhisperAlreadyDeleted();
        }
        
        if (whisper.contentMode != ContentMode.ENCRYPTED) {
            return; // No need to grant access for plain content
        }
        
        // For PUBLIC whispers, allow anyone to request access
        if (whisper.whisperType == WhisperType.PUBLIC) {
            FHE.allow(whisper.encryptedContent, msg.sender);
            emit DecryptAccessGranted(whisperId, msg.sender);
            return;
        }
        
        // For PRIVATE whispers, only author and recipient can request access
        if (msg.sender == whisper.author || msg.sender == whisper.recipient) {
            FHE.allow(whisper.encryptedContent, msg.sender);
            emit DecryptAccessGranted(whisperId, msg.sender);
        } else {
            revert UnauthorizedAccess();
        }
    }

    /// @notice Grant decrypt access to an address for an encrypted whisper
    /// @param whisperId The whisper ID
    /// @param targetAddress Address to grant access
    function grantDecryptAccess(uint256 whisperId, address targetAddress) external {
        Whisper storage whisper = _whispers[whisperId];
        
        if (whisper.author != msg.sender) {
            revert UnauthorizedAccess();
        }
        
        if (whisper.contentMode != ContentMode.ENCRYPTED) {
            return; // No need to grant access for plain content
        }

        FHE.allow(whisper.encryptedContent, targetAddress);
        
        emit DecryptAccessGranted(whisperId, targetAddress);
    }

    /// @notice Revoke decrypt access (note: cannot revoke ACL permissions, only emit event)
    /// @param whisperId The whisper ID
    /// @param targetAddress Address to revoke access from
    function revokeDecryptAccess(uint256 whisperId, address targetAddress) external {
        Whisper storage whisper = _whispers[whisperId];
        
        if (whisper.author != msg.sender) {
            revert UnauthorizedAccess();
        }

        emit DecryptAccessRevoked(whisperId, targetAddress);
    }

    /// @notice Get public whispers with pagination
    /// @param offset Starting index
    /// @param limit Maximum number of whispers to return
    /// @return whisperIds Array of whisper IDs
    function getPublicWhispers(uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        uint256 total = _publicWhisperIds.length;
        
        if (offset >= total) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        uint256[] memory result = new uint256[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = _publicWhisperIds[total - 1 - offset - i]; // Reverse order (newest first)
        }

        return result;
    }

    /// @notice Get whispers posted by the caller
    /// @param offset Starting index
    /// @param limit Maximum number of whispers to return
    /// @return whisperIds Array of whisper IDs
    function getMyWhispers(uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        uint256[] storage userWhispers = _userWhisperIds[msg.sender];
        uint256 total = userWhispers.length;
        
        if (offset >= total) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        uint256[] memory result = new uint256[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = userWhispers[total - 1 - offset - i]; // Reverse order (newest first)
        }

        return result;
    }

    /// @notice Get private whispers received by the caller
    /// @param offset Starting index
    /// @param limit Maximum number of whispers to return
    /// @return whisperIds Array of whisper IDs
    function getPrivateInbox(uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        uint256[] storage inboxWhispers = _privateInboxIds[msg.sender];
        uint256 total = inboxWhispers.length;
        
        if (offset >= total) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 resultLength = end - offset;
        uint256[] memory result = new uint256[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = inboxWhispers[total - 1 - offset - i]; // Reverse order (newest first)
        }

        return result;
    }

    /// @notice Get whisper details by ID
    /// @param whisperId The whisper ID
    /// @return id Whisper ID
    /// @return author Author address
    /// @return whisperType PUBLIC or PRIVATE
    /// @return contentMode PLAIN or ENCRYPTED
    /// @return plainContent Plain text content
    /// @return encryptedContent Encrypted content handle
    /// @return recipient Recipient address
    /// @return tag Message tag
    /// @return timestamp Timestamp
    /// @return isAnonymous Anonymous flag
    /// @return isDeleted Deleted flag
    function getWhisper(uint256 whisperId) external view returns (
        uint256 id,
        address author,
        WhisperType whisperType,
        ContentMode contentMode,
        string memory plainContent,
        euint256 encryptedContent,
        address recipient,
        string memory tag,
        uint256 timestamp,
        bool isAnonymous,
        bool isDeleted
    ) {
        if (whisperId >= _whisperIdCounter) {
            revert WhisperNotFound();
        }

        Whisper storage whisper = _whispers[whisperId];
        
        return (
            whisper.id,
            whisper.author,
            whisper.whisperType,
            whisper.contentMode,
            whisper.plainContent,
            whisper.encryptedContent,
            whisper.recipient,
            whisper.tag,
            whisper.timestamp,
            whisper.isAnonymous,
            whisper.isDeleted
        );
    }

    /// @notice Get vote counts for a whisper (returns encrypted handles)
    /// @param whisperId The whisper ID
    /// @return likeCount Encrypted like count
    /// @return dislikeCount Encrypted dislike count
    function getWhisperVoteCount(uint256 whisperId) external view returns (euint32, euint32) {
        if (whisperId >= _whisperIdCounter) {
            revert WhisperNotFound();
        }

        return (_likeCount[whisperId], _dislikeCount[whisperId]);
    }

    /// @notice Get caller's vote status for a whisper
    /// @param whisperId The whisper ID
    /// @return voteType The vote type (NONE, LIKE, or DISLIKE)
    function getMyVote(uint256 whisperId) external view returns (VoteType) {
        return _votes[whisperId][msg.sender];
    }

    /// @notice Get total whisper count
    /// @return Total number of whispers posted
    function getTotalWhisperCount() external view returns (uint256) {
        return _whisperIdCounter;
    }

    /// @notice Get total public whisper count
    /// @return Total number of public whispers
    function getPublicWhisperCount() external view returns (uint256) {
        return _publicWhisperIds.length;
    }
}

