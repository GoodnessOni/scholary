import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import SponsorView from "./SponsorView";
import StudentView from "./StudentView";

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<"sponsor" | "student">("sponsor");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">S</div>
            <div>
              <h1 className="text-xl font-bold text-white">Scholary</h1>
              <p className="text-xs text-gray-400">Decentralized Scholarship Escrow · Solana</p>
            </div>
          </div>
          <WalletMultiButton style={{ backgroundColor: '#7c3aed' }} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-3xl">🎓</div>
            <h2 className="text-3xl font-bold text-center">Scholarship on the Blockchain</h2>
            <p className="text-gray-400 text-center max-w-md">
              Transparent, milestone-based scholarship disbursement powered by Solana smart contracts. No middlemen. No delays.
            </p>
            <div className="flex gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">₦0</p>
                <p className="text-xs text-gray-400 mt-1">Lost to corruption</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-400">100%</p>
                <p className="text-xs text-gray-400 mt-1">On-chain transparency</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">&lt;1s</p>
                <p className="text-xs text-gray-400 mt-1">Disbursement time</p>
              </div>
            </div>
            <WalletMultiButton style={{ backgroundColor: '#7c3aed' }} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-gray-400 font-mono">
              Connected: {publicKey?.toBase58()}
            </div>
            <div className="flex gap-2 bg-gray-900 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("sponsor")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "sponsor" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                💼 Sponsor View
              </button>
              <button
                onClick={() => setActiveTab("student")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "student" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                🎓 Student View
              </button>
            </div>
            {activeTab === "sponsor" ? <SponsorView /> : <StudentView />}
          </div>
        )}
      </main>
    </div>
  );
}
