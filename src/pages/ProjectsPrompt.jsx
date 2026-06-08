// src/pages/ProjectsPrompt.jsx

import { useNavigate } from "react-router-dom";

const STEPS = [
  { label: "Personal" },
  { label: "Education" },
  { label: "Experience" },
  { label: "Projects" },
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
            <div className={`step-dot ${status}`}>{status === "done" ? "✓" : i + 1}</div>
            <span className={`step-label ${status}`}>{step.label}</span>
            {i < STEPS.length - 1 && <div className={`step-line ${status === "done" ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

function ProjectsPrompt() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <StepProgress current={3} />

        <div className="section-header">
          <span className="section-tag">Step 4 of 6</span>
          <h1 className="section-title">Do you have Projects?</h1>
          <p className="section-sub">
            Projects — personal, academic, or open-source — can significantly strengthen your CV.
            Include them if they're relevant to the roles you're applying for.
          </p>
        </div>

        {/* Illustration / icon */}
        <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 32px" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "var(--accent-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="32" height="24" rx="4" stroke="var(--accent)" strokeWidth="2" />
              <path d="M4 14h32" stroke="var(--accent)" strokeWidth="2" />
              <circle cx="9" cy="11" r="1.5" fill="var(--accent)" />
              <circle cx="14" cy="11" r="1.5" fill="var(--accent)" />
              <circle cx="19" cy="11" r="1.5" fill="var(--accent)" />
              <path d="M12 22l4 4 8-8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Choice cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {/* YES */}
          <button
            type="button"
            onClick={() => navigate("/projects")}
            style={{
              background: "var(--surface)",
              border: "2px solid var(--border)",
              borderRadius: 14,
              padding: "28px 20px",
              cursor: "pointer",
              textAlign: "center",
              transition: "border-color 0.18s, box-shadow 0.18s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 4px var(--accent-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "var(--accent-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M5 13h16M13 5v16" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-h)", marginBottom: 4 }}>
                Yes, add projects
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45 }}>
                I have personal, academic, or open-source projects to showcase
              </div>
            </div>
          </button>

          {/* NO */}
          <button
            type="button"
            onClick={() => navigate("/skills")}
            style={{
              background: "var(--surface)",
              border: "2px solid var(--border)",
              borderRadius: 14,
              padding: "28px 20px",
              cursor: "pointer",
              textAlign: "center",
              transition: "border-color 0.18s, box-shadow 0.18s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--text-muted)";
              e.currentTarget.style.boxShadow = "0 0 0 4px var(--surface-raised, #f5f5f5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "var(--surface-alt, #f0f0f0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M6 13h14" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-h)", marginBottom: 4 }}>
                No, skip this
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45 }}>
                I'll go straight to Skills — projects aren't relevant for me right now
              </div>
            </div>
          </button>
        </div>

        {/* Back button */}
        <div style={{ display: "flex" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/experience")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectsPrompt;