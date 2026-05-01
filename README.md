# Scholary 🎓
### Decentralized Scholarship Escrow on Solana

> Built for **OnchainED 1.0** Hackathon — Theme: Reimagining Education on the Blockchain

---

## The Problem
Scholarship disbursements in Nigeria are slow, opaque, and prone to mismanagement. Students wait months for funds that may never arrive. Sponsors have no visibility into how their money is used.

## The Solution
Scholary is a decentralized scholarship escrow platform on Solana. Sponsors lock funds in a smart contract vault (PDA). Funds are only released to the student when an on-chain oracle (simulating a university registrar) verifies the student has met their academic milestone (e.g., maintaining a 3.0 GPA).

**No middlemen. No delays. Full transparency.**

---

## How It Works
1. **Sponsor** connects Phantom wallet and locks SOL into an escrow vault
2. **Smart contract** creates a PDA vault tied to the student and oracle
3. **Student** submits academic records at the end of semester
4. **Oracle** (university registrar) verifies GPA meets milestone requirement
5. **Funds released** automatically to student wallet — or refunded to sponsor if student fails

---

## Tech Stack
- **Blockchain:** Solana (Devnet/Localnet)
- **Smart Contract:** Rust + Anchor Framework
- **Frontend:** React + TypeScript + Tailwind CSS
- **Wallet:** Phantom via @solana/wallet-adapter
- **Backend/Oracle:** Supabase (simulated)

---

## Smart Contract
- **Program ID:** `2QyWqLBNUqhSz6ajW4UHA1YN6Wf35KCMdUmPEYBMvcNc`
- **Network:** Solana Localnet / Devnet

### Instructions
| Instruction | Who Signs | What It Does |
|---|---|---|
| `initialize_escrow` | Sponsor | Locks SOL into PDA vault |
| `release_funds` | Oracle only | Releases milestone amount to student |
| `refund_sponsor` | Oracle only | Returns remaining funds to sponsor |

### Security
- PDA vault — no private key, only program can move funds
- Oracle-gated — neither sponsor nor student can drain vault
- Constraint checks — all accounts validated against stored pubkeys
- Checked arithmetic — no silent integer underflows

---

## Running Locally

### Prerequisites
- Rust + Anchor CLI
- Solana CLI
- Node.js + npm
- Phantom Wallet browser extension

### Smart Contract
```bash
cd scholary_escrow
anchor build
solana-test-validator  # in separate terminal
anchor deploy
```

### Frontend
```bash
cd scholary_escrow/app
npm install
npm run dev
```

---

## Team
Built with ❤️ for OnchainED 1.0 Hackathon
