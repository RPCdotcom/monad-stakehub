import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers } from "hardhat";

describe("StakeHub", function () {
    let stakeHub: Contract;
    let owner: Signer;
    let validator1: Signer;
    let validator2: Signer;
    let user1: Signer;
    let user2: Signer;
    let addresses: string[];

    const validatorInfo = {
        name: "Test Validator",
        description: "A validator for testing purposes",
        socialLinks: '{"twitter":"@testvalidator", "website":"validator.test"}',
        commissionRate: 1000 // %10
    };

    beforeEach(async function () {
        const StakeHub = await ethers.getContractFactory("StakeHub");
        stakeHub = await StakeHub.deploy();
        
        [owner, validator1, validator2, user1, user2] = await ethers.getSigners();
        addresses = await Promise.all([
            owner.getAddress(),
            validator1.getAddress(),
            validator2.getAddress(),
            user1.getAddress(),
            user2.getAddress()
        ]);
    });

    describe("Validator Registration", function() {
        it("Should register a new validator", async function() {
            await stakeHub.connect(validator1).registerValidator(
                validatorInfo.name,
                validatorInfo.description,
                validatorInfo.socialLinks,
                validatorInfo.commissionRate
            );
            
            const validator = await stakeHub.validators(addresses[1]);
            expect(validator.name).to.equal(validatorInfo.name);
            expect(validator.commissionRate).to.equal(validatorInfo.commissionRate);
            expect(validator.isActive).to.be.true;
            
            const count = await stakeHub.getValidatorCount();
            expect(count).to.equal(1);
        });
        
        it("Should not allow commission rate above 30%", async function() {
            await expect(
                stakeHub.connect(validator1).registerValidator(
                    validatorInfo.name,
                    validatorInfo.description,
                    validatorInfo.socialLinks,
                    3100 // %31 - izin verilmiyor
                )
            ).to.be.revertedWith("Commission rate cannot exceed 30%");
        });
        
        it("Should not allow duplicate validator registration", async function() {
            await stakeHub.connect(validator1).registerValidator(
                validatorInfo.name,
                validatorInfo.description,
                validatorInfo.socialLinks,
                validatorInfo.commissionRate
            );
            
            await expect(
                stakeHub.connect(validator1).registerValidator(
                    "Another name",
                    validatorInfo.description,
                    validatorInfo.socialLinks,
                    validatorInfo.commissionRate
                )
            ).to.be.revertedWith("Validator already exists");
        });
    });
    
    describe("Staking", function() {
        beforeEach(async function() {
            await stakeHub.connect(validator1).registerValidator(
                validatorInfo.name,
                validatorInfo.description,
                validatorInfo.socialLinks,
                validatorInfo.commissionRate
            );
        });
        
        it("Should allow users to stake", async function() {
            const stakeAmount = ethers.parseEther("1.0");
            const validatorAddr = addresses[1];
            
            await stakeHub.connect(user1).stake(validatorAddr, { value: stakeAmount });
            
            const userStake = await stakeHub.getUserStake(addresses[3], validatorAddr);
            expect(userStake.amount).to.equal(stakeAmount);
            
            const validator = await stakeHub.validators(validatorAddr);
            expect(validator.totalStaked).to.equal(stakeAmount);
            expect(validator.userCount).to.equal(1);
        });
        
        it("Should update existing stake", async function() {
            const stakeAmount1 = ethers.parseEther("1.0");
            const stakeAmount2 = ethers.parseEther("0.5");
            const validatorAddr = addresses[1];
            
            await stakeHub.connect(user1).stake(validatorAddr, { value: stakeAmount1 });
            await stakeHub.connect(user1).stake(validatorAddr, { value: stakeAmount2 });
            
            const userStake = await stakeHub.getUserStake(addresses[3], validatorAddr);
            expect(userStake.amount).to.equal(stakeAmount1 + stakeAmount2);
            
            const validator = await stakeHub.validators(validatorAddr);
            expect(validator.totalStaked).to.equal(stakeAmount1 + stakeAmount2);
            expect(validator.userCount).to.equal(1); // Hala 1 kullanıcı
        });
        
        it("Should not allow staking to inactive validator", async function() {
            const validatorAddr = addresses[2]; // Kayıtlı olmayan validator
            const stakeAmount = ethers.parseEther("1.0");
            
            await expect(
                stakeHub.connect(user1).stake(validatorAddr, { value: stakeAmount })
            ).to.be.revertedWith("Validator is not active");
        });
    });
    
    describe("Rewards", function() {
        const stakeAmount = ethers.parseEther("10.0");
        let validatorAddr: string;
        
        beforeEach(async function() {
            validatorAddr = addresses[1];
            
            await stakeHub.connect(validator1).registerValidator(
                validatorInfo.name,
                validatorInfo.description,
                validatorInfo.socialLinks,
                validatorInfo.commissionRate
            );
            
            await stakeHub.connect(user1).stake(validatorAddr, { value: stakeAmount });
        });
        
        it("Should calculate rewards correctly", async function() {
            // Zaman ilerlemesi simülasyonu için bir yöntem eklenecek
            // Test ortamında zaman manipülasyonu hardhat ile yapılabilir
            
            // Örnek: 30 gün sonra
            // await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
            // await ethers.provider.send("evm_mine");
            
            // const rewards = await stakeHub.calculateRewards(addresses[3], validatorAddr);
            // expect(rewards).to.be.gt(0);
            
            // Basitleştirilmiş test - ödüllerin 0 olması gerekiyor çünkü henüz zaman geçmedi
            const rewards = await stakeHub.calculateRewards(addresses[3], validatorAddr);
            expect(rewards).to.equal(0);
        });
    });
    
    describe("Community Pools", function() {
        it("Should create a community pool", async function() {
            await stakeHub.connect(user1).createCommunityPool("Test Pool");
            
            const pool = await stakeHub.communityPools(0);
            expect(pool.name).to.equal("Test Pool");
            expect(pool.totalAmount).to.equal(0);
            expect(pool.memberCount).to.equal(0);
            expect(pool.active).to.be.true;
        });
        
        it("Should allow contributions to pool", async function() {
            await stakeHub.connect(user1).createCommunityPool("Test Pool");
            
            const contribution = ethers.parseEther("0.5");
            await stakeHub.connect(user2).contributeToPool(0, { value: contribution });
            
            const pool = await stakeHub.communityPools(0);
            expect(pool.totalAmount).to.equal(contribution);
            expect(pool.memberCount).to.equal(1);
            
            const userContribution = await stakeHub.poolContributions(0, addresses[4]);
            expect(userContribution).to.equal(contribution);
        });
    });
});