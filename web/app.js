// Arc Mainnet Constants
const ARC_CHAIN_ID = 5042;
const ARC_CHAIN_HEX = "0x13B2";
const ARC_RPC_URL = "https://rpc.mainnet.arc.io";
const ARC_EXPLORER_URL = "https://explorer.arc.io";
const ARC_USDC_ERC20 = "0x3600000000000000000000000000000000000000";

// Minimal ABIs
const ARC_SPLITTER_ABI = [
  "function splitNative(address recipientA, address recipientB, uint256 bpsA) external payable",
  "function splitERC20(address token, uint256 totalAmount, address recipientA, address recipientB, uint256 bpsA) external",
  "event SplitExecuted(address indexed sender, address indexed recipientA, address indexed recipientB, uint256 amountA, uint256 amountB, address token, bool isNative)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 value) external returns (bool)"
];

// App State
let currentMode = "native"; // "native" or "erc20"
let userAddress = null;
let currentChainId = null;

// DOM Elements
const connectWalletBtn = document.getElementById("connectWalletBtn");
const switchNetworkBtn = document.getElementById("switchNetworkBtn");
const networkBanner = document.getElementById("networkBanner");
const networkDot = document.getElementById("networkDot");
const networkText = document.getElementById("networkText");
const contractAddressInput = document.getElementById("contractAddress");
const tabNative = document.getElementById("tabNative");
const tabERC20 = document.getElementById("tabERC20");
const modeInfo = document.getElementById("modeInfo");
const splitAmountInput = document.getElementById("splitAmount");
const recipientAInput = document.getElementById("recipientA");
const recipientBInput = document.getElementById("recipientB");
const ratioSlider = document.getElementById("ratioSlider");
const ratioDisplay = document.getElementById("ratioDisplay");
const previewA = document.getElementById("previewA");
const previewB = document.getElementById("previewB");
const approveBtn = document.getElementById("approveBtn");
const executeBtn = document.getElementById("executeBtn");
const statusCard = document.getElementById("statusCard");
const statusIcon = document.getElementById("statusIcon");
const statusTitle = document.getElementById("statusTitle");
const statusBody = document.getElementById("statusBody");
const txLinkContainer = document.getElementById("txLinkContainer");
const txLink = document.getElementById("txLink");

// Mode Switcher
window.switchMode = function(mode) {
  currentMode = mode;
  if (mode === "native") {
    tabNative.classList.add("active");
    tabERC20.classList.remove("active");
    modeInfo.innerHTML = "<strong>⚡ Native USDC Mode:</strong> Direct transfer using Arc's native gas token. No approval transaction needed. Zero friction.";
    approveBtn.style.display = "none";
  } else {
    tabERC20.classList.add("active");
    tabNative.classList.remove("active");
    modeInfo.innerHTML = "<strong>🪙 ERC-20 Mode:</strong> Transfer via Arc USDC Token Contract (<code>0x3600...0000</code>). Requires token Approval first.";
    approveBtn.style.display = "block";
  }
  updatePreview();
};

// Update Split Ratio & Preview
function updatePreview() {
  const bps = parseInt(ratioSlider.value, 10);
  const percentA = (bps / 100).toFixed(0);
  const percentB = (100 - percentA).toFixed(0);
  ratioDisplay.innerText = `${percentA}% / ${percentB}% (${bps} bps)`;

  const total = parseFloat(splitAmountInput.value) || 0;
  const amountA = (total * bps) / 10000;
  const amountB = total - amountA;

  previewA.innerText = `${amountA.toFixed(4)} USDC`;
  previewB.innerText = `${amountB.toFixed(4)} USDC`;
}

ratioSlider.addEventListener("input", updatePreview);
splitAmountInput.addEventListener("input", updatePreview);

// Switch / Add Arc Network
async function switchOrAddArcNetwork() {
  if (!window.ethereum) {
    alert("Please install MetaMask or a compatible Web3 wallet.");
    return;
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN_HEX }],
    });
  } catch (switchError) {
    // 4902 means the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: ARC_CHAIN_HEX,
            chainName: "Arc Mainnet",
            nativeCurrency: {
              name: "USD Coin",
              symbol: "USDC",
              decimals: 6
            },
            rpcUrls: [ARC_RPC_URL],
            blockExplorerUrls: [ARC_EXPLORER_URL]
          }],
        });
      } catch (addError) {
        console.error("Failed to add Arc Mainnet:", addError);
        alert("Failed to add Arc Mainnet to wallet: " + addError.message);
      }
    } else {
      console.error("Failed to switch network:", switchError);
    }
  }
  checkNetwork();
}

// Check Current Connected Network
async function checkNetwork() {
  if (!window.ethereum) return;
  try {
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    currentChainId = parseInt(chainIdHex, 16);
    if (currentChainId === ARC_CHAIN_ID) {
      networkDot.className = "status-dot connected";
      networkText.innerText = `Connected to Arc Mainnet (Chain ID ${ARC_CHAIN_ID})`;
      switchNetworkBtn.style.display = "none";
    } else {
      networkDot.className = "status-dot disconnected";
      networkText.innerText = `Wrong Network: Chain ID ${currentChainId} (Expected Arc Mainnet 5042)`;
      switchNetworkBtn.style.display = "inline-block";
    }
  } catch (err) {
    console.error("Error checking network:", err);
  }
}

