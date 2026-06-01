import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, savePersonal, savePhoto } from "../api";

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

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 14V4M7 8l4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 3h12M5 3V2h4v1M2 3l1 9h6l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function PersonalInfo() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    address: "",
    linkedIn: "",
    github: "",
  });
  const [phones, setPhones] = useState([""]);
  const [photo, setPhoto] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addPhone = () => setPhones([...phones, ""]);
  const removePhone = (i) => setPhones(phones.filter((_, idx) => idx !== i));
  const handlePhoneChange = (i, v) => {
    const u = [...phones];
    u[i] = v;
    setPhones(u);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Photo must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNext = async () => {
    const id = getCVId();
    if (!id) { setError("Session not found. Please go back to the home page."); return; }
    setSaving(true);
    setError("");
    try {
      await Promise.all([
        savePersonal(id, { ...form, phones: phones.filter(Boolean) }),
        savePhoto(id, photo),
      ]);
      navigate("/education");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <StepProgress current={0} />

        <div className="section-header">
          <span className="section-tag">Step 1 of 5</span>
          <h1 className="section-title">Personal Information</h1>
          <p className="section-sub">
            Your basic contact details — these will appear at the top of your CV.
          </p>
        </div>

        <div className="card">
          {/* ── Photo Upload (optional) ── */}
          <div style={{ marginBottom: 4 }}>
            <label style={{
              fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
              textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 14,
            }}>
              Profile Photo{" "}
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                optional
              </span>
            </label>

            {/* Photo row — wraps on very small screens */}
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}>
              {/* Preview or placeholder */}
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "2px dashed var(--border)",
                background: "var(--surface-2)",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {photo ? (
                  <img
                    src={photo}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "var(--text-muted)", opacity: 0.5 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoSelect}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: "9px 16px", fontSize: 13, width: "100%", justifyContent: "center" }}
                >
                  <UploadIcon />
                  {photo ? "Change Photo" : "Upload Photo"}
                </button>

                {photo && (
                  <button
                    type="button"
                    className="btn-icon danger"
                    onClick={handleRemovePhoto}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "9px 14px",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <TrashIcon /> Remove
                  </button>
                )}

                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  JPG or PNG · max 2 MB
                </p>
              </div>
            </div>

            {/* ATS Warning */}
            <div style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(234, 179, 8, 0.08)",
              border: "1px solid rgba(234, 179, 8, 0.35)",
              display: "flex",
              gap: 9,
              alignItems: "flex-start",
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="#ca8a04" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8 6v3.5" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.6" fill="#ca8a04" />
              </svg>
              <p style={{ fontSize: 11, color: "#92660a", margin: 0, lineHeight: 1.6 }}>
                <strong style={{ fontWeight: 700 }}>ATS Notice:</strong>{" "}
                Many companies use Applicant Tracking Systems (ATS) to screen CVs automatically.
                ATS software cannot read images and may misparse your CV if a photo is included.
                Skip the photo if you are applying to a company that uses ATS screening.
              </p>
            </div>
          </div>

          <div className="section-divider" />

          {/* Core fields — single column on mobile via CSS class, no override needed */}
          <div
            className="form-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            }}
          >
            <div className="field">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Alexandra Chen"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label>Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setField("dateOfBirth", e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div className="field">
              <label>Address</label>
              <input
                type="text"
                placeholder="City, Country"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>
          </div>

          <div className="section-divider" />

          {/* Phone Numbers */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              gap: 10,
              flexWrap: "wrap",
            }}>
              <label style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                textTransform: "uppercase", color: "var(--text-muted)",
              }}>
                Phone Numbers
              </label>
              <button
                type="button"
                className="btn-secondary"
                onClick={addPhone}
                style={{ padding: "7px 14px", fontSize: 13, whiteSpace: "nowrap" }}
              >
                <PlusIcon /> Add Phone
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {phones.map((phone, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="field" style={{ flex: 1, gap: 0 }}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(i, e.target.value)}
                      placeholder={`Phone ${i + 1}`}
                      autoComplete="tel"
                      style={{ width: "100%" }}
                    />
                  </div>
                  {phones.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={() => removePhone(i)}
                      title="Remove"
                      style={{ flexShrink: 0 }}
                    >
                      <MinusIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="section-divider" />

          {/* Online Profiles */}
          <div>
            <label style={{
              fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
              textTransform: "uppercase", color: "var(--text-muted)",
              display: "block", marginBottom: 14,
            }}>
              Online Profiles
            </label>
            <div
              className="form-grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              }}
            >
              <div className="field">
                <label>LinkedIn</label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                    fontSize: 12, color: "var(--text-muted)", pointerEvents: "none", userSelect: "none",
                    whiteSpace: "nowrap", overflow: "hidden",
                    maxWidth: "38%",
                  }}>
                    linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    placeholder="yourname"
                    value={form.linkedIn}
                    onChange={(e) => setField("linkedIn", e.target.value)}
                    style={{ paddingLeft: "clamp(90px, 38%, 114px)" }}
                  />
                </div>
              </div>
              <div className="field">
                <label>
                  GitHub{" "}
                  <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>
                    optional
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                    fontSize: 12, color: "var(--text-muted)", pointerEvents: "none", userSelect: "none",
                    whiteSpace: "nowrap", overflow: "hidden",
                    maxWidth: "30%",
                  }}>
                    github.com/
                  </span>
                  <input
                    type="text"
                    placeholder="yourname"
                    value={form.github}
                    onChange={(e) => setField("github", e.target.value)}
                    style={{ paddingLeft: "clamp(72px, 30%, 84px)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 12 }}>{error}</p>
        )}

        {/* Actions — stack on mobile */}
        <div
          className="form-actions"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-muted)", flex: "1 1 auto" }}>
            Fields marked * are required
          </span>
          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            disabled={saving}
            style={{ width: "100%", maxWidth: 220, justifyContent: "center" }}
          >
            {saving ? "Saving…" : "Next: Education"}
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

export default PersonalInfo;