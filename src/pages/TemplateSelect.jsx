// TemplateSelect.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TemplateSelect.css";

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

// ── ATS-accurate SVG thumbnails ───────────────────────────────────────────────

function ClassicThumb() {
  return (
    <svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" className="template-thumb">
      <rect x="40" y="14" width="100" height="9" rx="1.5" fill="#1a1714" opacity="0.85" />
      <rect x="30" y="28" width="50" height="4" rx="1" fill="#4a4540" opacity="0.4" />
      <rect x="86" y="28" width="50" height="4" rx="1" fill="#4a4540" opacity="0.4" />
      <rect x="14" y="38" width="152" height="2.5" fill="#1a1714" opacity="0.85" />
      <rect x="14" y="48" width="60" height="4.5" rx="1" fill="#1a1714" opacity="0.6" />
      <rect x="14" y="53" width="152" height="1.5" fill="#1a1714" opacity="0.7" />
      <rect x="14" y="62" width="130" height="3.5" rx="1" fill="#555" opacity="0.22" />
      <rect x="14" y="69" width="110" height="3" rx="1" fill="#555" opacity="0.15" />
      <rect x="14" y="75" width="120" height="3" rx="1" fill="#555" opacity="0.15" />
      <rect x="14" y="86" width="55" height="4.5" rx="1" fill="#1a1714" opacity="0.6" />
      <rect x="14" y="91" width="152" height="1.5" fill="#1a1714" opacity="0.7" />
      <rect x="14" y="100" width="140" height="3.5" rx="1" fill="#555" opacity="0.22" />
      <rect x="14" y="107" width="100" height="3" rx="1" fill="#555" opacity="0.15" />
      <rect x="14" y="118" width="52" height="4.5" rx="1" fill="#1a1714" opacity="0.6" />
      <rect x="14" y="123" width="152" height="1.5" fill="#1a1714" opacity="0.7" />
      <rect x="14" y="132" width="130" height="3" rx="1" fill="#555" opacity="0.18" />
      <rect x="14" y="139" width="115" height="3" rx="1" fill="#555" opacity="0.13" />
      <rect x="14" y="150" width="38" height="4.5" rx="1" fill="#1a1714" opacity="0.6" />
      <rect x="14" y="155" width="152" height="1.5" fill="#1a1714" opacity="0.7" />
      <rect x="14" y="163" width="36" height="12" rx="2" fill="#f4f3ec" stroke="#e2ddd6" strokeWidth="1" />
      <rect x="14" y="163" width="36" height="12" rx="2" fill="#1a1714" opacity="0.06" />
      <rect x="55" y="163" width="44" height="12" rx="2" fill="#f4f3ec" stroke="#e2ddd6" strokeWidth="1" />
      <rect x="55" y="163" width="44" height="12" rx="2" fill="#1a1714" opacity="0.06" />
      <rect x="104" y="163" width="38" height="12" rx="2" fill="#f4f3ec" stroke="#e2ddd6" strokeWidth="1" />
      <rect x="104" y="163" width="38" height="12" rx="2" fill="#1a1714" opacity="0.06" />
    </svg>
  );
}

function ModernThumb() {
  return (
    <svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" className="template-thumb">
      <rect x="14" y="14" width="110" height="11" rx="2" fill="#0f172a" opacity="0.9" />
      <rect x="14" y="30" width="50" height="4" rx="1" fill="#475569" opacity="0.45" />
      <rect x="70" y="30" width="50" height="4" rx="1" fill="#475569" opacity="0.45" />
      <rect x="14" y="40" width="152" height="3" fill="#2563eb" opacity="0.9" />
      <rect x="14" y="50" width="66" height="4" rx="1" fill="#2563eb" opacity="0.8" />
      <rect x="14" y="56" width="152" height="1" fill="#e2e8f0" />
      <rect x="14" y="64" width="125" height="3.5" rx="1" fill="#1e293b" opacity="0.2" />
      <rect x="14" y="70" width="108" height="3" rx="1" fill="#1e293b" opacity="0.13" />
      <rect x="14" y="76" width="118" height="3" rx="1" fill="#1e293b" opacity="0.13" />
      <rect x="14" y="87" width="52" height="4" rx="1" fill="#2563eb" opacity="0.8" />
      <rect x="14" y="93" width="152" height="1" fill="#e2e8f0" />
      <rect x="14" y="101" width="135" height="3.5" rx="1" fill="#1e293b" opacity="0.2" />
      <rect x="14" y="107" width="100" height="3" rx="1" fill="#1e293b" opacity="0.13" />
      <rect x="14" y="118" width="50" height="4" rx="1" fill="#2563eb" opacity="0.8" />
      <rect x="14" y="124" width="152" height="1" fill="#e2e8f0" />
      <rect x="14" y="132" width="128" height="3.5" rx="1" fill="#1e293b" opacity="0.2" />
      <rect x="14" y="138" width="110" height="3" rx="1" fill="#1e293b" opacity="0.13" />
      <rect x="14" y="149" width="38" height="4" rx="1" fill="#2563eb" opacity="0.8" />
      <rect x="14" y="155" width="152" height="1" fill="#e2e8f0" />
      <rect x="14" y="163" width="38" height="12" rx="3" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
      <rect x="57" y="163" width="46" height="12" rx="3" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
      <rect x="108" y="163" width="38" height="12" rx="3" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
    </svg>
  );
}

