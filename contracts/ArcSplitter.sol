// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal interface for ERC20 token interactions.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * @title ArcSplitter
 * @notice Micro-payment splitting contract tailored for Arc Network (Chain ID 5042).
 * Supports both Native USDC transfers (via msg.value) and ERC-20 USDC transfers.
 * Built for Arc Microgrants Hackathon.
 */
contract ArcSplitter {
    // Arc Mainnet Native USDC ERC-20 contract alias
    address public constant ARC_USDC = 0x3600000000000000000000000000000000000000;
    uint256 public constant MAX_BPS = 10000;

    // Simple reentrancy guard
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    event SplitExecuted(
        address indexed sender,
        address indexed recipientA,
        address indexed recipientB,
        uint256 amountA,
        uint256 amountB,
        address token,
        bool isNative
    );

    error InvalidBps(uint256 bps);
    error InvalidRecipient(address recipient);
    error ZeroAmount();
    error TransferFailed();
    error ReentrancyGuardReentrantCall();

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrancyGuardReentrantCall();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @notice Split Native USDC (msg.value) between two recipients based on basis points (bps).
     * @param recipientA First recipient address.
     * @param recipientB Second recipient address.
     * @param bpsA Basis points for recipient A (1 bps = 0.01%, 5000 = 50%, 10000 = 100%).
     */
    function splitNative(
        address payable recipientA,
        address payable recipientB,
        uint256 bpsA
    ) external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        if (bpsA > MAX_BPS) revert InvalidBps(bpsA);
        if (recipientA == address(0) || recipientB == address(0)) revert InvalidRecipient(address(0));

        uint256 amountA = (msg.value * bpsA) / MAX_BPS;
        uint256 amountB = msg.value - amountA;

        if (amountA > 0) {
            (bool successA, ) = recipientA.call{value: amountA}("");
            if (!successA) revert TransferFailed();
        }

        if (amountB > 0) {
            (bool successB, ) = recipientB.call{value: amountB}("");
            if (!successB) revert TransferFailed();
        }

        emit SplitExecuted(
            msg.sender,
            recipientA,
            recipientB,
            amountA,
            amountB,
            address(0),
            true
        );
    }

    /**
     * @notice Split ERC-20 token (e.g., Arc USDC 0x3600...0000) between two recipients.
     * @param token Address of ERC20 token.
     * @param totalAmount Total amount to transfer and split.
     * @param recipientA First recipient address.
     * @param recipientB Second recipient address.
     * @param bpsA Basis points for recipient A.
     */
    function splitERC20(
        address token,
        uint256 totalAmount,
        address recipientA,
        address recipientB,
        uint256 bpsA
    ) external nonReentrant {
        if (totalAmount == 0) revert ZeroAmount();
        if (bpsA > MAX_BPS) revert InvalidBps(bpsA);
        if (recipientA == address(0) || recipientB == address(0)) revert InvalidRecipient(address(0));

        // Pull tokens from sender
        bool pulled = IERC20(token).transferFrom(msg.sender, address(this), totalAmount);
        if (!pulled) revert TransferFailed();

        uint256 amountA = (totalAmount * bpsA) / MAX_BPS;
        uint256 amountB = totalAmount - amountA;

        if (amountA > 0) {
            bool successA = IERC20(token).transfer(recipientA, amountA);
            if (!successA) revert TransferFailed();
        }

        if (amountB > 0) {
            bool successB = IERC20(token).transfer(recipientB, amountB);
            if (!successB) revert TransferFailed();
        }

        emit SplitExecuted(
            msg.sender,
            recipientA,
            recipientB,
            amountA,
            amountB,
            token,
            false
        );
    }

    /**
     * @notice Allow contract to accept direct Native USDC transfers if needed.
     */
    receive() external payable {}
}
