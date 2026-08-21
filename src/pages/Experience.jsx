// src/pages/Experience.jsx

import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, saveExperience,suggestResponsibilities } from "../api";
import { useAiLimit } from "../hooks/useAiLimit";
import AiLimitPopup from "../componenets/AiLimitPopup";
import { useCVField } from "../context/CVContext";

const STEPS = [
  { label: "Personal" },
  { label: "Education" },
  { label: "Experience" },
  { label: "Projects" },
  { label: "Skills" },
  { label: "Summary" },
];

const EMPLOYMENT_TYPES = [
  "Full-time", "Part-time", "Internship", "Freelance / Contract", "Volunteer", "Apprenticeship",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

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
            <div className={`step-dot ${status}`}>{status === "done" ? "✓" : i + 1}</div>
            <span className={`step-label ${status}`}>{step.label}</span>
            {i < STEPS.length - 1 && <div className={`step-line ${status === "done" ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

const ChevronIcon = ({ open }) => (
  <svg className={`chevron ${open ? "open" : ""}`} width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 4h11M5 4V2.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5V4M6 7v4M9 7v4M3.5 4l.5 9a1 1 0 001 1h5a1 1 0 001-1l.5-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function MonthYearPicker({ label, month, year, onMonth, onYear, disabled }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 100px), 1fr))",
          gap: 8,
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <select value={month} onChange={(e) => onMonth(e.target.value)} style={{ width: "100%", minWidth: 0 }}>
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => onYear(e.target.value)} style={{ width: "100%", minWidth: 0 }}>
          <option value="">Year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

function newEntry() {
  return {
    id: Date.now() + Math.random(),
    company: "", position: "", employmentType: "", location: "",
    startMonth: "", startYear: "", endMonth: "", endYear: "",
    isCurrent: false, description: "", open: true, showDescription: false,
  };
}

function formatDateRange(entry) {
  const start = [entry.startMonth, entry.startYear].filter(Boolean).join(" ");
  const end = entry.isCurrent ? "Present" : [entry.endMonth, entry.endYear].filter(Boolean).join(" ");
  if (start && end) return `${start} → ${end}`;
  return start || end || null;
}

function ExperienceCard({ entry, index, onUpdate, onRemove, aiLimit }) {
  const toggleOpen = () => onUpdate({ ...entry, open: !entry.open });
  const set = (key, val) => onUpdate({ ...entry, [key]: val });

  const cardTitle = entry.company || `Experience ${index + 1}`;
  const cardSub = [entry.position, entry.employmentType, formatDateRange(entry)].filter(Boolean).join(" · ");

  function AiGlowButton({ onClick, disabled, loading, children }) {
    return (
      <>
        <style>{`
          .btn-ai-glow {
            position: relative;
            padding: 0;
            border: none;
            border-radius: var(--radius-sm, 8px);
            background: transparent;
            cursor: pointer;
            isolation: isolate;
          }
          .btn-ai-glow::before {
            content: "";
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            background: linear-gradient(135deg, #00f0ff, #7c3aed, #ec4899, #00f0ff);
            background-size: 300% 300%;
            animation: ai-glow-rotate 4s linear infinite;
            z-index: 0;
            filter: blur(6px);
            opacity: 0.7;
            transition: opacity 0.3s ease;
          }
          .btn-ai-glow::after {
            content: "";
            position: absolute;
            inset: -1.5px;
            border-radius: inherit;
            background: linear-gradient(135deg, #00f0ff, #7c3aed, #ec4899, #00f0ff);
            background-size: 300% 300%;
            animation: ai-glow-rotate 4s linear infinite;
            z-index: 1;
          }
          .btn-ai-glow:hover::before { opacity: 1; filter: blur(10px); }
          .btn-ai-glow.loading::before { opacity: 1; filter: blur(12px); animation-duration: 1.2s; }
          .btn-ai-glow.loading::after { animation-duration: 1.2s; }
          .btn-ai-glow:disabled { cursor: default; }
          .btn-ai-glow:disabled:not(.loading)::before,
          .btn-ai-glow:disabled:not(.loading)::after {
            animation: none;
            background: var(--border, #444);
            opacity: 0.4;
            filter: none;
          }
          .btn-ai-glow-inner {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 16px;
            border-radius: inherit;
            background: var(--surface, #1a1a1a);
            color: var(--text, #fff);
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
          }
          .btn-ai-glow:disabled:not(.loading) .btn-ai-glow-inner { color: var(--text-muted, #888); }
          .btn-ai-glow.loading .btn-ai-glow-inner {
            background: linear-gradient(
              90deg,
              var(--surface, #1a1a1a) 0%,
              rgba(124,58,237,0.25) 50%,
              var(--surface, #1a1a1a) 100%
            );
            background-size: 200% 100%;
            animation: ai-shimmer 1.5s linear infinite;
          }
          .ai-spinner {
            width: 13px;
            height: 13px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.25);
            border-top-color: #00f0ff;
            border-right-color: #7c3aed;
            animation: ai-spin 0.7s linear infinite;
            flex-shrink: 0;
          }
          @keyframes ai-glow-rotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes ai-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes ai-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <button
          type="button"
          className={`btn-ai-glow${loading ? " loading" : ""}`}
          disabled={disabled}
          onClick={onClick}
        >
          <span className="btn-ai-glow-inner">
            {loading && <span className="ai-spinner" />}
            {children}
          </span>
        </button>
      </>
    );
  }

  return (
    <div className="institute-card">
      <div
        className="institute-card-header"
        onClick={toggleOpen}
        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
      >
        <div
          className="institute-card-header-left"
          style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}
        >
          <div className="institute-index" style={{ background: "var(--text-h)", flexShrink: 0 }}>{index + 1}</div>
          <div style={{ minWidth: 0 }}>
            <div
              className="institute-card-title"
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {cardTitle}
            </div>
            {cardSub && (
              <div
                className="institute-card-sub"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {cardSub}
              </div>
            )}
          </div>
        </div>
        <div
          className="institute-card-actions"
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 6, flexShrink: 0 }}
        >
          <button className="btn-icon danger" onClick={onRemove}><TrashIcon /></button>
          <button className="btn-icon" onClick={toggleOpen}><ChevronIcon open={entry.open} /></button>
        </div>
      </div>

      {entry.open && (
        <div className="institute-card-body">
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}
          >
            <div className="field">
              <label>Company / Organization *</label>
              <input
                type="text"
                placeholder="e.g. Google, Freelance"
                value={entry.company}
                onChange={(e) => set("company", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>Job Title / Position *</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer/ Accountant"
                value={entry.position}
                onChange={(e) => set("position", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>Employment Type</label>
              <select
                value={entry.employmentType}
                onChange={(e) => set("employmentType", e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">Select type…</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>
                Location{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                  optional
                </span>
              </label>
              <input
                type="text"
                placeholder="New York, United States / Remote"
                value={entry.location}
                onChange={(e) => set("location", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={{
              fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
              color: "var(--text-muted)", display: "block", marginBottom: 14,
            }}>
              Time Period
            </label>
            <div
              className="form-grid"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}
            >
              <MonthYearPicker
                label="Start Date *"
                month={entry.startMonth} year={entry.startYear}
                onMonth={(v) => set("startMonth", v)} onYear={(v) => set("startYear", v)}
              />
              <MonthYearPicker
                label="End Date"
                month={entry.endMonth} year={entry.endYear}
                onMonth={(v) => set("endMonth", v)} onYear={(v) => set("endYear", v)}
                disabled={entry.isCurrent}
              />
            </div>

            <label style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 14, cursor: "pointer", userSelect: "none" }}>
              <span
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${entry.isCurrent ? "var(--accent)" : "var(--border)"}`,
                  background: entry.isCurrent ? "var(--accent)" : "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", flexShrink: 0,
                }}
                onClick={() => set("isCurrent", !entry.isCurrent)}
              >
                {entry.isCurrent && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                style={{ fontSize: 14, color: "var(--text-h)", fontWeight: 500 }}
                onClick={() => set("isCurrent", !entry.isCurrent)}
              >
                I currently work here
              </span>
              {entry.isCurrent && (
                <span style={{ fontSize: 12, fontWeight: 600, background: "var(--accent-bg)", color: "var(--accent)", padding: "2px 8px", borderRadius: 20 }}>
                  Present
                </span>
              )}
            </label>
          </div>

          <div style={{ marginTop: 20 }}>
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <button
      type="button"
      className="btn-ghost"
      style={{
        background: entry.showDescription ? "var(--accent-bg)" : "",
        borderColor: entry.showDescription ? "var(--accent)" : "",
        color: entry.showDescription ? "var(--accent)" : "",
      }}
      onClick={() => onUpdate({ ...entry, showDescription: !entry.showDescription })}
    >
      {entry.showDescription
        ? <><MinusIcon /> Hide Description</>
        : <><PlusIcon /> Add Roles &amp; Responsibilities</>}
    </button>

    {entry.showDescription && (
  <AiGlowButton
    disabled={!entry.company || !entry.position || entry.suggesting}
    loading={entry.suggesting}
    onClick={async () => {
      if (!aiLimit.consume()) return;
      const id = getCVId();
      if (!id) return;
      onUpdate({ ...entry, suggesting: true });
      try {
        const { description } = await suggestResponsibilities(id, {
          company: entry.company,
          position: entry.position,
          employmentType: entry.employmentType,
        });
        onUpdate({ ...entry, description, suggesting: false });
      } catch (err) {
        onUpdate({ ...entry, suggesting: false });
      }
    }}
  >
    {entry.suggesting ? "Generating…" : "✨ Suggest with AI (Free)"}
  </AiGlowButton>
)}
            
          </div>

          {entry.showDescription && (
            <div className="field" style={{ marginTop: 14 }}>
              <label>What did you do?</label>
              <textarea
                placeholder={"• Led development of the main dashboard\n• Collaborated with a team of 5\n• Reduced load time by 40%"}
                value={entry.description}
                onChange={(e) => set("description", e.target.value)}
                style={{ minHeight: 180, width: "100%" }}
              />
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}

function Experience() {
  const navigate = useNavigate();
  const [entries, setEntries] = useCVField("experience", "entries");

useEffect(() => {
  if (entries.length === 0) setEntries([newEntry()]);
}, []); 
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const cvId = getCVId();
  const aiLimit = useAiLimit(cvId, "experience", 10);

  const addEntry    = () => setEntries([...entries, newEntry()]);
  const updateEntry = (id, updated) => setEntries(entries.map((e) => (e.id === id ? updated : e)));
  const removeEntry = (id) => { if (entries.length > 1) setEntries(entries.filter((e) => e.id !== id)); };

  const handleNext = async () => {
    const id = getCVId();
    if (!id) { setError("Session not found."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = entries.map(({ id: _id, open, showDescription,suggesting, ...rest }) => rest);
      await saveExperience(id, payload);
      navigate("/projects-prompt"); // ← goes to the gate page first
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <StepProgress current={2} />

        <div className="section-header">
          <span className="section-tag">Step 3 of 6</span>
          <h1 className="section-title">Work Experience</h1>
          <p className="section-sub">Add your work history — most recent first. Include internships, freelance, and volunteer roles too.</p>
        </div>

        {entries.map((entry, i) => (
          <ExperienceCard
            key={entry.id}
            entry={entry}
            index={i}
            onUpdate={(updated) => updateEntry(entry.id, updated)}
            onRemove={() => removeEntry(entry.id)}
            aiLimit={aiLimit}
          />
        ))}

        <button type="button" className="btn-ghost" onClick={addEntry} style={{ marginTop: 4 }}>
          <PlusIcon size={16} /> Add Another Experience
        </button>

        {error && <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 12 }}>{error}</p>}

        <div
          className="form-actions"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/education")}
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
            disabled={saving}
            style={{ flex: "1 1 auto", maxWidth: 220, justifyContent: "center" }}
          >
            {saving ? "Saving…" : "Next: Projects"}
            {!saving && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {aiLimit.showLimitPopup && (
        <AiLimitPopup
          onClose={aiLimit.closePopup}
          message="You've used all 10 free AI suggestions for Work Experience. You can still write your own — it only takes a minute!"
        />
      )}
    </div>
  );
}

export default Experience;