function MinimalThumb() {
  return (
    <svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" className="template-thumb">
      <rect x="14" y="12" width="118" height="13" rx="2" fill="#111" opacity="0.75" />
      <rect x="14" y="30" width="70" height="4" rx="1" fill="#777" opacity="0.4" />
      <rect x="14" y="38" width="48" height="3.5" rx="1" fill="#777" opacity="0.35" />
      <rect x="68" y="38" width="48" height="3.5" rx="1" fill="#777" opacity="0.35" />
      <rect x="14" y="46" width="152" height="0.8" fill="#ccc" />
      <rect x="14" y="54" width="62" height="3.5" rx="1" fill="#999" opacity="0.8" />
      <rect x="14" y="59" width="152" height="0.8" fill="#e5e5e5" />
      <rect x="14" y="67" width="132" height="3.5" rx="1" fill="#333" opacity="0.18" />
      <rect x="14" y="73" width="112" height="3" rx="1" fill="#333" opacity="0.12" />
      <rect x="14" y="79" width="120" height="3" rx="1" fill="#333" opacity="0.12" />
      <rect x="14" y="90" width="52" height="3.5" rx="1" fill="#999" opacity="0.8" />
      <rect x="14" y="95" width="152" height="0.8" fill="#e5e5e5" />
      <rect x="14" y="103" width="138" height="3.5" rx="1" fill="#333" opacity="0.18" />
      <rect x="14" y="109" width="105" height="3" rx="1" fill="#333" opacity="0.12" />
      <rect x="14" y="120" width="50" height="3.5" rx="1" fill="#999" opacity="0.8" />
      <rect x="14" y="125" width="152" height="0.8" fill="#e5e5e5" />
      <rect x="14" y="133" width="130" height="3.5" rx="1" fill="#333" opacity="0.18" />
      <rect x="14" y="139" width="110" height="3" rx="1" fill="#333" opacity="0.12" />
      <rect x="14" y="150" width="36" height="3.5" rx="1" fill="#999" opacity="0.8" />
      <rect x="14" y="155" width="152" height="0.8" fill="#e5e5e5" />
      <rect x="14" y="163" width="36" height="12" rx="2" fill="none" stroke="#ddd" strokeWidth="1" />
      <rect x="55" y="163" width="46" height="12" rx="2" fill="none" stroke="#ddd" strokeWidth="1" />
      <rect x="106" y="163" width="36" height="12" rx="2" fill="none" stroke="#ddd" strokeWidth="1" />
    </svg>
  );
}

