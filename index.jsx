import { useState, useRef, useEffect } from "react";

const MODES = ["Daily Polls", "Offers", "Customer Feedback", "Combo Builder"];

const modePrompts = {
  "Daily Polls": "Generate 5 short WhatsApp polls about daily vegetable/grocery preferences, quantity, and delivery timing. Keep it casual Hinglish.",
  "Offers": "Generate 5 short WhatsApp polls about grocery offers, discounts, free items, and bundle deals. Keep it casual Hinglish.",
  "Customer Feedback": "Generate 5 short WhatsApp polls asking customers about quality, pricing, delivery experience, and satisfaction.",
  "Combo Builder": "Generate 5 short WhatsApp polls about combo choices, weekly bundles, and family packs for a grocery delivery service.",
};

function parsePollsFromText(text) {
  // Try to parse JSON first
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);
    if (Array.isArray(data)) return data;
    if (data.polls) return data.polls;
  } catch {}
  return null;
}

const EMOJI_OPTIONS = ["🍅", "🥔", "🥦", "🌽", "🥕", "🍋", "🧅", "🫑", "🥬", "🍆", "💰", "👍", "✅", "🔥", "⭐", "🎁", "🚀", "📦", "🥗", "🌿"];

function randomEmoji(index) {
  return EMOJI_OPTIONS[index % EMOJI_OPTIONS.length];
}

export default function BhajiiPalaPolls() {
  const [topic, setTopic] = useState("Daily Sabji Poll");
  const [mode, setMode] = useState("Daily Polls");
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);

  const generatePolls = async () => {
    setLoading(true);
    setError("");
    setPolls([]);

    const systemPrompt = `You are a WhatsApp poll generator for BhajiiPala, a fresh vegetable & grocery delivery startup in Maharashtra. 
Generate exactly 5 polls. Respond ONLY with valid JSON array. No markdown, no explanation.
Format: [{"question": "...", "options": ["...", "...", "..."]}, ...]
Rules:
- Language: Simple Hinglish (Hindi + English mix)
- Each poll: 1 question + 3-4 short options
- Add 1-2 emojis per option
- Keep question under 15 words
- Keep each option under 8 words
- WhatsApp-friendly, fun, casual`;

    const userPrompt = `Topic: "${topic}"
Mode: ${mode}
${modePrompts[mode]}
Generate 5 polls now.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = parsePollsFromText(text);
      if (parsed && parsed.length > 0) {
        setPolls(parsed.slice(0, 5));
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        setError("Poll generate nahi ho sake. Dobara try karo! 🙏");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPoll = (poll, index) => {
    const num = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"][index] || `${index + 1}.`;
    const options = poll.options.map(o => `  ${o}`).join("\n");
    return `${num} ${poll.question}\n${options}`;
  };

  const copyPoll = async (poll, index) => {
    await navigator.clipboard.writeText(formatPoll(poll, index));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = async () => {
    const text = `📊 Aaj ke Polls - BhajiiPala 🥦\n\n` + polls.map((p, i) => formatPoll(p, i)).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div style={{
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #ecfdf5 100%)",
      minHeight: "100vh",
      paddingBottom: 40,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn-primary {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px 28px;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          width: 100%;
          letter-spacing: 0.3px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(34,197,94,0.35);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(34,197,94,0.45); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .btn-copy {
          background: #f0fdf4;
          border: 2px solid #bbf7d0;
          color: #15803d;
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }
        .btn-copy:hover { background: #dcfce7; border-color: #22c55e; }
        .btn-copy.copied { background: #22c55e; color: white; border-color: #22c55e; }
        .btn-outline {
          background: white;
          border: 2.5px solid #22c55e;
          color: #16a34a;
          border-radius: 16px;
          padding: 14px 24px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          flex: 1;
        }
        .btn-outline:hover { background: #f0fdf4; transform: translateY(-1px); }
        .poll-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          border: 1.5px solid #f0fdf4;
          transition: box-shadow 0.2s;
          animation: slideUp 0.35s ease both;
        }
        .poll-card:hover { box-shadow: 0 6px 24px rgba(34,197,94,0.13); }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .option-pill {
          display: inline-block;
          background: #f0fdf4;
          border: 1.5px solid #d1fae5;
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 14px;
          color: #166534;
          margin: 4px 4px 4px 0;
          font-weight: 600;
        }
        input, select {
          font-family: inherit;
          width: 100%;
          padding: 14px 18px;
          border-radius: 14px;
          border: 2px solid #d1fae5;
          font-size: 15px;
          background: white;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.2s;
          font-weight: 600;
        }
        input:focus, select:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
        .pulse-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1s infinite;
          margin: 0 3px;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .badge {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border-radius: 100px;
          padding: 3px 12px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
        padding: "32px 24px 28px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(22,163,74,0.25)",
      }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>🥦</div>
        <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          BhajiiPala Poll Generator
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", marginTop: 6, fontSize: 14, fontWeight: 600 }}>
          Create WhatsApp polls in 1 click ✨
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>

        {/* Input Card */}
        <div style={{
          background: "white",
          borderRadius: 24,
          padding: "24px 20px",
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          marginBottom: 20,
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 800, color: "#166534", marginBottom: 8, fontSize: 13, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              📝 Topic
            </label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter topic (e.g. Daily Sabji, Offers, Feedback)"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 800, color: "#166534", marginBottom: 8, fontSize: 13, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              🎯 Mode
            </label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              {MODES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <button className="btn-primary" onClick={generatePolls} disabled={loading || !topic.trim()}>
            {loading ? (
              <span>Generating <span className="pulse-dot" /> <span className="pulse-dot" style={{ animationDelay: "0.2s" }} /> <span className="pulse-dot" style={{ animationDelay: "0.4s" }} /></span>
            ) : "Generate Polls 🚀"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 16, padding: 16, color: "#dc2626", fontWeight: 700, textAlign: "center", marginBottom: 16, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Output Section */}
        {polls.length > 0 && (
          <div ref={outputRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#166534" }}>📊 Generated Polls</h2>
              <span className="badge">{polls.length} polls</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {polls.map((poll, i) => (
                <div key={i} className="poll-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flex: 1 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>
                        {["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣"][i]}
                      </span>
                      <p style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a", lineHeight: 1.4 }}>
                        {poll.question}
                      </p>
                    </div>
                    <button
                      className={`btn-copy ${copiedIndex === i ? "copied" : ""}`}
                      onClick={() => copyPoll(poll, i)}
                    >
                      {copiedIndex === i ? "Copied ✅" : "Copy"}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {poll.options?.map((opt, j) => (
                      <span key={j} className="option-pill">{opt}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-outline"
                onClick={copyAll}
                style={{ background: copiedAll ? "#dcfce7" : "white" }}
              >
                {copiedAll ? "Copied All ✅" : "Copy All 📋"}
              </button>
              <button
                className="btn-outline"
                onClick={generatePolls}
                disabled={loading}
              >
                Regenerate 🔄
              </button>
            </div>

            {/* WhatsApp tip */}
            <div style={{
              marginTop: 16,
              background: "#f0fdf4",
              borderRadius: 14,
              padding: "12px 16px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <p style={{ fontSize: 12, color: "#166534", fontWeight: 700, lineHeight: 1.5 }}>
                "Copy All" tap karo → WhatsApp group mein paste karo → Done! 🎉
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
