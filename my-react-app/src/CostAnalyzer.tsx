import React, { useState } from "react";

const CostAnalyzer: React.FC = () => {
  const [cost, setCost] = useState<number | "">("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false); // ✅ Added loading state

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
// ✅ Backend URL

  const analyzeCost = async () => {
    setError("");
    setResult(null);
    setLoading(true); // ✅ start loader

    if (!cost || Number(cost) <= 0) {
      setError("⚠️ Please enter a valid cost amount.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cost: Number(cost) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Backend not reachable");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Error connecting to backend:", err);
      setError("⚠️ Unable to connect to backend. Please start your server!");
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-center bg-gray-50 shadow-lg rounded-2xl mt-10">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        💰 AI Cost Optimization Analyzer
      </h1>

      <input
        type="number"
        placeholder="Enter your cloud cost (₹)"
        value={cost}
        onChange={(e) => setCost(Number(e.target.value))}
        className="border p-2 rounded w-full mb-4 text-center"
      />
      <button
        onClick={analyzeCost}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading} // ✅ disable button while loading
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold text-green-600">
            Analysis Result
          </h2>
          <p>Original Cost: ₹{result.original}</p>
          <p>Optimized Cost: ₹{result.optimized}</p>
          <p>Savings: ₹{result.saved}</p>
          <p className="mt-2 text-gray-700">{result.suggestion}</p>
          <p className="font-medium mt-2">{result.message}</p>
        </div>
      )}

      {/* ✅ Loading Indicator */}
      {loading && (
        <p className="text-blue-500 mt-3 animate-pulse">🤖 Analyzing your cost...</p>
      )}
    </div>
  );
};

export default CostAnalyzer;
