//Education.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, saveEducation } from "../api";

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

function newInstitute() {
  return {
    id: Date.now() + Math.random(),
    institute: "", qualification: "", program: "", description: "",
    gpa: "", showGpa: false,  // ← both
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

  return (
    <div className="institute-card">
      {/* Card header — wraps on very small screens */}
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
          {/* Main fields — single column on narrow screens */}
          <div
            className="form-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}
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

          {/* Optional Description */}
          <div style={{ marginTop: 20 }}>
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
              <div className="field" style={{ marginTop: 14 }}>
                <label>Description</label>
                <textarea
                  placeholder="Describe your studies, achievements, thesis topic…"
                  value={inst.description}
                  onChange={(e) => set("description", e.target.value)}
                  style={{ width: "100%", minHeight: 90 }}
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
                    {/* Column headers — hidden on very small screens, shown via subject-row labels instead */}
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
      const payload = institutes.map(({ id: _id, open, showSubjects, showDescription, showGpa, ...rest }) => ({
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

        {/* Actions — stack on mobile, same pattern as PersonalInfo */}
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