// Connect Wallet
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask or compatible Web3 wallet not detected. Please install a Web3 browser extension.");
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (accounts.length > 0) {
      userAddress = accounts[0];
      connectWalletBtn.innerText = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
      checkNetwork();
    }
  } catch (err) {
    console.error("User rejected connection:", err);
  }
}

// Display Status Messages
function showStatus(title, body, icon = "⏳", txHash = null) {
  statusCard.style.display = "block";
  statusTitle.innerText = title;
  statusBody.innerHTML = body;
  statusIcon.innerText = icon;

  if (txHash) {
    txLinkContainer.style.display = "block";
    txLink.href = `${ARC_EXPLORER_URL}/tx/${txHash}`;
    txLink.innerText = `View Tx on Arc Explorer: ${txHash.substring(0, 10)}... ↗`;
  } else {
    txLinkContainer.style.display = "none";
  }
}

// Approve ERC-20 Tokens
async function handleApprove() {
  const contractAddress = contractAddressInput.value.trim();
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    alert("Please enter a valid ArcSplitter contract address.");
    return;
  }
  if (!window.ethereum || !userAddress) {
    await connectWallet();
    if (!userAddress) return;
  }

  try {
    showStatus("Approval Pending", "Please confirm token approval in your wallet...", "🔐");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(ARC_USDC_ERC20, ERC20_ABI, signer);

    const amount = splitAmountInput.value;
    const parsedAmount = ethers.parseUnits(amount, 6);

    const tx = await tokenContract.approve(contractAddress, parsedAmount);
    showStatus("Submitting Approval", `Tx sent: ${tx.hash}. Waiting for confirmation...`, "⏳", tx.hash);
    await tx.wait();
    showStatus("Approval Confirmed", `Successfully approved ${amount} USDC for ArcSplitter.`, "✅", tx.hash);
  } catch (err) {
    console.error("Approval error:", err);
    showStatus("Approval Failed", err.reason || err.message, "❌");
  }
}

// Execute Split
async function handleExecuteSplit() {
  const contractAddress = contractAddressInput.value.trim();
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    alert("Please enter a valid deployed ArcSplitter contract address.");
    return;
  }

  const recipientA = recipientAInput.value.trim();
  const recipientB = recipientBInput.value.trim();
  if (!ethers.isAddress(recipientA) || !ethers.isAddress(recipientB)) {
    alert("Both Recipient A and Recipient B must be valid EVM addresses.");
    return;
  }

  const amountStr = splitAmountInput.value.trim();
  if (!amountStr || parseFloat(amountStr) <= 0) {
    alert("Please enter a valid USDC amount.");
    return;
  }

  if (!window.ethereum || !userAddress) {
    await connectWallet();
    if (!userAddress) return;
  }

  if (currentChainId !== ARC_CHAIN_ID) {
    await switchOrAddArcNetwork();
    if (currentChainId !== ARC_CHAIN_ID) {
      alert("Please switch your wallet to Arc Mainnet (Chain ID 5042) to proceed.");
      return;
    }
  }

  const bps = parseInt(ratioSlider.value, 10);

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const splitter = new ethers.Contract(contractAddress, ARC_SPLITTER_ABI, signer);

    if (currentMode === "native") {
      // Native USDC transfer (native units, 6 decimals on Arc)
      // Note: If Arc native has 6 decimals, parseUnits(..., 6); if 18, parseEther
      // In web app, we parse as standard 6 decimals for USDC
      const parsedAmount = ethers.parseUnits(amountStr, 6);

      showStatus("Awaiting Wallet Confirmation", "Please confirm the transaction in your wallet...", "🔐");
      const tx = await splitter.splitNative(recipientA, recipientB, bps, {
        value: parsedAmount
      });

      showStatus("Transaction Broadcasted", `Tx Hash: ${tx.hash}. Waiting for block confirmation on Arc Mainnet...`, "⏳", tx.hash);
      const receipt = await tx.wait();
      showStatus("Split Payment Confirmed!", `Successfully split ${amountStr} USDC between Recipient A and B. Gas used: ${receipt.gasUsed}.`, "🎉", tx.hash);

    } else {
      // ERC20 USDC transfer
      const parsedAmount = ethers.parseUnits(amountStr, 6);

      showStatus("Awaiting Wallet Confirmation", "Please confirm the splitERC20 transaction in your wallet...", "🔐");
      const tx = await splitter.splitERC20(ARC_USDC_ERC20, parsedAmount, recipientA, recipientB, bps);

      showStatus("Transaction Broadcasted", `Tx Hash: ${tx.hash}. Waiting for block confirmation...`, "⏳", tx.hash);
      const receipt = await tx.wait();
      showStatus("Split Payment Confirmed!", `Successfully split ${amountStr} ERC-20 USDC between Recipient A and B. Gas used: ${receipt.gasUsed}.`, "🎉", tx.hash);
    }
  } catch (err) {
    console.error("Execution error:", err);
    showStatus("Transaction Error", err.reason || err.message, "❌");
  }
}

// Event Listeners
connectWalletBtn.addEventListener("click", connectWallet);
switchNetworkBtn.addEventListener("click", switchOrAddArcNetwork);
approveBtn.addEventListener("click", handleApprove);
executeBtn.addEventListener("click", handleExecuteSplit);

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length > 0) {
      userAddress = accounts[0];
      connectWalletBtn.innerText = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
    } else {
      userAddress = null;
      connectWalletBtn.innerText = "Connect Wallet";
    }
  });

  window.ethereum.on("chainChanged", () => {
    checkNetwork();
  });
}

// Initial checks
checkNetwork();
updatePreview();
