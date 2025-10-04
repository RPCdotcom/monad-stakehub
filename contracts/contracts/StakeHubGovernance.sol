// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StakeHubGovernance
 * @dev Governance özelliği ile validatorlerin ve kullanıcıların oy kullanabilmesini sağlar
 */
contract StakeHubGovernance {
    // Ana StakeHub kontrat adresi
    address public stakeHubAddress;

    // Proposal yapısı
    struct Proposal {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) validatorVoted;
        mapping(address => bool) userVoted;
        mapping(uint8 => uint256) voteCount; // 1: Evet, 2: Hayır, 3: Çekimser
    }

    // Validator oy duyurusu
    struct ValidatorVoteAnnouncement {
        address validatorAddress;
        uint256 proposalId;
        uint8 vote;  // 1: Evet, 2: Hayır, 3: Çekimser
        string reason;
        uint256 timestamp;
    }

    // Kullanıcı oyu
    struct UserVote {
        address userAddress;
        uint256 proposalId;
        uint8 vote;  // 1: Evet, 2: Hayır, 3: Çekimser
        uint256 weight; // Stake miktarına göre oy ağırlığı
        uint256 timestamp;
    }

    // Proposals
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Validator oy duyuruları: proposal ID => validator adresi => duyuru
    mapping(uint256 => mapping(address => ValidatorVoteAnnouncement)) public validatorAnnouncements;
    
    // Kullanıcı oyları: proposal ID => kullanıcı adresi => oy
    mapping(uint256 => mapping(address => UserVote)) public userVotes;

    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string title);
    event ValidatorVoteAnnounced(uint256 indexed proposalId, address indexed validator, uint8 vote);
    event UserVoteCast(uint256 indexed proposalId, address indexed user, uint8 vote, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    // Errors
    error ProposalDoesNotExist();
    error ProposalAlreadyExecuted();
    error ProposalVotingPeriodNotStarted();
    error ProposalVotingPeriodEnded();
    error AlreadyVoted();
    error NotValidator();
    error NotStaker();

    // Constructor
    constructor(address _stakeHubAddress) {
        stakeHubAddress = _stakeHubAddress;
    }

    // StakeHub interface
    interface IStakeHub {
        function validators(address) external view returns (
            address payable addr,
            string memory name,
            string memory description,
            string memory socialLinks,
            uint256 commissionRate,
            uint256 totalStaked,
            uint256 uptime,
            uint256 userCount,
            bool isActive
        );
        
        function getUserStake(address _user, address _validatorAddr) external view returns (
            uint256 amount,
            uint256 since,
            bool autoCompound,
            uint256 rewards,
            uint256 lastClaim
        );
    }

    /**
     * @dev Yeni bir governance proposal oluşturur
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _durationInDays
    ) external returns (uint256) {
        // Sadece validator'lar proposal oluşturabilir
        IStakeHub stakeHub = IStakeHub(stakeHubAddress);
        (,,,,,,,, bool isActive) = stakeHub.validators(msg.sender);
        if (!isActive) revert NotValidator();

        uint256 proposalId = proposalCount++;
        Proposal storage newProposal = proposals[proposalId];
        
        newProposal.id = proposalId;
        newProposal.creator = msg.sender;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + (_durationInDays * 1 days);
        newProposal.executed = false;

        emit ProposalCreated(proposalId, msg.sender, _title);
        return proposalId;
    }

    /**
     * @dev Validator oy duyurusu yapar
     */
    function announceValidatorVote(
        uint256 _proposalId, 
        uint8 _vote,
        string memory _reason
    ) external {
        // Proposal varlığını kontrol et
        if (_proposalId >= proposalCount) revert ProposalDoesNotExist();
        Proposal storage proposal = proposals[_proposalId];
        
        // Voting süreci devam ediyor mu?
        if (block.timestamp < proposal.startTime) revert ProposalVotingPeriodNotStarted();
        if (block.timestamp > proposal.endTime) revert ProposalVotingPeriodEnded();
        if (proposal.executed) revert ProposalAlreadyExecuted();

        // Sadece validatorlar oy duyurusu yapabilir
        IStakeHub stakeHub = IStakeHub(stakeHubAddress);
        (,,,,,,,, bool isActive) = stakeHub.validators(msg.sender);
        if (!isActive) revert NotValidator();

        // Geçerli oy değeri mi?
        require(_vote >= 1 && _vote <= 3, "Invalid vote value");
        
        // Duyuruyu kaydet
        ValidatorVoteAnnouncement storage announcement = validatorAnnouncements[_proposalId][msg.sender];
        announcement.validatorAddress = msg.sender;
        announcement.proposalId = _proposalId;
        announcement.vote = _vote;
        announcement.reason = _reason;
        announcement.timestamp = block.timestamp;

        // Validator oyunu kaydet
        proposal.validatorVoted[msg.sender] = true;
        proposal.voteCount[_vote]++;

        emit ValidatorVoteAnnounced(_proposalId, msg.sender, _vote);
    }

    /**
     * @dev Kullanıcı oy kullanır
     */
    function castUserVote(uint256 _proposalId, uint8 _vote, address _validatorAddr) external {
        // Proposal varlığını kontrol et
        if (_proposalId >= proposalCount) revert ProposalDoesNotExist();
        Proposal storage proposal = proposals[_proposalId];
        
        // Voting süreci devam ediyor mu?
        if (block.timestamp < proposal.startTime) revert ProposalVotingPeriodNotStarted();
        if (block.timestamp > proposal.endTime) revert ProposalVotingPeriodEnded();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.userVoted[msg.sender]) revert AlreadyVoted();

        // Geçerli oy değeri mi?
        require(_vote >= 1 && _vote <= 3, "Invalid vote value");
        
        // Kullanıcının stake ettiğini kontrol et
        IStakeHub stakeHub = IStakeHub(stakeHubAddress);
        (uint256 stakeAmount,,,, ) = stakeHub.getUserStake(msg.sender, _validatorAddr);
        if (stakeAmount == 0) revert NotStaker();
        
        // Oy ağırlığı stake miktarına göre belirlenir
        uint256 voteWeight = stakeAmount;
        
        // Oyu kaydet
        UserVote storage vote = userVotes[_proposalId][msg.sender];
        vote.userAddress = msg.sender;
        vote.proposalId = _proposalId;
        vote.vote = _vote;
        vote.weight = voteWeight;
        vote.timestamp = block.timestamp;

        // Kullanıcı oyunu kaydet
        proposal.userVoted[msg.sender] = true;
        proposal.voteCount[_vote] += voteWeight;

        emit UserVoteCast(_proposalId, msg.sender, _vote, voteWeight);
    }

    /**
     * @dev Proposal sonuçlarını uygula
     */
    function executeProposal(uint256 _proposalId) external {
        // Proposal varlığını kontrol et
        if (_proposalId >= proposalCount) revert ProposalDoesNotExist();
        Proposal storage proposal = proposals[_proposalId];
        
        // Oylama bitmiş mi?
        require(block.timestamp > proposal.endTime, "Voting period not ended yet");
        require(!proposal.executed, "Proposal already executed");
        
        // Sadece yaratıcı yürütebilir
        require(msg.sender == proposal.creator, "Only creator can execute");
        
        // Proposal'ı yürütüldü olarak işaretle
        proposal.executed = true;
        
        emit ProposalExecuted(_proposalId);
    }

    /**
     * @dev Proposal hakkında detaylı bilgi döndürür
     */
    function getProposalDetails(uint256 _proposalId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 abstainVotes
    ) {
        if (_proposalId >= proposalCount) revert ProposalDoesNotExist();
        Proposal storage proposal = proposals[_proposalId];
        
        return (
            proposal.creator,
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.voteCount[1],  // Evet
            proposal.voteCount[2],  // Hayır
            proposal.voteCount[3]   // Çekimser
        );
    }
    
    /**
     * @dev Validator'ın oy duyurusunu kontrol eder
     */
    function getValidatorAnnouncement(uint256 _proposalId, address _validatorAddr) external view returns (
        address validatorAddress,
        uint8 vote,
        string memory reason,
        uint256 timestamp
    ) {
        ValidatorVoteAnnouncement storage announcement = validatorAnnouncements[_proposalId][_validatorAddr];
        return (
            announcement.validatorAddress,
            announcement.vote,
            announcement.reason,
            announcement.timestamp
        );
    }
    
    /**
     * @dev Kullanıcının oyunu kontrol eder
     */
    function getUserVote(uint256 _proposalId, address _userAddr) external view returns (
        address userAddress,
        uint8 vote,
        uint256 weight,
        uint256 timestamp
    ) {
        UserVote storage userVote = userVotes[_proposalId][_userAddr];
        return (
            userVote.userAddress,
            userVote.vote,
            userVote.weight,
            userVote.timestamp
        );
    }
    
    /**
     * @dev Kullanıcının validator oyunu takip edip etmediğini kontrol eder
     */
    function didUserFollowValidator(uint256 _proposalId, address _userAddr, address _validatorAddr) external view returns (bool) {
        UserVote storage userVote = userVotes[_proposalId][_userAddr];
        ValidatorVoteAnnouncement storage announcement = validatorAnnouncements[_proposalId][_validatorAddr];
        
        // Eğer kullanıcı oy kullanmamışsa veya validator duyuru yapmamışsa false döner
        if (userVote.userAddress == address(0) || announcement.validatorAddress == address(0)) {
            return false;
        }
        
        // Kullanıcı ve validator aynı yönde oy kullanmışsa true döner
        return userVote.vote == announcement.vote;
    }
}