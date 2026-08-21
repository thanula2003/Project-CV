// Skills.jsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, getSkillSuggestions, saveSkills } from "../api";
import { useAiLimit } from "../hooks/useAiLimit";
import AiLimitPopup from "../componenets/AiLimitPopup";

const STEPS = [
  { label: "Personal" },
  { label: "Education" },
  { label: "Experience" },
  { label: "Skills" },
  { label: "Summary" },
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

function SkillChip({ label, onRemove, variant = "added" }) {
  const styles = {
    added:      { background: "var(--text-h)",   color: "var(--bg)",     border: "1.5px solid var(--text-h)" },
    suggestion: { background: "var(--accent-bg)", color: "var(--accent)", border: "1.5px solid var(--accent)", cursor: "pointer" },
    selected:   { background: "var(--accent)",    color: "#fff",          border: "1.5px solid var(--accent)", cursor: "pointer" },
  };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500,
        fontFamily: "var(--sans)", transition: "all 0.15s", userSelect: "none",
        ...styles[variant],
      }}
      onClick={variant !== "added" ? onRemove : undefined}
    >
      {label}
      {variant === "added" && (
        <button
          type="button"
          onClick={onRemove}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, opacity: 0.7, fontSize: 15, display: "flex", alignItems: "center" }}
        >
          ×
        </button>
      )}
      {variant === "suggestion" && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {variant === "selected" && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
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

function Skills() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();
  const cvId = getCVId();
  const aiLimit = useAiLimit(cvId, "skills", 7);

  const addSkill = () => {
    const trimmed = inputVal.trim();
    if (!trimmed || skills.includes(trimmed)) { setInputVal(""); return; }
    setSkills([...skills, trimmed]);
    setInputVal("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
  };

  const removeSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const fetchSuggestions = async () => {
    if (!aiLimit.consume()) return;
    const id = getCVId();
    if (!id) { setError("No CV session found."); return; }
    setLoadingSuggestions(true);
    setError("");
    try {
      const { suggestions: list } = await getSkillSuggestions(id);
      setSuggestions(list);
      setSelected(new Set());
    } catch (err) {
      setError(err.message || "Failed to fetch suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const toggleSuggestion = (skill) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  };

  const addSelectedSuggestions = () => {
    const toAdd = [...selected].filter((s) => !skills.includes(s));
    setSkills([...skills, ...toAdd]);
    setSelected(new Set());
    setSuggestions([]);
  };

  const handleNext = async () => {
    const id = getCVId();
    if (!id) return;
    setSaving(true);
    try {
      await saveSkills(id, skills);
      navigate("/summary");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <StepProgress current={3} />

        <div className="section-header">
          <span className="section-tag">Step 4 of 5</span>
          <h1 className="section-title">Skills</h1>
          <p className="section-sub">
            Add your professional skills manually, or let AI suggest them based on your education and experience.
          </p>
        </div>

        {/* Manual input */}
        <div className="card" style={{ marginBottom: 20 }}>
          <label style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
            color: "var(--text-muted)", display: "block", marginBottom: 12,
          }}>
            Add Skills Manually
          </label>

          {/* Input + button — stack on very small screens */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter…"
              style={{
                flex: "1 1 180px", minWidth: 0,
                background: "var(--surface)", border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "11px 14px", color: "var(--text-h)",
                fontFamily: "var(--sans)", fontSize: 15, outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={addSkill}
              disabled={!inputVal.trim()}
              style={{ flexShrink: 0 }}
            >
              Add
            </button>
          </div>

          {skills.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((s) => (
                <SkillChip key={s} label={s} variant="added" onRemove={() => removeSkill(s)} />
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              No skills added yet — type above or use AI suggestions below.
            </p>
          )}
        </div>

        {/* AI Suggestions */}
        <div className="card">
          {/* Header row — stack on narrow screens */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: suggestions.length ? 20 : 0,
            flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-h)", marginBottom: 4 }}>
                AI Skill Suggestions
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Based on your education &amp; experience.
              </div>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={fetchSuggestions}
              disabled={loadingSuggestions}
              style={{ background: "var(--accent)", flexShrink: 0 }}
            >
              {loadingSuggestions ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%", display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                  }} />
                  Generating…
                </>
              ) : (
                <><SparkleIcon /> Suggest Skills</>
              )}
            </button>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "var(--danger-bg)",
              border: "1.5px solid rgba(224,82,82,0.3)", borderRadius: "var(--radius-sm)",
              color: "var(--danger)", fontSize: 13, marginTop: 16,
            }}>
              {error}
            </div>
          )}

          {suggestions.length > 0 && (
            <>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
                Click to select, then hit <strong style={{ color: "var(--text-h)" }}>Add Selected</strong>.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {suggestions.map((s) => {
                  const already = skills.includes(s);
                  const sel = selected.has(s);
                  return (
                    <SkillChip
                      key={s}
                      label={s}
                      variant={already ? "added" : sel ? "selected" : "suggestion"}
                      onRemove={already ? undefined : () => toggleSuggestion(s)}
                    />
                  );
                })}
              </div>

              {/* Action buttons — stack on mobile */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={addSelectedSuggestions}
                  disabled={selected.size === 0}
                  style={{ flex: "1 1 auto", maxWidth: 220, justifyContent: "center" }}
                >
                  Add Selected ({selected.size})
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSuggestions([])}
                  style={{ flex: "1 1 auto", maxWidth: 120, fontSize: 13, justifyContent: "center" }}
                >
                  Dismiss
                </button>
              </div>
            </>
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
            onClick={() => navigate("/experience")}
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
            onClick={handleNext}
            disabled={saving || skills.length === 0}
            style={{ flex: "1 1 auto", maxWidth: 260, justifyContent: "center" }}
          >
            {saving ? "Saving…" : `Next: Summary (${skills.length} skill${skills.length !== 1 ? "s" : ""})`}
            {!saving && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {aiLimit.showLimitPopup && (
        <AiLimitPopup
          onClose={aiLimit.closePopup}
          message="You've used all 3 free AI skill suggestions. Feel free to add the rest of your skills manually!"
        />
      )}
    </div>
  );
}

export default Skills;