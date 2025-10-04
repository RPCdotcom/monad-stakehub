
    const hre = require('hardhat');
    
    async function deploy() {
      const StakeHub = await hre.ethers.getContractFactory("StakeHub");
      const stakeHub = await StakeHub.deploy();
      await stakeHub.deployed();
      
      return {
        address: stakeHub.address,
        txHash: stakeHub.deployTransaction.hash
      };
    }
    
    deploy()
      .then(result => {
        console.log(JSON.stringify(result));
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
    