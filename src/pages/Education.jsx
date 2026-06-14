//Education.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, saveEducation, suggestDescription} from "../api";


const STEPS = [
  { label: "Personal" },
  { label: "Education" },
  { label: "Experience" },
  { label: "Skills" },
  { label: "Summary" },
];

const QUALIFICATION_TYPES = [
  "Certificate",
  "Diploma",
  "HND",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD / Doctorate",
  "Professional Qualification",
  "Other",
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
    <div className="field" style={{ flex: "1 1 200px", minWidth: 0 }}>
      <label>{label}</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
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

function newInstitute() {
  return {
    id: Date.now() + Math.random(),
    institute: "", qualification: "", program: "", description: "",
    gpa: "", showGpa: false,
    startMonth: "", startYear: "", endMonth: "", endYear: "",
    isCurrent: false,
    subjects: [], open: true, showSubjects: false, showDescription: false,
  };
}
function newSubject() {
  return { id: Date.now() + Math.random(), name: "", grade: "" };
}

function InstituteCard({ inst, index, onUpdate, onRemove }) {
  const toggleOpen = () => onUpdate({ ...inst, open: !inst.open });
  const set = (key, val) => onUpdate({ ...inst, [key]: val });
  const addSubject = () => onUpdate({ ...inst, subjects: [...inst.subjects, newSubject()] });
  const removeSubject = (id) => onUpdate({ ...inst, subjects: inst.subjects.filter((s) => s.id !== id) });
  const updateSubject = (id, key, val) =>
    onUpdate({ ...inst, subjects: inst.subjects.map((s) => s.id === id ? { ...s, [key]: val } : s) });

  const cardTitle = inst.institute || `Institution ${index + 1}`;
  const cardSub = [inst.qualification, inst.program].filter(Boolean).join(" · ");

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
          <div className="institute-index" style={{ flexShrink: 0 }}>{index + 1}</div>
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
          <button className="btn-icon" onClick={toggleOpen}><ChevronIcon open={inst.open} /></button>
        </div>
      </div>

      {inst.open && (
        <div className="institute-card-body">
          {/* Main fields */}
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}
          >
            <div className="field full" style={{ gridColumn: "1 / -1" }}>
              <label>Institution Name *</label>
              <input
                type="text"
                placeholder="e.g. Your University name"
                value={inst.institute}
                onChange={(e) => set("institute", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>Qualification Type *</label>
              <select
                value={inst.qualification}
                onChange={(e) => set("qualification", e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="" disabled>Select type…</option>
                {QUALIFICATION_TYPES.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Program / Field of Study *</label>
              <input
                type="text"
                placeholder="e.g. Software Engineering"
                value={inst.program}
                onChange={(e) => set("program", e.target.value)}
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
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <MonthYearPicker
                label="Start Date"
                month={inst.startMonth} year={inst.startYear}
                onMonth={(v) => set("startMonth", v)} onYear={(v) => set("startYear", v)}
              />
              <MonthYearPicker
                label="End Date"
                month={inst.endMonth} year={inst.endYear}
                onMonth={(v) => set("endMonth", v)} onYear={(v) => set("endYear", v)}
                disabled={inst.isCurrent}
              />
            </div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 14, cursor: "pointer", userSelect: "none" }}>
              <span
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${inst.isCurrent ? "var(--accent)" : "var(--border)"}`,
                  background: inst.isCurrent ? "var(--accent)" : "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s", flexShrink: 0,
                }}
                onClick={() => set("isCurrent", !inst.isCurrent)}
              >
                {inst.isCurrent && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                style={{ fontSize: 14, color: "var(--text-h)", fontWeight: 500 }}
                onClick={() => set("isCurrent", !inst.isCurrent)}
              >
                I currently study here
              </span>
              {inst.isCurrent && (
                <span style={{ fontSize: 12, fontWeight: 600, background: "var(--accent-bg)", color: "var(--accent)", padding: "2px 8px", borderRadius: 20 }}>
                  Present
                </span>
              )}
            </label>
          </div>

          {/* Optional Description */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-ghost"
                style={{
                  background: inst.showDescription ? "var(--accent-bg)" : "",
                  borderColor: inst.showDescription ? "var(--accent)" : "",
                  color: inst.showDescription ? "var(--accent)" : "",
                }}
                onClick={() => onUpdate({ ...inst, showDescription: !inst.showDescription })}
              >
                {inst.showDescription ? <><MinusIcon /> Hide Description</> : <><PlusIcon /> Add Description</>}
              </button>

              {inst.showDescription && (
                <AiGlowButton
                  disabled={!inst.institute || !inst.qualification || !inst.program || inst.suggesting}
                  loading={inst.suggesting}
                  onClick={async () => {
                    const id = getCVId();
                    if (!id) return;
                    onUpdate({ ...inst, suggesting: true });
                    try {
                      const { description } = await suggestDescription(id, {
                        institute: inst.institute,
                        qualification: inst.qualification,
                        program: inst.program,
                      });
                      onUpdate({ ...inst, description, suggesting: false });
                    } catch (err) {
                      onUpdate({ ...inst, suggesting: false });
                    }
                  }}
                >
                  {inst.suggesting ? "Generating…" : "✨ Suggest a FREE AI description"}
                </AiGlowButton>
              )}
            </div>

            {inst.showDescription && (
              <div className="field" style={{ marginTop: 14 }}>
                <label>Description</label>
                <textarea
                  placeholder="Describe your studies, achievements, thesis topic…"
                  value={inst.description}
                  onChange={(e) => set("description", e.target.value)}
                  style={{ width: "100%", minHeight: 160 }}
                />
              </div>
            )}
          </div>

          {/* Optional GPA */}
          <div style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn-ghost"
              style={{
                background: inst.showGpa ? "var(--accent-bg)" : "",
                borderColor: inst.showGpa ? "var(--accent)" : "",
                color: inst.showGpa ? "var(--accent)" : "",
              }}
              onClick={() => onUpdate({ ...inst, showGpa: !inst.showGpa })}
            >
              {inst.showGpa ? <><MinusIcon /> Hide GPA</> : <><PlusIcon /> Add GPA</>}
            </button>
            {inst.showGpa && (
              <div className="field" style={{ marginTop: 14, maxWidth: 200 }}>
                <label>GPA / Score</label>
                <input
                  type="text"
                  placeholder="e.g. 3.8 / 4.0 or 72%"
                  value={inst.gpa}
                  onChange={(e) => set("gpa", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>

          {/* Optional Subjects */}
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              className="btn-ghost"
              style={{
                background: inst.showSubjects ? "var(--accent-bg)" : "",
                borderColor: inst.showSubjects ? "var(--accent)" : "",
                color: inst.showSubjects ? "var(--accent)" : "",
              }}
              onClick={() => onUpdate({ ...inst, showSubjects: !inst.showSubjects })}
            >
              {inst.showSubjects ? <><MinusIcon /> Hide Subjects</> : <><PlusIcon /> Add Subjects &amp; Grades</>}
            </button>

            {inst.showSubjects && (
              <div className="subjects-section" style={{ marginTop: 16 }}>
                {inst.subjects.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 14,
                    background: "var(--surface-2)", borderRadius: "var(--radius-sm)", marginBottom: 10,
                  }}>
                    No subjects yet. Click below to add one.
                  </div>
                ) : (
                  <>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 36px",
                      gap: 8,
                      marginBottom: 8,
                      padding: "0 2px",
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        Subject Name
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        Grade
                      </span>
                      <span />
                    </div>

                    {inst.subjects.map((s) => (
                      <div
                        key={s.id}
                        className="subject-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 120px 36px",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <input
                          type="text"
                          placeholder="e.g. Data Structures"
                          value={s.name}
                          onChange={(e) => updateSubject(s.id, "name", e.target.value)}
                          style={{ width: "100%", minWidth: 0 }}
                        />
                        <input
                          type="text"
                          placeholder="A / B+ / 85"
                          value={s.grade}
                          onChange={(e) => updateSubject(s.id, "grade", e.target.value)}
                          style={{ width: "100%", minWidth: 0 }}
                        />
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => removeSubject(s.id)}
                          style={{ flexShrink: 0 }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </>
                )}
                <button type="button" className="btn-ghost" style={{ marginTop: 4 }} onClick={addSubject}>
                  <PlusIcon /> Add Subject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Education() {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([newInstitute()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addInstitute = () => setInstitutes([...institutes, newInstitute()]);
  const updateInstitute = (id, updated) => setInstitutes(institutes.map((inst) => (inst.id === id ? updated : inst)));
  const removeInstitute = (id) => { if (institutes.length > 1) setInstitutes(institutes.filter((inst) => inst.id !== id)); };

  const handleNext = async () => {
    const id = getCVId();
    if (!id) { setError("Session not found."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = institutes.map(({ id: _id, open, showSubjects, showDescription, showGpa, suggesting, ...rest }) => ({
        ...rest,
        subjects: rest.subjects.map(({ id: _sid, ...s }) => s),
      }));
      await saveEducation(id, payload);
      navigate("/experience");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <StepProgress current={1} />

        <div className="section-header">
          <span className="section-tag">Step 2 of 5</span>
          <h1 className="section-title">Education</h1>
          <p className="section-sub">Add your academic qualifications. You can include multiple institutions.</p>
        </div>

        {institutes.map((inst, i) => (
          <InstituteCard
            key={inst.id}
            inst={inst}
            index={i}
            onUpdate={(updated) => updateInstitute(inst.id, updated)}
            onRemove={() => removeInstitute(inst.id)}
          />
        ))}

        <button type="button" className="btn-ghost" onClick={addInstitute} style={{ marginTop: 4 }}>
          <PlusIcon size={16} /> Add Another Institution
        </button>

        {error && <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 12 }}>{error}</p>}

        <div
          className="form-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/personal-info")}
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
            {saving ? "Saving…" : "Next: Experience"}
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

export default Education;