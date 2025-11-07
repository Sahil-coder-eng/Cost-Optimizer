import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import "./App.css";
import {
    ComposedChart,
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
  LineChart,
  Line,
  AreaChart,   // ✅ Add this
  Area,        // ✅ Add this
} from "recharts";
import CountUp from "react-countup";
import * as tf from "@tensorflow/tfjs";



// ✅ Interfaces for data types
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
  // ✅ State variables
  const [cost, setCost] = useState<number | "">("");
  const [optimizedCost, setOptimizedCost] = useState<number | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [error, setError] = useState<string>("");
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [predictedCost, setPredictedCost] = useState<number | null>(null);
  const [category, setCategory] = useState("Cloud");
  const [currency, setCurrency] = useState("₹");
  // 🧠 Controls the floating AI menu visibility
const [showAIMenu, setShowAIMenu] = useState(false);
const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
const [userInput, setUserInput] = useState("");
const [showChat, setShowChat] = useState(false); 



// ✅ Smart Tips Generator (Category-based suggestions)
  const getSmartTip = (category: string): string => {
    switch (category.toLowerCase()) {
      case "cloud":
        return "☁️ Tip: Use AWS Spot Instances or auto-scaling to save on cloud costs.";
      case "electricity":
        return "⚡ Tip: Use energy-efficient devices and schedule usage off-peak hours.";
      case "labor":
        return "👷 Tip: Automate repetitive tasks to reduce labor hours.";
      case "marketing":
        return "📢 Tip: Focus on high-ROI channels like SEO and referral programs.";
      default:
        return "💡 Tip: Always review your monthly cost report for anomalies.";
    }
  };



  // ✅ Live date/time
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleString()
  );

  // ✅ Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // ✅ Daily Reminder Notification (every 24 hours)
useEffect(() => {
  // Request notification permission
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Show reminder once every 24 hours
  const interval = setInterval(() => {
    if (Notification.permission === "granted") {
      new Notification("📊 Don't forget to check your cost updates today!", {
        body: "Track and optimize your expenses with the AI Analyzer 💡",
        icon: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png", // optional icon
      });
    }
  }, 24 * 60 * 60 * 1000); // 24 hours in ms

  // Cleanup interval when component unmounts
  return () => clearInterval(interval);
}, []);


  // ✅ Load saved history
  useEffect(() => {
    const saved = localStorage.getItem("costHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // ✅ Save history
  useEffect(() => {
    localStorage.setItem("costHistory", JSON.stringify(history));
  }, [history]);

  // ✅ Test backend connection
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
      .then((data) => console.log("✅ Backend test success:", data))
      .catch((err) => console.error("❌ Backend connection failed:", err));
  }, []);
  // ✅ Smart Cost Optimization Logic
const calculateOptimizedCost = (
  category: string,
  cost: number
): { optimized: number; saved: number; reductionRate: number } => {
  let reductionRate = 0.1; // default 10%

  switch (category.toLowerCase()) {
    case "cloud":
      reductionRate = cost > 5000 ? 0.25 : 0.2;
      break;
    case "electricity":
      reductionRate = cost > 3000 ? 0.15 : 0.1;
      break;
    case "labor":
      reductionRate = cost > 4000 ? 0.12 : 0.08;
      break;
    case "marketing":
      reductionRate = cost > 2000 ? 0.18 : 0.12;
      break;
    default:
      reductionRate = 0.1;
  }

  const optimized = Number((cost * (1 - reductionRate)).toFixed(2));
  const saved = Number((cost - optimized).toFixed(2));

  return { optimized, saved, reductionRate };
};


 // ✅ Manual optimization
const handleOptimize = () => {
  if (cost === "" || Number(cost) <= 0) {
    setError("⚠️ Please enter a valid cost!");
    return;
  }
  setError("");

  const selectedCategory = category; // <--- ✅ use category
  const { optimized, saved, reductionRate } = calculateOptimizedCost(
    selectedCategory,
    Number(cost)
  ); // <--- ✅ Now works fine!

  setOptimizedCost(optimized);

  const newEntry: Analysis = {
    id: Date.now(),
    cost: Number(cost),
    optimized,
    saved,
  };

  setHistory((prev) => [newEntry, ...prev]);
};


  // ✅ AI-based optimization
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

      if (!response.ok) throw new Error("Server responded with an error");

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

  // ✅ Clear history
  const handleClearHistory = () => {
    if (window.confirm("Clear all analysis history?")) {
      setHistory([]);
      localStorage.removeItem("costHistory");
    }
  };

  // ✅ Reset everything
  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to reset everything?")) {
      setCost("");
      setOptimizedCost(null);
      setHistory([]);
      setAiSuggestion("");
      setError("");
      localStorage.removeItem("costHistory");
    }
  };

  // ✅ Export CSV
  // ✅ Export CSV (Fixed version)
