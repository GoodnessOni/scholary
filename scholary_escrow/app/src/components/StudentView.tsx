import { useState } from "react";
import type { Escrow } from "./Dashboard";

interface Props {
  escrows: Escrow[];
  walletAddress: string;
}

export default function StudentView({ escrows, walletAddress }: Props) {
  const [gradeStatus, setGradeStatus] = useState<"idle" | "loading" | "submitted">("idle");
  const [message, setMessage] = useState("");

  const myEscrow = escrows.find(e => 
    e.studentWallet.toLowerCase() === walletAddress.toLowerCase()
  );

  const handleSubmitGrades = async () => {
    setGradeStatus("loading");
    setMessage("Submitting grades to oracle...");
    await new Promise(r => setTimeout(r, 2000));
    setGradeStatus("submitted");
    setMessage("✅ Grades submitted! Awaiting oracle verification.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-1">My Scholarship</h2>
        <p className="text-gray-400 text-sm mb-6">Your active escrow and disbursement status</p>

        {myEscrow ? (
          <div className="bg-gray-800 rounded-xl p-5 border border-purple-800 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full">● Escrow Active</span>
              <span className="text-xs text-gray-400">2025/2026 Session</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Total Scholarship</span>
                <span className="text-white font-bold">{myEscrow.totalAmount} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Released So Far</span>
                <span className="text-green-400 font-bold">{myEscrow.disbursed} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Next Milestone</span>
                <span className="text-purple-400 font-bold">{myEscrow.milestoneAmount} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Condition</span>
                <span className="text-white text-sm">GPA ≥ 3.0</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">0% disbursed</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8 border border-dashed border-gray-700 rounded-xl">
            No scholarship found for your wallet. Ask your sponsor to create one!
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-1">Submit Academic Records</h2>
        <p className="text-gray-400 text-sm mb-6">Submit grades for oracle verification to unlock next milestone</p>
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Current Semester Results</h3>
            <div className="space-y-2">
              {[
                { course: "Computer Science 301", grade: "A" },
                { course: "Mathematics 201", grade: "B+" },
                { course: "Physics 101", grade: "A-" },
                { course: "English 101", grade: "B+" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-700 last:border-0">
                  <span className="text-gray-300">{item.course}</span>
                  <span className="text-white font-medium">{item.grade}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-gray-300 font-semibold">Cumulative GPA</span>
                <span className="text-green-400 font-bold text-base">3.58 ✓</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 text-sm text-blue-300">
            💡 GPA of 3.58 meets the minimum requirement of 3.0
          </div>
          <button
            onClick={handleSubmitGrades}
            disabled={gradeStatus === "loading" || gradeStatus === "submitted"}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
          >
            {gradeStatus === "loading" ? "Submitting..." :
             gradeStatus === "submitted" ? "✅ Grades Submitted" :
             "📄 Submit Grades to Oracle"}
          </button>
          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              gradeStatus === "submitted"
                ? "bg-green-900/50 text-green-300 border border-green-700"
                : "bg-blue-900/50 text-blue-300 border border-blue-700"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}