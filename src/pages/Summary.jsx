// Summary.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, saveSummary, generateSummary } from "../api";

const STEPS = [
  { label: "Personal" },
  { label: "Education" },
  { label: "Experience" },
  { label: "Skills" },
  { label: "Summary" },
  { label: "Template" },
];

function StepProgress({ current }) {
  return (
    <div
      className="step-progress"
      style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}
    >
      {STEPS.map((step, i) => {
        const status = i < current ? "done" : i === current ? "active" : "";
        return (
          <div key={i} className="step-item" style={{ flexShrink: 0 }}>
            <div className={`step-dot ${status}`}>
              {status === "done" ? "✓" : i + 1}
            </div>
            <span className={`step-label ${status}`}>{step.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${status === "done" ? "done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.15"
      />
    </svg>
  );
}

function Summary() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 1000;

  const handleGenerate = async () => {
    const id = getCVId();
    if (!id) { setError("Session not found. Please start from the beginning."); return; }
    setGenerating(true);
    setError("");
    try {
      const { summary: aiSummary } = await generateSummary(id);
      setSummary(aiSummary);
      setCharCount(aiSummary.length);
      setGenerated(true);
    } catch (err) {
      setError(err.message || "Failed to generate summary.");
    } finally {
      setGenerating(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setSummary(val);
      setCharCount(val.length);
    }
  };

  const handleDone = async () => {
    const id = getCVId();
    if (!id) { setError("Session not found."); return; }
    setSaving(true);
    setError("");
    try {
      await saveSummary(id, summary);
      navigate("/template-select");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <StepProgress current={4} />

        <div className="section-header">
          <span className="section-tag">Step 5 of 6</span>
          <h1 className="section-title">Professional Summary</h1>
          <p className="section-sub">
            A short paragraph at the top of your CV that introduces who you are.
            Generate one with AI or write your own.
          </p>
        </div>

        <div className="card">
          {/* AI Generate header row — stack on narrow screens */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-h)", marginBottom: 4 }}>
                {generated ? "AI Generated Summary" : "Generate with AI"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {generated
                  ? "Feel free to edit it below to match your voice."
                  : "Based on your education, experience and skills."}
              </div>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={handleGenerate}
              disabled={generating}
              style={{ background: "var(--accent)", flexShrink: 0 }}
            >
              {generating ? (
                <>
                  <span style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                  }} />
                  Generating…
                </>
              ) : (
                <><SparkleIcon /> {generated ? "Regenerate" : "Generate Summary"}</>
              )}
            </button>
          </div>

          <div className="section-divider" />

          {/* Textarea */}
          <div style={{ marginTop: 20 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6,
            }}>
              <label style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                textTransform: "uppercase", color: "var(--text-muted)",
              }}>
                Your Summary
              </label>
              <span style={{
                fontSize: 12,
                color: charCount > MAX_CHARS * 0.9 ? "var(--danger)" : "var(--text-muted)",
                flexShrink: 0,
              }}>
                {charCount} / {MAX_CHARS}
              </span>
            </div>
            <textarea
              value={summary}
              onChange={handleChange}
              placeholder={
                generating
                  ? "Generating your summary…"
                  : "Write your professional summary here, or click Generate Summary above to create one with AI…"
              }
              disabled={generating}
              style={{
                width: "100%",
                minHeight: 160,
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "14px",
                color: "var(--text-h)",
                fontFamily: "var(--sans)",
                fontSize: 15,
                lineHeight: 1.7,
                outline: "none",
                resize: "vertical",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
                opacity: generating ? 0.5 : 1,
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />

            {/* Tips */}
            
          </div>

          {error && (
            <div style={{
              marginTop: 16, padding: "10px 14px",
              background: "var(--danger-bg)",
              border: "1.5px solid rgba(224,82,82,0.3)",
              borderRadius: "var(--radius-sm)",
              color: "var(--danger)", fontSize: 13,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Nav actions — stack on mobile */}
        <div
          className="form-actions"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/skills")}
            style={{ flex: "1 1 auto", maxWidth: 120, justifyContent: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleDone}
            disabled={saving || !summary.trim()}
            style={{ flex: "1 1 auto", maxWidth: 220, justifyContent: "center" }}
          >
            {saving ? "Saving…" : "Next: Choose Template"}
            {!saving && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Summary;