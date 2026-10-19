# HUONG DAN CHI TIET GIAO DICH ARC MAINNET (TX-PREP)

Tai lieu chuan bi cho nguoi dung tu thuc hien giao dich Arc Mainnet theo dung quy che DoraHacks Hackathon "Arc Microgrants: Built with Arc Studio (Round 2)".

---

## 1. THONG SO MANG ARC MAINNET

- **Network Name**: Arc Mainnet
- **New RPC URL**: `https://rpc.mainnet.arc.io`
- **Chain ID**: `5042` (Hex: `0x13B2`)
- **Currency Symbol**: `USDC` *(Luu y: Tren Arc, USDC la Native Gas Token, phi gas tra bang USDC)*
- **Block Explorer URL**: `https://explorer.arc.io`
- **Arc USDC ERC-20 Interface**: `0x3600000000000000000000000000000000000000`

---

## 2. CHUAN BI TAI CHINH TOI THIEU

- **So tien toi thieu can co tren Arc Mainnet**: `0.1 - 0.5 USDC`
- **Chi phi du kien**:
  + Phi gas deploy contract: ~0.005 - 0.01 USDC
  + Phi gas thuc hien split payment: ~0.001 - 0.003 USDC
  + So tien USDC chuyen qua contract de test: `0.05 USDC`
- **Dia chi nhan (Recipients)**:
  + **Recipient A**: Vi EVM cua User (`0x48bfe6393ad88f7cead1e9553e3e0a4788802595`) - nhan 50% (0.025 USDC).
  + **Recipient B**: Vi phu cua User hoac vi dot (`0x000000000000000000000000000000000000dEaD`) - nhan 50% (0.025 USDC).

---

## 3. CAC BUOC THUC HIEN TUNG BUOC

### Buoc 1: Them mang Arc Mainnet vao vi (MetaMask / Rabby)
1. Mo vi Web3 (MetaMask, Rabby...).
2. Chon **Add Network** (hoac mo Web App tai `http://127.0.0.1:8092` va bam nut **"Switch to Arc Mainnet"** de vi tu dong them).
3. Neu them thu cong, dien cac thong so o Muc 1.
4. Dam bao vi da co it nhat `0.1 USDC` tren mang Arc Mainnet.

---

### Buoc 2: Deploy Contract qua Arc Studio (Bat buoc theo quy che DoraHacks)
*Quy che DoraHacks yeu cau du an phai duoc tao trong Arc Studio tu dau den cuoi de lay link `https://studio.arc.io/app/...`.*

1. Truy cap `https://studio.arc.io` va dang nhap bang GitHub cua User.
2. Tao New Project: dat ten `arc-instant-splitter`.
3. Trong giao dien Arc Studio, tao file contract `ArcSplitter.sol` va dan ma nguon tu:
   `/home/adminis/hackathon-builds/arc/contracts/ArcSplitter.sol`
4. Bam Compile trong Arc Studio (Solidity version `0.8.20`).
5. Bam Deploy, chon Environment: **Arc Mainnet (Chain ID 5042)**.
6. Xac nhan ky giao dich deploy tren vi.
7. **Luu lai**:
   + **Contract Address** vua deploy (vi du: `0x...`).
   + **Project URL** cua Arc Studio (dang `https://studio.arc.io/app/...`).

---

### Buoc 3: Thuc hien giao dich Split USDC tren Live App
1. Mo giao dien Web App (chay local tai `http://127.0.0.1:8092` hoac deploy len Vercel/GitHub Pages):
   ```bash
   cd /home/adminis/hackathon-builds/arc
   npm run dev
   ```
2. Dan dia chi contract vua deploy o Buoc 2 vao o **"ArcSplitter Contract Address"**.
3. Bam **"Connect Wallet"** (xac nhan ket noi vi tren mang Arc Mainnet).
4. Thiet lap thong so giao dich:
   + **Che do**: Chon **Native USDC Split** (khuyen dung nhat vi khong can approve, khong ton phi phu).
   + **Total Amount**: Nhap `0.05` USDC.
   + **Recipient A**: `0x48bfe6393ad88f7cead1e9553e3e0a4788802595`.
   + **Recipient B**: `0x000000000000000000000000000000000000dEaD` (hoac dia chi vi phu).
   + **Split Ratio**: Keo thanh truot o muc 50% / 50% (5000 bps).
5. Bam nut **"Execute Split Payment"**.
6. Vi Web3 se hien pop-up xac nhan giao dich chuyen 0.05 USDC toi contract `ArcSplitter`. User bam **Confirm**.
7. Cho 1 - 2 giay, giao dien se hien thi:
   + `Split Payment Confirmed!`
   + **Transaction Hash**: Co duong link truc tiep toi `https://explorer.arc.io/tx/{hash}`.

---

### Buoc 4: Luu lai bang chung cho Buoc 3/3 (Submit Hackathon)
Ghi lai 3 thong tin sau vao checklist submit:
1. `Arc Studio URL`: `https://studio.arc.io/app/...`
2. `Contract Address`: `0x...` (Arc Mainnet)
3. `Transaction Hash`: `0x...` (Link tren explorer.arc.io chung minh USDC da di chuyen that tren Arc Mainnet)