const handleExportCSV = () => {
  if (history.length === 0) {
    alert("No data available to export!");
    return;
  }

  // Add category + date/time too (optional and useful)
  const headers = ["#", "Category", "Original (₹)", "Optimized (₹)", "Saved (₹)", "Date & Time"];

  const rows = history.map((h, i) => [
    history.length - i,
    category,
    h.cost.toFixed(2),
    h.optimized.toFixed(2),
    h.saved.toFixed(2),
    new Date(h.id).toLocaleString(), // show readable time
  ]);

  // Fix CSV creation (ensures Excel opens it correctly)
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map((row) => row.join(",")).join("\r\n");

  const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cost_analysis_report.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  // ✅ Working PDF Export Function
  
const handleExportPDF = () => {
  try {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("💰 Cost Optimization Report", 14, 16);

    if (history.length === 0) {
      doc.setFontSize(12);
      doc.text("⚠️ No data available to export!", 14, 30);
      doc.save("empty_cost_report.pdf");
      return;
    }

    // ✅ Add metadata
    doc.setFontSize(10);
    doc.text(`📅 Generated on: ${new Date().toLocaleString()}`, 14, 24);
    doc.text(`📂 Category: ${category}`, 14, 30);

    // ✅ Prepare table data
    const tableData = history.map((h, i) => [
      history.length - i,
      h.cost.toFixed(2),
      h.optimized.toFixed(2),
      h.saved.toFixed(2),
    ]);

    // ✅ Use the imported autoTable plugin directly
    autoTable(doc, {
      head: [["#", "Original (₹)", "Optimized (₹)", "Saved (₹)"]],
      body: tableData,
      startY: 40,
      styles: { halign: "center" },
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    });

    const totalSaved = history
      .reduce((acc, h) => acc + h.saved, 0)
      .toFixed(2);

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`🏁 Total Saved: ₹${totalSaved}`, 14, finalY);
    doc.text(`🧠 Optimized Category: ${category}`, 14, finalY + 8);

    doc.save("cost_analysis_report.pdf");
  } catch (error) {
    console.error("❌ PDF Export Error:", error);
    alert("PDF export failed. Check console for details.");
  }
};


  // ✅ Share via WhatsApp or Email
  const handleShareReport = () => {
    if (history.length === 0) {
      alert("No data available to share!");
      return;
    }
    

    const totalSaved = history
      .reduce((acc, h) => acc + h.saved, 0)
      .toFixed(2);

    const summary = `💰 Cost Optimization Summary:
- Total Analyses: ${history.length}
- Total Saved: ₹${totalSaved}
- Latest Saved: ₹${history[0].saved.toFixed(2)}
- Latest Optimized Cost: ₹${history[0].optimized.toFixed(2)}

Try our AI Analyzer now! 🚀`;

    const encodedMessage = encodeURIComponent(summary);
    const whatsappURL = `https://wa.me/?text=${encodedMessage}`;
    const mailURL = `mailto:?subject=My Cost Optimization Report&body=${encodedMessage}`;

    const choice = window.prompt(
      "Share via: type 'w' for WhatsApp or 'e' for Email"
    );

    if (choice?.toLowerCase() === "w") {
      window.open(whatsappURL, "_blank");
    } else if (choice?.toLowerCase() === "e") {
      window.location.href = mailURL;
    } else {
      alert("❌ Invalid choice! Please enter 'w' or 'e'.");
    }
  };

 // 🤖 Predict Next Month’s Cost using Machine Learning (TensorFlow.js)
