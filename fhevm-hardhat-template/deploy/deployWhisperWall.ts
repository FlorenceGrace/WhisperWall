import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedWhisperWall = await deploy("WhisperWall", {
    from: deployer,
    log: true,
  });

  console.log(`WhisperWall contract: `, deployedWhisperWall.address);
};

export default func;
func.id = "deploy_whisperWall";
func.tags = ["WhisperWall"];


