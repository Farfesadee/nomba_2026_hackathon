"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";

type WalletData = {
  id: number;
  balance: number;
  currency: string;
  transactions: {
    id: number;
    amount: number;
    type: string;
    reference: string;
    description: string | null;
    status: string;
    created_at: string;
  }[];
};

function WalletContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const data = await apiClient<WalletData>("/wallet");
      setWallet(data);
    } catch {}
  }, []);

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [loading, user, router]);

  useEffect(() => {
    if (user) loadWallet();
  }, [user, loadWallet]);

  useEffect(() => {
    const ref = searchParams.get("reference");
    if (ref) loadWallet();
  }, [searchParams, loadWallet]);

  const handleFund = async () => {
    const amount = Number(fundAmount);
    if (!amount || amount < 100) { alert("Minimum top-up is ₦100"); return; }
    setFunding(true);
    try {
      const res = await apiClient<{ authorization_url: string | null }>("/wallet/fund", { method: "POST", body: { amount } });
      if (res.authorization_url) window.location.href = res.authorization_url;
      else alert("Payment gateway unavailable");
    } catch (err: any) { alert(err.message); }
    setFunding(false);
  };

  if (loading || !user) return null;

  const balance = wallet?.balance ?? 0;
  const txns = wallet?.transactions ?? [];

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-[#e8edf2]">
          <h1 className="text-lg font-bold text-[#0D1B2A]">Wallet</h1>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-pink-600 hover:underline">&larr; Dashboard</button>
        </header>
        <main className="flex-1 p-6 overflow-auto max-w-xl mx-auto w-full">
          <div className="rounded-2xl p-6 text-white mb-6" style={{ background: "linear-gradient(135deg, #0D1B2A, #1a2e45)" }}>
            <p className="text-sm font-medium opacity-80 mb-1">Wallet Balance</p>
            <p className="text-4xl font-extrabold">₦{balance.toLocaleString()}</p>
            <p className="text-xs opacity-60 mt-1">{wallet?.currency ?? "NGN"}</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#e8edf2] p-5 mb-6">
            <h2 className="font-bold text-sm mb-3">Top Up Wallet</h2>
            <div className="flex gap-2">
              <input type="number" placeholder="Amount (₦)" min={100} value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} className="flex-1 rounded-xl border border-[#e8edf2] px-4 py-3 text-sm" />
              <button onClick={handleFund} disabled={funding} className="rounded-xl bg-pink-600 text-white px-6 py-3 font-bold text-sm hover:bg-pink-700 disabled:opacity-50">
                {funding ? "..." : "Fund"}
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {[1000, 5000, 10000, 25000].map((n) => (
                <button key={n} onClick={() => setFundAmount(String(n))} className="rounded-lg border border-[#e8edf2] px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-pink-300 hover:text-pink-600 transition">₦{n.toLocaleString()}</button>
              ))}
            </div>
          </div>

          <h2 className="font-bold text-sm mb-3">Transaction History</h2>
          {txns.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#e8edf2] p-8 text-center">
              <p className="text-sm text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {txns.map((tx) => (
                <div key={tx.id} className="rounded-xl bg-white border border-[#e8edf2] p-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()} · {tx.reference}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ml-3 ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center text-sm text-gray-400">Loading wallet...</div>}>
      <WalletContent />
    </Suspense>
  );
}