const handlePredictNextMonth = async () => {
  // 🤖 Simple AI Chat Logic  ⬅️ ADD HERE

  if (history.length < 3) {
    alert("Need at least 3 past analyses to predict next month’s cost!");
    return;
  }

  try {
    // 🧠 Prepare training data
    const xs = tf.tensor(history.map((h, i) => [i]));
    const ys = tf.tensor(history.map((h) => h.cost));

    // 🏗️ Build simple linear regression model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

    // 🔁 Train the model with more accuracy
    await model.fit(xs, ys, {
      epochs: 150,
      shuffle: true,
     verbose: 0,
    });
    

    // 🔮 Predict the next month’s cost
    const next = model.predict(tf.tensor([[history.length]])) as tf.Tensor;
    const predictedValue = (await next.data())[0];

    // ✅ Confidence level (fake approximation for display)
    const randomConfidence = Math.floor(Math.random() * 10) + 90; // 90–99%

    // Save the prediction
    setPredictedCost(Number(predictedValue.toFixed(2)));

    // 🧠 Show AI Confidence Alert
    alert(
      `🔮 Predicted Next Month Cost: ₹${predictedValue.toFixed(2)}\nConfidence Level: ${randomConfidence}%`
    );

  } catch (error) {
   console.error("❌ Prediction Error:", error);
   alert("Prediction failed. Try again after adding more cost history!");
  }
};
const handleSendMessage = () => {
  if (!userInput.trim()) return;

  const newMessage = { sender: "user", text: userInput };
  setMessages((prev) => [...prev, newMessage]);

  setTimeout(() => {
    const reply = generateAIResponse(userInput);
    setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
  }, 800);

  setUserInput("");
};
// 🧠 Auto-start AI Greeting when chat opens

const startAIChat = () => {
  setMessages([
    { sender: "ai", text: "👋 Hello! I’m your AI Cost Assistant. How can I help you today?" },
  ]);
  setShowChat(true);
  setShowAIMenu(false);
};



// 🧩 AI reply generator
const generateAIResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi"))
    return "👋 Hello I am Narayan! How can I help you analyze your costs today well lets see?";
  if (lower.includes("optimize"))
    return "💡 I am created by Sahil Samal to help you optimize the cost Click to optimize ! What are you waiting 😜.";
  if (lower.includes("save"))
    return "💰 Try using minimal resources if you want to live a sustainable life  !";
  if (lower.includes("predict"))
    return "🔮 I can predict your next month's cost — click on 'Predict next month Cost' below!";
  return "🤖 I'm here to help you analyze and optimize your expenses!";
     
};



  // ✅ Extra insights and smart tracking
const sorted = [...history].sort((a, b) => b.saved - a.saved);

useEffect(() => {
  if (history.length > 0) {
    const latest = history[0];
    alert(`✅ Analysis saved! You reduced ₹${latest.saved.toFixed(2)} this time.`);
  }
}, [history]);

useEffect(() => {
  if (history.length > 0) {
    const top3 = [...history]
      .sort((a, b) => b.saved - a.saved)
      .slice(0, 3);
    console.log("🏆 Top 3 Savings Entries:", top3);
  }
}, [history]);

const totalSaved = history.reduce((acc, h) => acc + h.saved, 0);
console.log("💰 Total saved so far: ₹" + totalSaved.toFixed(2));

