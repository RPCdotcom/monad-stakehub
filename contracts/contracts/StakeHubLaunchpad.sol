// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StakeHubLaunchpad
 * @dev Validatorler için crowdfunding launchpad özelliği sağlar
 */
contract StakeHubLaunchpad {
    // Ana StakeHub kontrat adresi
    address public stakeHubAddress;

    // Launchpad proje yapısı
    struct Project {
        uint256 id;
        address validatorAddress;
        string name;
        string description;
        string tokenSymbol;
        uint256 targetAmount;
        uint256 minContribution;
        uint256 totalRaised;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool fundingSuccessful;
        mapping(address => uint256) contributions;
        address[] contributors;
    }

    // Tier yapısı
    struct Tier {
        uint256 id;
        uint256 projectId;
        string name;
        uint256 minStakeRequired;
        uint256 maxAllocation;
        uint256 duration; // Tier'a özel erken erişim süresi (saniye)
    }

    // Projeler
    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    // Tier'lar: project ID => tier array index => tier
    mapping(uint256 => Tier[]) public projectTiers;

    // Kullanıcının katıldığı projeler: user address => project IDs
    mapping(address => uint256[]) public userProjects;

    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed validatorAddress, string name);
    event TierAdded(uint256 indexed projectId, uint256 indexed tierId, string name);
    event ContributionMade(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event ProjectStateChanged(uint256 indexed projectId, bool active);
    event FundingSuccessful(uint256 indexed projectId, uint256 totalRaised);
    event FundingFailed(uint256 indexed projectId, uint256 totalRaised);

    // Errors
    error NotValidator();
    error ProjectDoesNotExist();
    error ProjectNotActive();
    error ContributionTooLow();
    error ContributionTooHigh();
    error FundingPeriodNotStarted();
    error FundingPeriodEnded();
    error InvalidTierConfiguration();
    error InsufficientStakeForTier();
    error NotAuthorized();

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
     * @dev Yeni bir launchpad projesi oluşturur
     */
    function createProject(
        string memory _name,
        string memory _description,
        string memory _tokenSymbol,
        uint256 _targetAmount,
        uint256 _minContribution,
        uint256 _durationInDays
    ) external returns (uint256) {
        // Sadece validator'lar proje oluşturabilir
        IStakeHub stakeHub = IStakeHub(stakeHubAddress);
        (,,,,,,,, bool isActive) = stakeHub.validators(msg.sender);
        if (!isActive) revert NotValidator();

        uint256 projectId = projectCount++;
        Project storage newProject = projects[projectId];
        
        newProject.id = projectId;
        newProject.validatorAddress = msg.sender;
        newProject.name = _name;
        newProject.description = _description;
        newProject.tokenSymbol = _tokenSymbol;
        newProject.targetAmount = _targetAmount;
        newProject.minContribution = _minContribution;
        newProject.totalRaised = 0;
        newProject.startTime = block.timestamp;
        newProject.endTime = block.timestamp + (_durationInDays * 1 days);
        newProject.active = true;
        newProject.fundingSuccessful = false;

        emit ProjectCreated(projectId, msg.sender, _name);
        return projectId;
    }

    /**
     * @dev Projeye tier ekler
     */
    function addTier(
        uint256 _projectId,
        string memory _name,
        uint256 _minStakeRequired,
        uint256 _maxAllocation,
        uint256 _durationInHours
    ) external {
        // Proje var mı kontrol et
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        Project storage project = projects[_projectId];
        
        // Sadece proje sahibi tier ekleyebilir
        require(msg.sender == project.validatorAddress, "Only project owner can add tiers");
        
        // Tier değerleri geçerli mi kontrol et
        if (_minStakeRequired == 0 || _maxAllocation == 0) revert InvalidTierConfiguration();
        
        // Yeni tier oluştur
        uint256 tierId = projectTiers[_projectId].length;
        
        Tier memory newTier = Tier({
            id: tierId,
            projectId: _projectId,
            name: _name,
            minStakeRequired: _minStakeRequired,
            maxAllocation: _maxAllocation,
            duration: _durationInHours * 1 hours
        });
        
        projectTiers[_projectId].push(newTier);
        
        emit TierAdded(_projectId, tierId, _name);
    }

    /**
     * @dev Projeye katkıda bulunur
     */
    function contributeToProject(uint256 _projectId, uint256 _tierId) external payable {
        // Proje var mı kontrol et
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        Project storage project = projects[_projectId];
        
        // Proje aktif mi?
        if (!project.active) revert ProjectNotActive();
        
        // Fonlama süreci devam ediyor mu?
        if (block.timestamp < project.startTime) revert FundingPeriodNotStarted();
        if (block.timestamp > project.endTime) revert FundingPeriodEnded();
        
        // Katkı miktarı yeterli mi?
        if (msg.value < project.minContribution) revert ContributionTooLow();
        
        // Tier kontrolü
        Tier[] memory tiers = projectTiers[_projectId];
        if (_tierId >= tiers.length) revert InvalidTierConfiguration();
        
        Tier memory tier = tiers[_tierId];
        
        // Kullanıcının stake miktarı yeterli mi?
        IStakeHub stakeHub = IStakeHub(stakeHubAddress);
        (uint256 stakeAmount,,,, ) = stakeHub.getUserStake(msg.sender, project.validatorAddress);
        
        if (stakeAmount < tier.minStakeRequired) revert InsufficientStakeForTier();
        
        // Tier bazlı maksimum katkı kontrolü
        if (msg.value > tier.maxAllocation) revert ContributionTooHigh();
        
        // Daha önce katkıda bulunmuş mu?
        if (project.contributions[msg.sender] == 0) {
            project.contributors.push(msg.sender);
            userProjects[msg.sender].push(_projectId);
        }
        
        // Katkıyı kaydet
        project.contributions[msg.sender] += msg.value;
        project.totalRaised += msg.value;
        
        emit ContributionMade(_projectId, msg.sender, msg.value);
        
        // Hedef tutara ulaşıldı mı kontrol et
        if (project.totalRaised >= project.targetAmount) {
            _finalizeProject(_projectId, true);
        }
    }

    /**
     * @dev Projeyi sonlandırır ve sonucu belirler
     */
    function finalizeProject(uint256 _projectId) external {
        // Proje var mı kontrol et
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        Project storage project = projects[_projectId];
        
        // Sadece validator projeyi sonlandırabilir
        if (msg.sender != project.validatorAddress) revert NotAuthorized();
        
        // Fonlama süresi bitmiş mi?
        require(block.timestamp > project.endTime, "Funding period not ended yet");
        
        // Projeyi sonlandır
        bool success = project.totalRaised >= project.targetAmount;
        _finalizeProject(_projectId, success);
    }

    /**
     * @dev Projeyi dahili olarak sonlandırır
     */
    function _finalizeProject(uint256 _projectId, bool _success) internal {
        Project storage project = projects[_projectId];
        
        // Projeyi deaktive et
        project.active = false;
        project.fundingSuccessful = _success;
        
        emit ProjectStateChanged(_projectId, false);
        
        if (_success) {
            // Toplanan fonları validator'a aktar
            payable(project.validatorAddress).transfer(project.totalRaised);
            emit FundingSuccessful(_projectId, project.totalRaised);
        } else {
            // Başarısız olduğunda fonları iade et işlemi burada olacak
            // NOT: Güvenlik nedeniyle withdraw pattern kullanmak daha güvenlidir
            emit FundingFailed(_projectId, project.totalRaised);
        }
    }

    /**
     * @dev Kullanıcı başarısız projeden parasını çeker
     */
    function withdrawContribution(uint256 _projectId) external {
        // Proje var mı kontrol et
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        Project storage project = projects[_projectId];
        
        // Proje başarısız sonlanmış mı?
        require(!project.active, "Project is still active");
        require(!project.fundingSuccessful, "Cannot withdraw from successful project");
        
        uint256 contribution = project.contributions[msg.sender];
        require(contribution > 0, "No contribution to withdraw");
        
        // Katkıyı sıfırla ve parayı gönder
        project.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(contribution);
    }

    /**
     * @dev Kullanıcının projeye olan katkısını döndürür
     */
    function getUserContribution(uint256 _projectId, address _contributor) external view returns (uint256) {
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        return projects[_projectId].contributions[_contributor];
    }
    
    /**
     * @dev Projenin tüm katılımcılarını döndürür
     */
    function getProjectContributors(uint256 _projectId) external view returns (address[] memory) {
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        return projects[_projectId].contributors;
    }
    
    /**
     * @dev Projenin tüm tier'larını döndürür
     */
    function getProjectTiers(uint256 _projectId) external view returns (Tier[] memory) {
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        return projectTiers[_projectId];
    }
    
    /**
     * @dev Kullanıcının katıldığı tüm projeleri döndürür
     */
    function getUserProjects(address _user) external view returns (uint256[] memory) {
        return userProjects[_user];
    }
    
    /**
     * @dev Validatorün tüm projelerini döndürür
     */
    function getValidatorProjects(address _validator) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].validatorAddress == _validator) {
                count++;
            }
        }
        
        uint256[] memory validatorProjects = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].validatorAddress == _validator) {
                validatorProjects[index++] = i;
            }
        }
        
        return validatorProjects;
    }
    
    /**
     * @dev Projenin detaylarını döndürür
     */
    function getProjectDetails(uint256 _projectId) external view returns (
        uint256 id,
        address validatorAddress,
        string memory name,
        string memory description,
        string memory tokenSymbol,
        uint256 targetAmount,
        uint256 minContribution,
        uint256 totalRaised,
        uint256 startTime,
        uint256 endTime,
        bool active,
        bool fundingSuccessful,
        uint256 contributorCount
    ) {
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        Project storage project = projects[_projectId];
        
        return (
            project.id,
            project.validatorAddress,
            project.name,
            project.description,
            project.tokenSymbol,
            project.targetAmount,
            project.minContribution,
            project.totalRaised,
            project.startTime,
            project.endTime,
            project.active,
            project.fundingSuccessful,
            project.contributors.length
        );
    }
    
    /**
     * @dev Kullanıcı hangi tier'a erişebilir kontrol eder
     */
    function getUserEligibleTier(uint256 _projectId, address _user) external view returns (uint256) {
        if (_projectId >= projectCount) revert ProjectDoesNotExist();
        Project storage project = projects[_projectId];
        
        // Kullanıcının stake miktarını kontrol et
        IStakeHub stakeHub = IStakeHub(stakeHubAddress);
        (uint256 stakeAmount,,,, ) = stakeHub.getUserStake(_user, project.validatorAddress);
        
        // En yüksek uygun tier'ı bul
        Tier[] memory tiers = projectTiers[_projectId];
        uint256 highestEligibleTier = type(uint256).max;
        
        for (uint256 i = 0; i < tiers.length; i++) {
            if (stakeAmount >= tiers[i].minStakeRequired) {
                highestEligibleTier = i;
            }
        }
        
        return highestEligibleTier == type(uint256).max ? 0 : highestEligibleTier;
    }
}