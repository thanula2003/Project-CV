// src/pages/Projects.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, saveProjects } from "../api";

const STEPS = [
  { label: "Personal" },
  { label: "Education" },
  { label: "Experience" },
  { label: "Projects" },
  { label: "Skills" },
  { label: "Summary" },
];

const PROJECT_TYPES = [
  "Personal Project",
  "Academic / University",
  "Open Source",
  "Freelance",
  "Team Project",
  "Research",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

// ── Icons ─────────────────────────────────────────────────────

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
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M6 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 2h4m0 0v4m0-4L5.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Month/Year Picker ─────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────

function newEntry() {
  return {
    id: Date.now() + Math.random(),
    title: "",
    projectType: "",
    techStack: "",
    liveUrl: "",
    repoUrl: "",
    startMonth: "", startYear: "", endMonth: "", endYear: "",
    isOngoing: false,
    description: "",
    open: true,
    showLinks: false,
  };
}

function formatDateRange(entry) {
  const start = [entry.startMonth, entry.startYear].filter(Boolean).join(" ");
  const end = entry.isOngoing ? "Ongoing" : [entry.endMonth, entry.endYear].filter(Boolean).join(" ");
  if (start && end) return `${start} → ${end}`;
  return start || end || null;
}

// ── Project Card ──────────────────────────────────────────────

function ProjectCard({ entry, index, onUpdate, onRemove }) {
  const toggleOpen = () => onUpdate({ ...entry, open: !entry.open });
  const set = (key, val) => onUpdate({ ...entry, [key]: val });

  const cardTitle = entry.title || `Project ${index + 1}`;
  const cardSub = [entry.projectType, entry.techStack, formatDateRange(entry)].filter(Boolean).join(" · ");

  return (
    <div className="institute-card">
      {/* Card header */}
      <div
        className="institute-card-header"
        onClick={toggleOpen}
        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
      >
        <div
          className="institute-card-header-left"
          style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}
        >
          <div
            className="institute-index"
            style={{ background: "var(--accent)", flexShrink: 0 }}
          >
            {index + 1}
          </div>
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
          {/* Main fields */}
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}
          >
            <div className="field">
              <label>Project Title *</label>
              <input
                type="text"
                placeholder="e.g. Tracker App, E-Commerce Website"
                value={entry.title}
                onChange={(e) => set("title", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>Project Type</label>
              <select
                value={entry.projectType}
                onChange={(e) => set("projectType", e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">Select type…</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>
                Tech Stack{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                  optional
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, MongoDB, Tailwind CSS"
                value={entry.techStack}
                onChange={(e) => set("techStack", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Time Period */}
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
                label="Start Date"
                month={entry.startMonth} year={entry.startYear}
                onMonth={(v) => set("startMonth", v)} onYear={(v) => set("startYear", v)}
              />
              <MonthYearPicker
                label="End Date"
                month={entry.endMonth} year={entry.endYear}
                onMonth={(v) => set("endMonth", v)} onYear={(v) => set("endYear", v)}
                disabled={entry.isOngoing}
              />
            </div>

            {/* Ongoing checkbox */}
            <label style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              marginTop: 14, cursor: "pointer", userSelect: "none",
            }}>
              <span
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${entry.isOngoing ? "var(--accent)" : "var(--border)"}`,
                  background: entry.isOngoing ? "var(--accent)" : "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", flexShrink: 0,
                }}
                onClick={() => set("isOngoing", !entry.isOngoing)}
              >
                {entry.isOngoing && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                style={{ fontSize: 14, color: "var(--text-h)", fontWeight: 500 }}
                onClick={() => set("isOngoing", !entry.isOngoing)}
              >
                This project is ongoing
              </span>
              {entry.isOngoing && (
                <span style={{
                  fontSize: 12, fontWeight: 600, background: "var(--accent-bg)",
                  color: "var(--accent)", padding: "2px 8px", borderRadius: 20,
                }}>
                  Ongoing
                </span>
              )}
            </label>
          </div>

          {/* Optional Links */}
          <div style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn-ghost"
              style={{
                background: entry.showLinks ? "var(--accent-bg)" : "",
                borderColor: entry.showLinks ? "var(--accent)" : "",
                color: entry.showLinks ? "var(--accent)" : "",
              }}
              onClick={() => onUpdate({ ...entry, showLinks: !entry.showLinks })}
            >
              {entry.showLinks
                ? <><MinusIcon /> Hide Links</>
                : <><LinkIcon /> Add Project Links</>}
            </button>

            {entry.showLinks && (
              <div
                className="form-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", marginTop: 14 }}
              >
                <div className="field">
                  <label>
                    Live URL{" "}
                    <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                      optional
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://myproject.com"
                    value={entry.liveUrl}
                    onChange={(e) => set("liveUrl", e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="field">
                  <label>
                    Repository URL{" "}
                    <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                      optional
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/user/repo"
                    value={entry.repoUrl}
                    onChange={(e) => set("repoUrl", e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginTop: 16 }} className="field">
            <label>
              Project Description{" "}
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                optional
              </span>
            </label>
            <textarea
              placeholder={"• Built a full-stack CV builder with AI-powered content generation\n• Integrated PayHere payment gateway for premium PDF exports\n• Deployed on Hostinger with MongoDB Atlas as the database"}
              value={entry.description}
              onChange={(e) => set("description", e.target.value)}
              style={{ minHeight: 110, width: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

function Projects() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([newEntry()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addEntry    = () => setEntries([...entries, newEntry()]);
  const updateEntry = (id, updated) => setEntries(entries.map((e) => (e.id === id ? updated : e)));
  const removeEntry = (id) => { if (entries.length > 1) setEntries(entries.filter((e) => e.id !== id)); };

  const handleNext = async () => {
    const id = getCVId();
    if (!id) { setError("Session not found."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = entries.map(({ id: _id, open, showLinks, ...rest }) => rest);
      await saveProjects(id, payload);
      navigate("/skills");
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
          <span className="section-tag">Step 4 of 6</span>
          <h1 className="section-title">Projects</h1>
          <p className="section-sub">
            Showcase your best work — personal builds, academic projects, open-source contributions, or freelance work.
          </p>
        </div>

        {entries.map((entry, i) => (
          <ProjectCard
            key={entry.id}
            entry={entry}
            index={i}
            onUpdate={(updated) => updateEntry(entry.id, updated)}
            onRemove={() => removeEntry(entry.id)}
          />
        ))}

        <button type="button" className="btn-ghost" onClick={addEntry} style={{ marginTop: 4 }}>
          <PlusIcon size={16} /> Add Another Project
        </button>

        {error && <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 12 }}>{error}</p>}

        {/* Actions */}
        <div
          className="form-actions"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/projects-prompt")}
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
            {saving ? "Saving…" : "Next: Skills"}
            {!saving && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Projects;