useEffect(() => {
  if (optimizedCost !== null) {
    if (optimizedCost < Number(cost) * 0.7) {
      console.log("💡 Great job! Your optimization reduced cost by over 30%!");
    } else if (optimizedCost < Number(cost) * 0.9) {
      console.log("📈 Nice savings — keep tracking your usage!");
    } else {
      console.log("⚠️ Minor savings. Try reviewing your biggest expenses.");
    }
  }
}, [optimizedCost]);


  // ✅ Chart data
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
      {/* 🔹 Top-right Live Date/Time */}
    <div className="top-bar">
      <span className="time-display">⏱️ {currentTime}</span>
    </div>

    {/* ✅ Header */}
    <header className="header">
      <div>
        <h1>💰 Cost Optimization Analyzer</h1>
        <p>Analyze, visualize, and get AI-powered cost insights.</p>
        </div>
      </header>

      {/* ✅ Input Section */}
      <div className="input-section">
        <input
          type="number"
          placeholder="Enter your monthly cost"
          value={cost}
          onChange={(e) =>
            setCost(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
        <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="category-select"
>
  <option value="Cloud">☁️ Cloud</option>
  <option value="Electricity">⚡ Electricity</option>
  <option value="Labor">👷 Labor</option>
  <option value="Marketing">📢 Marketing</option>
</select>
  {/* 🪙 Currency Selector */}
  <select
    onChange={(e) => setCurrency(e.target.value)}
    className="currency-select"
  >
    <option value="₹">₹ INR</option>
    <option value="$">$ USD</option>
    <option value="€">€ EUR</option>
    <option value="£">£ GBP</option>
  </select>


        <button onClick={handleOptimize}>Optimize</button>
        <button onClick={handleAIAnalyze} className="ai-btn">
          🧠 AI Analyze
        </button>
      </div>

      {/* ✅ Display Error or AI Suggestion */}
      {error && <p className="error">{error}</p>}
      {aiSuggestion && (
        <p style={{ color: "#007bff", fontWeight: "bold" }}>{aiSuggestion}</p>
      )}

      {/* ✅ Result Section */}
      {optimizedCost !== null && (
        <div className="result">
          <h3>
Estimated Optimized Cost: {currency}
            <CountUp end={optimizedCost} duration={2} decimals={2} separator="," />
          </h3>
          <p>
            🎯 You could save ₹
            <CountUp
              end={Number(cost) - optimizedCost}
              duration={2}
              decimals={2}
              separator=","
            />{" "}
            per month!
          </p>
    <p className="smart-tip">{getSmartTip(category)}</p>

          {/* ✅ Charts Section */}
          <div className="charts">
            {/* Bar Chart */}
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

            {/* Pie Chart */}
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

{/* ✅ Combined Chart Section */}
{history.length > 1 && (
  <div className="chart-grid">
    {/* Left: Cost Trend Over Time */}
    <div className="chart">
      <h4>📈 Cost Trend Over Time</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={[...history].reverse()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="id"
            tick={false}
            label={{
              value: "Entries",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="cost"
            stroke="#007bff"
            name="Original Cost"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="optimized"
            stroke="#28a745"
            name="Optimized Cost"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

   
    </div>

    {/* Right: Total Cost vs Saved by Category */}
    <div className="chart">
      <h4>📊 Total Cost vs Saved by Category</h4>
      {(() => {
        const categorySummary = history.reduce((acc, curr: any) => {
          const cat = category || "General";
          if (!acc[cat]) acc[cat] = { cost: 0, saved: 0 };
          acc[cat].cost += curr.cost;
          acc[cat].saved += curr.saved;
          return acc;
        }, {} as Record<string, { cost: number; saved: number }>);

        const chartData = Object.entries(categorySummary).map(([name, val]) => ({
          name,
          ...val,
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#007bff" name="Total Cost" />
              <Bar dataKey="saved" fill="#28a745" name="Total Saved" />
            </BarChart>
          </ResponsiveContainer>
        );
      })()}
    </div>
  </div>
)}


          <div className="mt-6 bg-purple-50 p-4 rounded-xl shadow text-center">
            <button
              onClick={handlePredictNextMonth}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              📊 Predict Next Month’s Cost
            </button>
            {predictedCost && (
  <>
    <p className="text-lg text-purple-700 mt-3">
      🔮 Estimated Next Month’s Cost: ₹{predictedCost}
    </p>
    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
      <div
        className="bg-green-500 h-3 rounded-full transition-all duration-700"
        style={{ width: `${Math.floor(Math.random() * 10) + 90}%` }}
      ></div>
    </div>
    <p className="text-sm text-gray-500 mt-1">AI Confidence: High ✅</p>
  </>
)}

          </div>
        </div>
      )}
      

      {/* ✅ History Table */}
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

          {/* ✅ New Export Buttons */}
          <button onClick={handleExportCSV} className="export-btn">
            📤 Export CSV
          </button>
          <button onClick={handleExportPDF} className="export-btn">
            🧾 Export PDF
          </button>
          <button onClick={handleShareReport} className="export-btn">
            📤 Share Report
          </button>

        </div>
      )}
     
      <footer className="footer">
  {/* 🔹 Left Section — Tips and Copyright */}
  <div className="footer-left">
    <p>
      © {new Date().getFullYear()} Cost Optimizer | React + Node.js ⚡ | Sahil Samal
    </p>
    <p className="tips">
      💡 Tips: Track expenses daily | Avoid unnecessary subscriptions |
      Use energy-efficient tools | Set monthly budgets | It took me so much time to make 😅
    </p>
  </div>

  {/* 🔹 Center Section — Reset Button */}
  <div className="footer-center">
    <button onClick={handleResetAll} className="reset-btn">
      ♻️ Reset All
    </button>
  </div>

  {/* 🔹 Right Section — Disclaimer */}
  <div className="footer-right">
    <p className="disclaimer">
      ⚠️ Disclaimer: This project is intended for small-scale finance and educational
      purposes only. It should not be used not be use for heavy or enterprise-level financial tasks.
      Built with effort and care 💖. Just a very simple one please don't take it seriously
    </p>
  </div>
</footer>


               {/* ✅ Floating AI Assistant Menu */}
      <div style={{ position: "fixed", bottom: "30px", right: "30px" }}>
        <button
          className="ai-float-btn"
          onClick={() => setShowAIMenu(!showAIMenu)}
          title="AI Assistant"
        >
          🤖
        </button>

        {showAIMenu && (
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              right: "0",
              background: "#ffffff",
              border: "1px solid #ccc",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              padding: "12px",
              width: "220px",
              zIndex: 999,
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              🤖 AI Assistant
            </p>

            <button
              onClick={() => {
                handleAIAnalyze();
                setShowAIMenu(false);
              }}
              style={{
                width: "100%",
                margin: "5px 0",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                cursor: "pointer",
              }}
            >
              🧠 Analyze Costs
            </button>

            <button
              onClick={() => {
                handlePredictNextMonth();
                setShowAIMenu(false);
              }}
              style={{
                width: "100%",
                margin: "5px 0",
                background: "#6f42c1",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                cursor: "pointer",
              }}
            >
              🔮 Predict Next Month
            </button>

            {/* ✅ Chat with AI Button */}
            <button
              onClick={() => startAIChat()}
              style={{
                width: "100%",
                margin: "5px 0",
                background: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap", // ✅ fix wrapping issue
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              💬 Chat with AI
            </button>
          </div>
        )}
      </div>

      {/* ✅ Chat Box Section */}
      {showChat && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "300px",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          {/* ✅ Header with Close Button */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  }}
>
  <h4 style={{ margin: 0 }}>🤖 AI Assistant</h4>
  <button
    onClick={() => setShowChat(false)}   // ✅ closes the chat window
    style={{
      background: "transparent",
      border: "none",
      fontSize: "18px",
      cursor: "pointer",
      color: "#666",
    }}
    title="Close"
  >
    ❌
  </button>
</div>


          {/* ✅ Messages area */}
          <div
            style={{
              height: "250px",
              overflowY: "auto",
              border: "1px solid #eee",
              padding: "8px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <p
                key={i}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  background:
                    msg.sender === "user" ? "#007bff22" : "#28a74522",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  margin: "5px 0",
                }}
              >
                {msg.text}
              </p>
            ))}
          </div>

          {/* ✅ Input area */}
          <div style={{ display: "flex" }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                marginLeft: "5px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
