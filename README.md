# Arc Instant Splitter (Arc MicroSplit)

> Built with Arc Studio for the **Arc Microgrants: Built with Arc Studio (Round 2)** Hackathon on DoraHacks.

⚡ **Arc Instant Splitter** is a lightweight, zero-friction payment routing protocol specifically designed for the Arc Network (Chain ID 5042). It allows users, dApps, creators, and automated agents to split incoming USDC payments between two or more parties automatically and transparently on-chain.

---

## 🌟 Key Features

- **Dual-Mode USDC Support**:
  - **Native USDC Mode (Recommended)**: Utilizes Arc's native gas currency (`USDC`) for split payments with **zero token approvals** and minimal gas friction.
  - **ERC-20 USDC Mode**: Fully compatible with the standard Arc USDC token interface at `0x3600000000000000000000000000000000000000`.
- **Accurate Basis-Point Calculation**: Splits are calculated in basis points (1 bps = 0.01%, 5000 bps = 50%) with dust-protection guarantees (`amountA + amountB == totalAmount`).
- **Reentrancy Protected**: Safe execution guards against reentrancy vectors.
- **Arc Studio Native**: Developed, tested, and deployed using Arc Studio tools.

---

## ⚙️ Technical Details & Network Specs

- **Network**: Arc Mainnet
- **Chain ID**: `5042` (Hex: `0x13B2`)
- **RPC Endpoint**: `https://rpc.mainnet.arc.io`
- **Native Gas Token**: `USDC`
- **Block Explorer**: [explorer.arc.io](https://explorer.arc.io)
- **ERC-20 USDC Address**: `0x3600000000000000000000000000000000000000`

---

## 🚀 Quickstart & Local Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Run Test Suite
```bash
npm test
```
All 9 unit tests verify Native and ERC-20 splitting, boundary conditions, edge cases, and custom error reverts.

### 4. Run Local Web App
```bash
npm run dev
```
Open `http://127.0.0.1:8092` in your browser.

---

## 📂 Project Structure

```
├── contracts/
│   ├── ArcSplitter.sol   # Core splitting contract
│   └── MockUSDC.sol      # ERC-20 mock token for local testing
├── scripts/
│   ├── deploy.js         # Hardhat deployment script for Arc Mainnet
│   └── serve_local.js    # Lightweight local dev server
├── test/
│   └── ArcSplitter.test.js # Comprehensive unit test suite
├── web/
│   ├── index.html        # Modern Web3 frontend UI
│   ├── app.js            # Wallet & contract interaction logic
│   ├── style.css         # Arc Studio themed styling
│   ├── ArcSplitterABI.json
│   └── ethers.umd.min.js
├── MAINNET_TX_GUIDE.md   # Step-by-step mainnet transaction guide
└── hardhat.config.js     # Hardhat network configuration
```

---

## 📜 License
MIT License. Built for Arc Microgrants Round 2.
