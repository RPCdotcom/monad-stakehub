// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StakeHub
 * @dev Monad ağı üzerinde validator ve kullanıcı arasındaki stake işlemlerini yönetir
 */
contract StakeHub {
    // Validator yapısı
    struct Validator {
        address payable addr;      // Validator adresi
        string name;               // Validator adı
        string description;        // Validator açıklaması
        string socialLinks;        // JSON formatında sosyal medya linkleri
        uint256 commissionRate;    // Komisyon oranı (baz puan - 10000 = %100)
        uint256 totalStaked;       // Toplam stake edilen miktar
        uint256 uptime;            // Uptime puanı (0-10000)
        uint256 userCount;         // Toplam stake eden kullanıcı sayısı
        bool isActive;             // Validator aktif mi?
    }

    // Stake bilgisi
    struct Stake {
        uint256 amount;            // Stake edilen miktar
        uint256 since;             // Stake başlama zamanı
        bool autoCompound;         // Otomatik compound seçeneği
        uint256 rewards;           // Biriken ödüller
        uint256 lastClaim;         // Son ödül talep zamanı
    }

    // Kullanıcı rozet yapısı
    struct Badge {
        string name;               // Rozet adı
        string description;        // Rozet açıklaması
        uint256 level;             // Rozet seviyesi
        uint256 earnedAt;          // Kazanıldığı zaman
    }

    // Mesaj yapısı
    struct Message {
        address from;              // Gönderen
        string content;            // Mesaj içeriği
        uint256 timestamp;         // Gönderilme zamanı
    }

    // Referral yapısı
    struct Referral {
        address referrer;          // Davet eden
        address referee;           // Davet edilen
        uint256 amount;            // Stake miktarı
        uint256 timestamp;         // Davet zamanı
        bool rewarded;             // Ödül alındı mı?
    }

    // Validator listesi
    mapping(address => Validator) public validators;
    address[] public validatorList;

    // Kullanıcı stake'leri: kullanıcı adresi => validator adresi => stake bilgisi
    mapping(address => mapping(address => Stake)) public stakes;

    // Kullanıcı rozetleri: kullanıcı adresi => rozet dizisi
    mapping(address => Badge[]) public userBadges;

    // Validator mesajları: validator adresi => mesaj dizisi
    mapping(address => Message[]) public validatorMessages;

    // Referraller
    mapping(address => Referral[]) public referrals;

    // Community pool bilgisi
    struct CommunityPool {
        string name;
        uint256 totalAmount;
        uint256 memberCount;
        address validatorAddr;
        bool active;
    }

    // Community pools
    CommunityPool[] public communityPools;
    mapping(uint256 => mapping(address => uint256)) public poolContributions;

    // Events
    event ValidatorRegistered(address indexed validatorAddr, string name);
    event ValidatorUpdated(address indexed validatorAddr);
    event StakePlaced(address indexed user, address indexed validator, uint256 amount);
    event RewardClaimed(address indexed user, address indexed validator, uint256 amount);
    event BadgeEarned(address indexed user, string badgeName, uint256 level);
    event MessageSent(address indexed from, address indexed to, uint256 timestamp);
    event ReferralCreated(address indexed referrer, address indexed referee);
    event CommunityPoolCreated(uint256 indexed poolId, string name);

    // Modifier: Sadece kayıtlı validatorler
    modifier onlyValidator() {
        require(validators[msg.sender].isActive, "Only active validators can call this");
        _;
    }

    // Modifier: Sadece stake yapan kullanıcı
    modifier onlyStaker(address validatorAddr) {
        require(stakes[msg.sender][validatorAddr].amount > 0, "Only stakers can call this");
        _;
    }

    /**
     * @dev Validator kaydı oluşturur
     */
    function registerValidator(
        string memory _name,
        string memory _description,
        string memory _socialLinks,
        uint256 _commissionRate
    ) external {
        require(_commissionRate <= 3000, "Commission rate cannot exceed 30%");
        require(validators[msg.sender].addr == address(0), "Validator already exists");

        Validator memory newValidator = Validator({
            addr: payable(msg.sender),
            name: _name,
            description: _description,
            socialLinks: _socialLinks,
            commissionRate: _commissionRate,
            totalStaked: 0,
            uptime: 9800, // %98 başlangıç değeri
            userCount: 0,
            isActive: true
        });

        validators[msg.sender] = newValidator;
        validatorList.push(msg.sender);

        emit ValidatorRegistered(msg.sender, _name);
    }

    /**
     * @dev Validator bilgilerini günceller
     */
    function updateValidator(
        string memory _name,
        string memory _description,
        string memory _socialLinks,
        uint256 _commissionRate
    ) external onlyValidator {
        require(_commissionRate <= 3000, "Commission rate cannot exceed 30%");

        Validator storage validator = validators[msg.sender];
        validator.name = _name;
        validator.description = _description;
        validator.socialLinks = _socialLinks;
        validator.commissionRate = _commissionRate;

        emit ValidatorUpdated(msg.sender);
    }

    /**
     * @dev Validatore stake etme
     */
    function stake(address _validatorAddr) external payable {
        require(validators[_validatorAddr].isActive, "Validator is not active");
        require(msg.value > 0, "Stake amount must be greater than zero");

        Stake storage userStake = stakes[msg.sender][_validatorAddr];
        Validator storage validator = validators[_validatorAddr];

        // Eğer ilk kez stake ediliyorsa
        if (userStake.amount == 0) {
            userStake.since = block.timestamp;
            userStake.lastClaim = block.timestamp;
            validator.userCount++;

            // İlk kez stake rozeti
            _awardBadge(msg.sender, "First Stake", "Made first stake", 1);
        }
        else {
            // Önce ödülleri hesapla ve ekle
            uint256 pendingRewards = calculateRewards(msg.sender, _validatorAddr);
            userStake.rewards += pendingRewards;
        }

        // Stake miktarını güncelle
        userStake.amount += msg.value;
        validator.totalStaked += msg.value;

        emit StakePlaced(msg.sender, _validatorAddr, msg.value);

        // Referral kontrolü
        _checkReferrals(msg.sender, _validatorAddr, msg.value);
    }

    /**
     * @dev Ödül hesaplama (basit yıllık %8 getiri)
     */
    function calculateRewards(address _user, address _validatorAddr) public view returns (uint256) {
        Stake memory userStake = stakes[_user][_validatorAddr];
        
        if (userStake.amount == 0 || userStake.lastClaim >= block.timestamp) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - userStake.lastClaim;
        uint256 rewardRate = 8; // %8 yıllık getiri
        
        // (miktar * zaman * oran) / (365 * 24 * 60 * 60 * 100)
        uint256 rewards = (userStake.amount * timeElapsed * rewardRate) / (365 days * 100);
        
        // Validator komisyonu düş
        uint256 commission = (rewards * validators[_validatorAddr].commissionRate) / 10000;
        return rewards - commission;
    }

    /**
     * @dev Ödülleri talep etme
     */
    function claimRewards(address _validatorAddr) external onlyStaker(_validatorAddr) {
        Stake storage userStake = stakes[msg.sender][_validatorAddr];
        
        // Bekleyen ödülleri hesapla
        uint256 pendingRewards = calculateRewards(msg.sender, _validatorAddr);
        uint256 totalRewards = userStake.rewards + pendingRewards;
        
        require(totalRewards > 0, "No rewards to claim");
        
        // Otomatik compound kontrol
        if (userStake.autoCompound) {
            userStake.amount += totalRewards;
            validators[_validatorAddr].totalStaked += totalRewards;
        } else {
            // Ödülleri gönder
            payable(msg.sender).transfer(totalRewards);
        }
        
        userStake.rewards = 0;
        userStake.lastClaim = block.timestamp;
        
        emit RewardClaimed(msg.sender, _validatorAddr, totalRewards);
        
        // Ödül bazlı rozetleri kontrol et
        _checkRewardBadges(msg.sender, totalRewards);
    }

    /**
     * @dev Stake çekme (unstake)
     */
    function unstake(address _validatorAddr, uint256 _amount) external onlyStaker(_validatorAddr) {
        Stake storage userStake = stakes[msg.sender][_validatorAddr];
        require(_amount > 0 && _amount <= userStake.amount, "Invalid unstake amount");
        
        // Önce bekleyen ödülleri ekle
        uint256 pendingRewards = calculateRewards(msg.sender, _validatorAddr);
        uint256 totalRewards = userStake.rewards + pendingRewards;
        
        // Miktar ve ödülleri gönder
        payable(msg.sender).transfer(_amount + totalRewards);
        
        // Stake bilgilerini güncelle
        userStake.amount -= _amount;
        userStake.rewards = 0;
        userStake.lastClaim = block.timestamp;
        
        // Validator bilgilerini güncelle
        validators[_validatorAddr].totalStaked -= _amount;
        
        // Tüm stake çekildiyse
        if (userStake.amount == 0) {
            validators[_validatorAddr].userCount--;
        }
    }

    /**
     * @dev Otomatik compound ayarını değiştir
     */
    function toggleAutoCompound(address _validatorAddr) external onlyStaker(_validatorAddr) {
        stakes[msg.sender][_validatorAddr].autoCompound = !stakes[msg.sender][_validatorAddr].autoCompound;
    }

    /**
     * @dev Validator'a mesaj gönder
     */
    function sendMessageToValidator(address _validatorAddr, string memory _content) external {
        require(validators[_validatorAddr].isActive, "Validator is not active");
        
        Message memory newMessage = Message({
            from: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });
        
        validatorMessages[_validatorAddr].push(newMessage);
        
        emit MessageSent(msg.sender, _validatorAddr, block.timestamp);
    }

    /**
     * @dev Validator'ün uptime değerini güncelleme (sadece özel bir rolü olan adres yapabilir)
     * Not: Bu gerçekte bir oracle veya indexer tarafından yapılacaktır
     */
    function updateValidatorUptime(address _validatorAddr, uint256 _newUptime) external {
        // Gerçekte burada bir erişim kontrolü olacak
        require(_newUptime <= 10000, "Uptime cannot exceed 100%");
        validators[_validatorAddr].uptime = _newUptime;
    }

    /**
     * @dev Referral oluşturma
     */
    function createReferral(address _referee) external {
        require(_referee != msg.sender, "Cannot refer yourself");
        require(_referee != address(0), "Invalid referee address");
        
        Referral memory newReferral = Referral({
            referrer: msg.sender,
            referee: _referee,
            amount: 0,
            timestamp: block.timestamp,
            rewarded: false
        });
        
        referrals[msg.sender].push(newReferral);
        
        emit ReferralCreated(msg.sender, _referee);
    }

    /**
     * @dev Community pool oluşturma
     */
    function createCommunityPool(string memory _name) external {
        CommunityPool memory newPool = CommunityPool({
            name: _name,
            totalAmount: 0,
            memberCount: 0,
            validatorAddr: address(0),
            active: true
        });
        
        communityPools.push(newPool);
        
        emit CommunityPoolCreated(communityPools.length - 1, _name);
    }

    /**
     * @dev Community pool'a katkıda bulunma
     */
    function contributeToPool(uint256 _poolId) external payable {
        require(_poolId < communityPools.length, "Pool does not exist");
        require(communityPools[_poolId].active, "Pool is not active");
        require(msg.value > 0, "Contribution amount must be greater than zero");
        
        CommunityPool storage pool = communityPools[_poolId];
        
        // İlk kez katkıda bulunuyorsa üye sayısını artır
        if (poolContributions[_poolId][msg.sender] == 0) {
            pool.memberCount++;
        }
        
        poolContributions[_poolId][msg.sender] += msg.value;
        pool.totalAmount += msg.value;
    }

    /**
     * @dev Community pool için validator seçme (basit implementasyon)
     * Not: Gerçekte bu bir DAO oylama sistemi ile yapılacaktır
     */
    function selectPoolValidator(uint256 _poolId, address _validatorAddr) external {
        require(_poolId < communityPools.length, "Pool does not exist");
        require(validators[_validatorAddr].isActive, "Validator is not active");
        require(poolContributions[_poolId][msg.sender] > 0, "Only contributors can vote");
        
        communityPools[_poolId].validatorAddr = _validatorAddr;
    }

    // Yardımcı fonksiyonlar
    function _awardBadge(address _user, string memory _name, string memory _description, uint256 _level) internal {
        Badge memory newBadge = Badge({
            name: _name,
            description: _description,
            level: _level,
            earnedAt: block.timestamp
        });
        
        userBadges[_user].push(newBadge);
        
        emit BadgeEarned(_user, _name, _level);
    }

    function _checkRewardBadges(address _user, uint256 _rewardAmount) internal {
        // Örnek: Belirli miktardan fazla ödül alındıysa rozet ver
        if (_rewardAmount >= 1 ether) {
            _awardBadge(_user, "Reward Champion", "Earned significant rewards", 2);
        }
    }

    function _checkReferrals(address _user, address _validatorAddr, uint256 _amount) internal {
        // Referralleri kontrol et
        for (uint i = 0; i < validatorList.length; i++) {
            address validatorAddress = validatorList[i];
            Referral[] storage validatorReferrals = referrals[validatorAddress];
            
            for (uint j = 0; j < validatorReferrals.length; j++) {
                if (validatorReferrals[j].referee == _user && !validatorReferrals[j].rewarded) {
                    // Referral başarılı oldu, ödül ver
                    validatorReferrals[j].amount = _amount;
                    validatorReferrals[j].rewarded = true;
                    
                    // Validator ve referrer için rozetler
                    _awardBadge(validatorAddress, "Successful Referrer", "Referred a user who staked", 1);
                    break;
                }
            }
        }
    }

    // Getter fonksiyonları
    function getValidatorCount() external view returns (uint256) {
        return validatorList.length;
    }
    
    function getUserBadges(address _user) external view returns (Badge[] memory) {
        return userBadges[_user];
    }
    
    function getValidatorMessages(address _validatorAddr) external view returns (Message[] memory) {
        return validatorMessages[_validatorAddr];
    }
    
    function getUserStake(address _user, address _validatorAddr) external view returns (
        uint256 amount,
        uint256 since,
        bool autoCompound,
        uint256 rewards,
        uint256 lastClaim
    ) {
        Stake memory userStake = stakes[_user][_validatorAddr];
        return (
            userStake.amount,
            userStake.since,
            userStake.autoCompound,
            userStake.rewards + calculateRewards(_user, _validatorAddr), // Mevcut + bekleyen ödüller
            userStake.lastClaim
        );
    }
}