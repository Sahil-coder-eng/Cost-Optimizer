import { useEffect, useState } from "react";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Analysis {
  id: number;
  cost: number;
  optimized: number;
  saved: number;
}

interface AIResponse {
  original: number;
  optimized: number;
  saved: number;
  message: string;
  suggestion?: string;
}

function App() {
  const [cost, setCost] = useState<number | "">("");
  const [optimizedCost, setOptimizedCost] = useState<number | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [error, setError] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");

  // ✅ Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("costHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // ✅ Save history to localStorage
  useEffect(() => {
    localStorage.setItem("costHistory", JSON.stringify(history));
  }, [history]);

  // ✅ Test backend connection once on load
  useEffect(() => {
    fetch("http://localhost:5000/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cost: 10000 }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to connect");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Backend connectivity test success:", data);
      })
      .catch((err) => {
        console.error("❌ Backend connectivity test failed:", err);
      });
  }, []);

  // ✅ Manual Optimization
  const handleOptimize = () => {
    if (cost === "" || Number(cost) <= 0) {
      setError("⚠️ Please enter a valid cost!");
      return;
    }
    setError("");

    const optimized = Number(cost) * 0.8;
    setOptimizedCost(optimized);

    const newEntry: Analysis = {
      id: Date.now(),
      cost: Number(cost),
      optimized,
      saved: Number(cost) - optimized,
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  // ✅ AI Backend Optimization (fixed fetch)
  const handleAIAnalyze = async () => {
    if (cost === "" || Number(cost) <= 0) {
      setError("⚠️ Please enter a valid cost before analysis!");
      return;
    }

    setError("");
    setAiSuggestion("🤖 Analyzing your cost...");
    console.log("🧠 AI Analyze clicked, cost:", cost);

    try {
      const response = await fetch("http://localhost:5000/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cost: Number(cost) }),
      });

      if (!response.ok) {
        throw new Error("Server responded with an error");
      }

      const data: AIResponse = await response.json();
      console.log("✅ Backend Response:", data);

      setOptimizedCost(data.optimized);
      setAiSuggestion(data.suggestion || data.message);

      const newEntry: Analysis = {
        id: Date.now(),
        cost: Number(cost),
        optimized: data.optimized,
        saved: data.saved,
      };
      setHistory((prev) => [newEntry, ...prev]);
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      setError("⚠️ Unable to connect to backend. Please start your server!");
      setAiSuggestion("");
    }
  };

  // ✅ Clear History
  const handleClearHistory = () => {
    if (window.confirm("Clear all analysis history?")) {
      setHistory([]);
      localStorage.removeItem("costHistory");
    }
  };

  const COLORS = ["#007bff", "#28a745"];
  const pieData =
    optimizedCost !== null
      ? [
          { name: "Current Cost", value: Number(cost) },
          { name: "Optimized Cost", value: optimizedCost },
        ]
      : [];

  const barData =
    optimizedCost !== null
      ? [
          { name: "Current Cost", cost: Number(cost) },
          { name: "Optimized Cost", cost: optimizedCost },
        ]
      : [];

  return (
    <div className="app">
      <h1>💰 Cost Optimization Analyzer</h1>
      <p>Analyze, visualize, and get AI-powered cost insights.</p>

      <div className="input-section">
        <input
          type="number"
          placeholder="Enter your monthly cost"
          value={cost}
          onChange={(e) =>
            setCost(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
        <button onClick={handleOptimize}>Optimize</button>
        <button onClick={handleAIAnalyze} className="ai-btn">
          🧠 AI Analyze
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {aiSuggestion && (
        <p style={{ color: "#007bff", fontWeight: "bold" }}>{aiSuggestion}</p>
      )}

      {optimizedCost !== null && (
        <div className="result">
          <h3>Estimated Optimized Cost: ₹{optimizedCost.toFixed(2)}</h3>
          <p>
            🎯 You could save ₹{(Number(cost) - optimizedCost).toFixed(2)} per
            month!
          </p>

          <div className="charts">
            <div className="chart">
              <h4>📊 Cost Comparison</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost" name="Cost">
                    <Cell fill="#0088FE" />
                    <Cell fill="#00C49F" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart">
              <h4>🧩 Cost Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history">
          <h3>📋 Analysis History</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Original (₹)</th>
                <th>Optimized (₹)</th>
                <th>Saved (₹)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id}>
                  <td>{history.length - i}</td>
                  <td>{h.cost.toFixed(2)}</td>
                  <td>{h.optimized.toFixed(2)}</td>
                  <td>{h.saved.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleClearHistory} className="clear-btn">
            🗑️ Clear History
          </button>
        </div>
      )}

      <footer>
        <p>© {new Date().getFullYear()} Cost Optimizer | React + Node.js ⚡</p>
      </footer>

      <button
        className="ai-float-btn"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          handleAIAnalyze();
        }}
        title="Ask AI Assistant"
      >
        🤖
      </button>
    </div>
  );
}

export default App;