function ExecutiveThumb() {
  return (
    <svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg" className="template-thumb">
      <rect x="14" y="10" width="152" height="2.5" fill="#b8960c" opacity="0.9" />
      <rect x="14" y="14" width="152" height="0.8" fill="#b8960c" opacity="0.5" />
      <rect x="34" y="22" width="112" height="9" rx="1.5" fill="#0f1f40" opacity="0.88" />
      <rect x="55" y="35" width="70" height="4" rx="1" fill="#b8960c" opacity="0.75" />
      <rect x="30" y="43" width="50" height="3.5" rx="1" fill="#4a4030" opacity="0.4" />
      <rect x="86" y="43" width="50" height="3.5" rx="1" fill="#4a4030" opacity="0.4" />
      <rect x="14" y="51" width="152" height="0.8" fill="#b8960c" opacity="0.5" />
      <rect x="14" y="53.5" width="152" height="2.5" fill="#b8960c" opacity="0.9" />
      <rect x="14" y="64" width="70" height="4.5" rx="1" fill="#0f1f40" opacity="0.7" />
      <rect x="14" y="69.5" width="70" height="1.5" fill="#b8960c" opacity="0.7" />
      <rect x="14" y="78" width="130" height="3.5" rx="1" fill="#1a1209" opacity="0.2" />
      <rect x="14" y="84" width="110" height="3" rx="1" fill="#1a1209" opacity="0.14" />
      <rect x="14" y="90" width="122" height="3" rx="1" fill="#1a1209" opacity="0.14" />
      <rect x="14" y="101" width="52" height="4.5" rx="1" fill="#0f1f40" opacity="0.7" />
      <rect x="14" y="106.5" width="52" height="1.5" fill="#b8960c" opacity="0.7" />
      <rect x="14" y="115" width="138" height="3.5" rx="1" fill="#1a1209" opacity="0.2" />
      <rect x="14" y="121" width="105" height="3" rx="1" fill="#1a1209" opacity="0.14" />
      <rect x="14" y="132" width="50" height="4.5" rx="1" fill="#0f1f40" opacity="0.7" />
      <rect x="14" y="137.5" width="50" height="1.5" fill="#b8960c" opacity="0.7" />
      <rect x="14" y="146" width="128" height="3.5" rx="1" fill="#1a1209" opacity="0.2" />
      <rect x="14" y="152" width="108" height="3" rx="1" fill="#1a1209" opacity="0.14" />
      <rect x="14" y="163" width="38" height="4.5" rx="1" fill="#0f1f40" opacity="0.7" />
      <rect x="14" y="168.5" width="38" height="1.5" fill="#b8960c" opacity="0.7" />
      <rect x="14" y="177" width="36" height="12" rx="2" fill="#fdfaf2" stroke="#d4b854" strokeWidth="1" />
      <rect x="55" y="177" width="44" height="12" rx="2" fill="#fdfaf2" stroke="#d4b854" strokeWidth="1" />
      <rect x="104" y="177" width="36" height="12" rx="2" fill="#fdfaf2" stroke="#d4b854" strokeWidth="1" />
      <rect x="14" y="224" width="152" height="0.8" fill="#b8960c" opacity="0.5" />
      <rect x="14" y="226.5" width="152" height="2.5" fill="#b8960c" opacity="0.9" />
    </svg>
  );
}

// ── Template data ─────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    desc: "Centred serif header, bold ruled sections — the gold standard for formal applications.",
    thumb: <ClassicThumb />,
    badge: "Most Popular",
    accent: "#1a1714",
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Left-aligned sans-serif, strong blue accent line — contemporary and clean.",
    thumb: <ModernThumb />,
    badge: "ATS Friendly",
    accent: "#2563eb",
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Thin letterforms, generous whitespace, hairline rules — refined and understated.",
    thumb: <MinimalThumb />,
    accent: "#333",
  },
  {
    id: "executive",
    name: "Executive",
    desc: "Centred uppercase name, gold double-rules — authoritative and distinguished.",
    thumb: <ExecutiveThumb />,
    badge: "Premium Look",
    accent: "#b8960c",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
function TemplateSelect() {
  const navigate = useNavigate();
  const saved = localStorage.getItem("cv_template");
  const [selected, setSelected] = useState(saved || "classic");

  const handleContinue = () => {
    localStorage.setItem("cv_template", selected);
    navigate("/view");
  };

  const selectedTemplate = TEMPLATES.find((t) => t.id === selected);

  return (
    <div className="page-wrapper">
      <div className="page-card ts-card">
        <StepProgress current={5} />

        <div className="section-header">
          <span className="section-tag">Final Step</span>
          <h1 className="section-title">Choose Your Template</h1>
          <p className="section-sub">
            All templates are ATS-friendly — single column, no images or sidebars.
            They differ only in typography, colour and spacing.
          </p>
        </div>

        <div className="ts-grid">
          {TEMPLATES.map((t) => {
            const isSelected = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`ts-card-item ${isSelected ? "ts-selected" : ""}`}
                onClick={() => setSelected(t.id)}
                style={isSelected ? { "--ts-accent": t.accent } : {}}
              >
                {t.badge && (
                  <span
                    className="ts-badge"
                    style={isSelected ? { background: t.accent } : {}}
                  >
                    {t.badge}
                  </span>
                )}

                <div
                  className={`ts-check ${isSelected ? "ts-check--visible" : ""}`}
                  style={{ background: t.accent }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="ts-thumb-wrap">{t.thumb}</div>

                <div className="ts-info">
                  <div className="ts-name">{t.name}</div>
                  <div className="ts-desc">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ATS note */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 16px",
          background: "var(--surface-2)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55,
          marginTop: 4,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
          <span>
            <strong style={{ color: "var(--text-h)" }}>ATS-safe guarantee:</strong> All templates use a
            single-column layout with no photos, tables for layout, or text boxes — so applicant tracking
            systems can parse your CV without errors.
          </span>
        </div>

        {/* Nav actions — stack on mobile */}
        <div
          className="form-actions"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/summary")}
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
            onClick={handleContinue}
            style={{ flex: "1 1 auto", maxWidth: 260, justifyContent: "center" }}
          >
            View CV with {selectedTemplate?.name}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateSelect;