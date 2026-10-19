const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArcSplitter Contract Tests", function () {
  let splitter;
  let mockUSDC;
  let owner, alice, bob, charlie;

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    const ArcSplitter = await ethers.getContractFactory("ArcSplitter");
    splitter = await ArcSplitter.deploy();
    await splitter.waitForDeployment();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
  });

  describe("Native USDC Splitting", function () {
    it("should split native value 50/50 correctly", async function () {
      const splitAmount = ethers.parseEther("1.0");
      const bpsA = 5000; // 50%

      const balABefore = await ethers.provider.getBalance(alice.address);
      const balBBefore = await ethers.provider.getBalance(bob.address);

      const tx = await splitter.connect(owner).splitNative(alice.address, bob.address, bpsA, {
        value: splitAmount,
      });

      await expect(tx)
        .to.emit(splitter, "SplitExecuted")
        .withArgs(
          owner.address,
          alice.address,
          bob.address,
          ethers.parseEther("0.5"),
          ethers.parseEther("0.5"),
          ethers.ZeroAddress,
          true
        );

      const balAAfter = await ethers.provider.getBalance(alice.address);
      const balBAfter = await ethers.provider.getBalance(bob.address);

      expect(balAAfter - balABefore).to.equal(ethers.parseEther("0.5"));
      expect(balBAfter - balBBefore).to.equal(ethers.parseEther("0.5"));
    });

    it("should split native value with custom ratio (70/30)", async function () {
      const splitAmount = ethers.parseEther("1.0");
      const bpsA = 7000; // 70%

      const balABefore = await ethers.provider.getBalance(alice.address);
      const balBBefore = await ethers.provider.getBalance(bob.address);

      await splitter.connect(owner).splitNative(alice.address, bob.address, bpsA, {
        value: splitAmount,
      });

      const balAAfter = await ethers.provider.getBalance(alice.address);
      const balBAfter = await ethers.provider.getBalance(bob.address);

      expect(balAAfter - balABefore).to.equal(ethers.parseEther("0.7"));
      expect(balBAfter - balBBefore).to.equal(ethers.parseEther("0.3"));
    });

    it("should revert if msg.value is 0", async function () {
      await expect(
        splitter.connect(owner).splitNative(alice.address, bob.address, 5000, { value: 0 })
      ).to.be.revertedWithCustomError(splitter, "ZeroAmount");
    });

    it("should revert if bps > 10000", async function () {
      await expect(
        splitter.connect(owner).splitNative(alice.address, bob.address, 10001, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWithCustomError(splitter, "InvalidBps");
    });

    it("should revert if recipient is zero address", async function () {
      await expect(
        splitter.connect(owner).splitNative(ethers.ZeroAddress, bob.address, 5000, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWithCustomError(splitter, "InvalidRecipient");

      await expect(
        splitter.connect(owner).splitNative(alice.address, ethers.ZeroAddress, 5000, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.revertedWithCustomError(splitter, "InvalidRecipient");
    });
  });

  describe("ERC-20 USDC Splitting", function () {
    const totalAmount = 1000000n; // 1 USDC (6 decimals)

    beforeEach(async function () {
      // Transfer some mock USDC to alice
      await mockUSDC.transfer(alice.address, 10000000n);
      // Alice approves splitter
      await mockUSDC.connect(alice).approve(await splitter.getAddress(), totalAmount * 5n);
    });

    it("should split ERC20 tokens 60/40 correctly", async function () {
      const bpsA = 6000; // 60%
      const expectedA = 600000n;
      const expectedB = 400000n;

      const tx = await splitter.connect(alice).splitERC20(
        await mockUSDC.getAddress(),
        totalAmount,
        bob.address,
        charlie.address,
        bpsA
      );

      await expect(tx)
        .to.emit(splitter, "SplitExecuted")
        .withArgs(
          alice.address,
          bob.address,
          charlie.address,
          expectedA,
          expectedB,
          await mockUSDC.getAddress(),
          false
        );

      expect(await mockUSDC.balanceOf(bob.address)).to.equal(expectedA);
      expect(await mockUSDC.balanceOf(charlie.address)).to.equal(expectedB);
    });

    it("should revert if totalAmount is 0", async function () {
      await expect(
        splitter.connect(alice).splitERC20(
          await mockUSDC.getAddress(),
          0,
          bob.address,
          charlie.address,
          5000
        )
      ).to.be.revertedWithCustomError(splitter, "ZeroAmount");
    });

    it("should revert if bps > 10000", async function () {
      await expect(
        splitter.connect(alice).splitERC20(
          await mockUSDC.getAddress(),
          totalAmount,
          bob.address,
          charlie.address,
          10005
        )
      ).to.be.revertedWithCustomError(splitter, "InvalidBps");
    });

    it("should revert if allowance is insufficient", async function () {
      // Bob tries without approving
      await mockUSDC.transfer(bob.address, 1000000n);
      await expect(
        splitter.connect(bob).splitERC20(
          await mockUSDC.getAddress(),
          500000n,
          alice.address,
          charlie.address,
          5000
        )
      ).to.be.revertedWith("Allowance exceeded");
    });
  });
});
