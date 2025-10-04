// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {StakeHub} from "../contracts/StakeHub.sol";

contract StakeHubTest is Test {
    StakeHub public stakeHub;
    address validator1 = address(0x1);
    address validator2 = address(0x2);
    address user1 = address(0x3);
    address user2 = address(0x4);

    function setUp() public {
        stakeHub = new StakeHub();
        
        // Validator1 ve kullanıcılara test ether gönder
        vm.deal(validator1, 10 ether);
        vm.deal(validator2, 10 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    function test_RegisterValidator() public {
        // Validator1 olarak işlem yap
        vm.startPrank(validator1);
        
        stakeHub.registerValidator(
            "Test Validator",
            "A validator for testing",
            '{"twitter":"@testvalidator"}',
            1000 // %10 komisyon
        );
        
        vm.stopPrank();
        
        // Validator1 bilgilerini kontrol et
        (address addr, string memory name, , , uint256 commissionRate, , , , bool isActive) = stakeHub.validators(validator1);
        
        assertEq(addr, validator1);
        assertEq(name, "Test Validator");
        assertEq(commissionRate, 1000);
        assertTrue(isActive);
        
        assertEq(stakeHub.getValidatorCount(), 1);
    }
    
    function test_StakeToValidator() public {
        // Önce validator1'i kaydet
        vm.startPrank(validator1);
        stakeHub.registerValidator(
            "Test Validator",
            "A validator for testing",
            '{"twitter":"@testvalidator"}',
            1000
        );
        vm.stopPrank();
        
        // User1 olarak stake et
        vm.startPrank(user1);
        stakeHub.stake{value: 1 ether}(validator1);
        vm.stopPrank();
        
        // Stake bilgilerini kontrol et
        (uint256 amount, , , , ) = stakeHub.getUserStake(user1, validator1);
        assertEq(amount, 1 ether);
        
        // Validator bilgilerini kontrol et
        (, , , , , uint256 totalStaked, , uint256 userCount, ) = stakeHub.validators(validator1);
        assertEq(totalStaked, 1 ether);
        assertEq(userCount, 1);
    }
    
    function test_ClaimRewards() public {
        // Önce validator1'i kaydet
        vm.startPrank(validator1);
        stakeHub.registerValidator(
            "Test Validator", 
            "A validator for testing",
            '{"twitter":"@testvalidator"}',
            1000
        );
        vm.stopPrank();
        
        // User1 olarak stake et
        vm.startPrank(user1);
        stakeHub.stake{value: 5 ether}(validator1);
        
        // 365 gün geçir (1 yıl)
        vm.warp(block.timestamp + 365 days);
        
        // Ödülleri talep etmeden önce kullanıcı bakiyesini al
        uint256 balanceBefore = user1.balance;
        
        // Ödülleri talep et
        stakeHub.claimRewards(validator1);
        vm.stopPrank();
        
        // Ödül sonrası bakiyeyi kontrol et (yaklaşık %7.2 net getiri)
        uint256 balanceAfter = user1.balance;
        uint256 expectedReward = (5 ether * 8 / 100) * 90 / 100; // %8 APY * %90 (komisyon düşülmüş)
        
        // Yaklaşık eşitliği kontrol et
        assertTrue(balanceAfter - balanceBefore > 0.35 ether, "Rewards should be approximately 0.36 ether");
        assertTrue(balanceAfter - balanceBefore < 0.37 ether, "Rewards should be approximately 0.36 ether");
    }
    
    function test_CommunityPool() public {
        // User1 olarak community pool oluştur
        vm.startPrank(user1);
        stakeHub.createCommunityPool("Test Pool");
        vm.stopPrank();
        
        // User2 olarak poola katkıda bulun
        vm.startPrank(user2);
        stakeHub.contributeToPool{value: 2 ether}(0);
        vm.stopPrank();
        
        // Pool bilgilerini kontrol et
        (string memory name, uint256 totalAmount, uint256 memberCount, , bool active) = stakeHub.communityPools(0);
        
        assertEq(name, "Test Pool");
        assertEq(totalAmount, 2 ether);
        assertEq(memberCount, 1);
        assertTrue(active);
        
        // User2'nin katkısını kontrol et
        uint256 contribution = stakeHub.poolContributions(0, user2);
        assertEq(contribution, 2 ether);
    }
    
    function test_ValidatorSelection() public {
        // Validator1'i kaydet
        vm.startPrank(validator1);
        stakeHub.registerValidator(
            "Test Validator",
            "A validator for testing",
            '{"twitter":"@testvalidator"}',
            1000
        );
        vm.stopPrank();
        
        // User1 olarak community pool oluştur
        vm.startPrank(user1);
        stakeHub.createCommunityPool("Test Pool");
        
        // User1 poola katkıda bulunsun
        stakeHub.contributeToPool{value: 1 ether}(0);
        
        // Validator seçimi yap
        stakeHub.selectPoolValidator(0, validator1);
        vm.stopPrank();
        
        // Pool validator seçimini kontrol et
        (, , , address validatorAddr, ) = stakeHub.communityPools(0);
        assertEq(validatorAddr, validator1);
    }
}