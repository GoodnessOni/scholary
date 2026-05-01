import { useState } from "react";
import type { Escrow } from "./Dashboard";

interface Props {
  escrows: Escrow[];
  setEscrows: React.Dispatch<React.SetStateAction<Escrow[]>>;
}

export default function SponsorView({ escrows, setEscrows }: Props) {
  const [form, setForm] = useState({
    studentWallet: "",
    oracleWallet: "",
    totalAmount: "",
    milestoneAmount: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!form.studentWallet || !form.totalAmount || !form.milestoneAmount) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }
    setStatus("loading");
    setMessage("Initializing escrow on Solana...");
    await new Promise(r => setTimeout(r, 2000));
    setStatus("success");
    setMessage(`✅ Escrow initialized! ${form.totalAmount} SOL locked for student.`);
    
    // Add to active escrows
    setEscrows(prev => [...prev, {
      studentWallet: form.studentWallet,
      oracleWallet: form.oracleWallet,
      totalAmount: form.totalAmount,
      milestoneAmount: form.milestoneAmount,
      disbursed: 0,
    }]);

    // Reset form
    setForm({ studentWallet: "", oracleWallet: "", totalAmount: "", milestoneAmount: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-1">Create Scholarship Escrow</h2>
        <p className="text-gray-400 text-sm mb-6">Lock funds in a smart contract vault for a student</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Student Wallet Address</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="Student's Solana public key..."
              value={form.studentWallet}
              onChange={e => setForm({ ...form, studentWallet: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Oracle Wallet Address</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="University registrar's public key..."
              value={form.oracleWallet}
              onChange={e => setForm({ ...form, oracleWallet: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Total Amount (SOL)</label>
              <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g. 2.5"
                value={form.totalAmount}
                onChange={e => setForm({ ...form, totalAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Per Milestone (SOL)</label>
              <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="e.g. 0.5"
                value={form.milestoneAmount}
                onChange={e => setForm({ ...form, milestoneAmount: e.target.value })}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
          >
            {status === "loading" ? "Processing..." : "🔒 Lock Funds in Escrow"}
          </button>
          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              status === "success" ? "bg-green-900/50 text-green-300 border border-green-700" :
              status === "error" ? "bg-red-900/50 text-red-300 border border-red-700" :
              "bg-blue-900/50 text-blue-300 border border-blue-700"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-1">Active Scholarships</h2>
        <p className="text-gray-400 text-sm mb-6">Funds currently locked in escrow vaults</p>
        <div className="space-y-4">
          {escrows.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8 border border-dashed border-gray-700 rounded-xl">
              No active escrows yet. Create one to get started!
            </div>
          ) : (
            escrows.map((escrow, i) => {
              const total = parseFloat(escrow.totalAmount);
              const milestone = parseFloat(escrow.milestoneAmount);
              const milestones = Math.round(total / milestone);
              const pct = Math.round((escrow.disbursed / total) * 100);
              return (
                <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">● Active</span>
                    <span className="text-xs text-gray-400">Milestone 1 of {milestones}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    Student: <span className="text-white font-mono">
                      {escrow.studentWallet.slice(0, 6)}...{escrow.studentWallet.slice(-4)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-300 mb-3">
                    Locked: <span className="text-purple-400 font-bold">{escrow.totalAmount} SOL</span>
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{pct}% disbursed</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}