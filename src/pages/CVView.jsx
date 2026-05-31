// CVView.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, getCV, submitReview } from "../api";
import html2pdf from "html2pdf.js";

// ── Icons ──────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const EmailIcon = () => (
  <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
    <path d="M1 3h11v8H1V3zm0 0l5.5 4L12 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
    <path d="M2 1h3l1.5 3.5-1.5 1c.8 1.5 2 2.7 3.5 3.5l1-1.5L13 9v3a1 1 0 01-1 1C5 12 1 8 1 2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1a4 4 0 014 4c0 3-4 7.5-4 7.5S2.5 8 2.5 5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6.5" cy="5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
    <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4 5.5V9M4 3.5v.5M6.5 9V7a1.5 1.5 0 013 0v2M6.5 5.5V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);
const GithubIcon = () => (
  <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1a5.5 5.5 0 00-1.74 10.72c.28.05.38-.12.38-.26v-.9c-1.53.33-1.85-.74-1.85-.74-.25-.64-.62-.8-.62-.8-.5-.35.04-.34.04-.34.56.04.85.57.85.57.5.85 1.3.6 1.62.46.05-.36.2-.6.36-.74-1.22-.14-2.5-.61-2.5-2.73 0-.6.22-1.1.57-1.48-.06-.14-.25-.7.05-1.46 0 0 .47-.15 1.52.57a5.3 5.3 0 012.76 0c1.06-.72 1.52-.57 1.52-.57.3.76.11 1.32.05 1.46.36.39.57.88.57 1.48 0 2.13-1.3 2.6-2.53 2.73.2.17.37.51.37 1.03v1.52c0 .15.1.32.38.27A5.5 5.5 0 006.5 1z" fill="currentColor" />
  </svg>
);
const StarIcon = ({ filled, half }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27l-4.94 2.43.94-5.49-4-3.9 5.53-.8L10 1.5z"
      fill={filled ? "#f59e0b" : half ? "url(#half)" : "none"}
      stroke={filled || half ? "#f59e0b" : "#d1d5db"}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {half && (
      <defs>
        <linearGradient id="half">
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
    )}
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#d1fae5" stroke="#10b981" strokeWidth="2"/>
    <path d="M14 24l7 7 13-14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────
function formatDate(month, year) {
  if (!month && !year) return "";
  if (!month) return year;
  return `${month.slice(0, 3)} ${year}`;
}
function formatDateRange(exp) {
  const start = formatDate(exp.startMonth, exp.startYear);
  const end = exp.isCurrent ? "Present" : formatDate(exp.endMonth, exp.endYear);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

// ── A4 dimensions at 96 dpi ────────────────────────────────────
const A4_W = 794;
const A4_H = 1123;

// ── Template style definitions ─────────────────────────────────
const TEMPLATE_STYLES = {
  classic: {
    wrap: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: 11,
      lineHeight: 1.6,
      color: "#2d2926",
      background: "#fff",
      padding: "40px 48px",
      width: "100%",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: 22,
      paddingBottom: 18,
      borderBottom: "2.5px solid #1a1714",
    },
    name: {
      fontFamily: "'Georgia', serif",
      fontSize: 26,
      fontWeight: 700,
      color: "#1a1714",
      margin: "0 0 6px",
      letterSpacing: 0.5,
    },
    contactRow: {
      display: "flex", flexWrap: "wrap", justifyContent: "center",
      gap: "5px 18px", fontSize: 10, color: "#4a4540", marginTop: 8,
    },
    sectionHeading: {
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#1a1714",
      borderBottom: "2px solid #1a1714",
      paddingBottom: 5,
      marginBottom: 14,
      marginTop: 0,
      fontFamily: "'Georgia', serif",
    },
    jobTitle: { fontWeight: 700, fontSize: 12, color: "#1a1714" },
    company:  { fontSize: 11, color: "#4a4540", marginTop: 1 },
    dateRange:{ fontSize: 10, color: "#6b6560", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: {
      fontSize: 10,
      background: "#f4f3ec",
      border: "1px solid #e2ddd6",
      borderRadius: 3,
      padding: "3px 9px",
      color: "#2d2926",
    },
    photo: {
      width: 80, height: 80, borderRadius: "50%",
      border: "2px solid #1a1714",
      objectFit: "cover", flexShrink: 0,
    },
  },

  modern: {
    wrap: {
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      fontSize: 11,
      lineHeight: 1.6,
      color: "#1e293b",
      background: "#fff",
      padding: "40px 48px",
      width: "100%",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "left",
      marginBottom: 24,
      paddingBottom: 16,
      borderBottom: "3px solid #2563eb",
    },
    name: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: 28,
      fontWeight: 800,
      color: "#0f172a",
      margin: "0 0 4px",
      letterSpacing: -0.5,
    },
    contactRow: {
      display: "flex", flexWrap: "wrap", justifyContent: "flex-start",
      gap: "5px 18px", fontSize: 10, color: "#475569", marginTop: 8,
    },
    sectionHeading: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#2563eb",
      borderBottom: "1.5px solid #e2e8f0",
      paddingBottom: 5,
      marginBottom: 14,
      marginTop: 0,
    },
    jobTitle: { fontWeight: 700, fontSize: 12, color: "#0f172a" },
    company:  { fontSize: 11, color: "#475569", marginTop: 1 },
    dateRange:{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: {
      fontSize: 10,
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: 4,
      padding: "3px 9px",
      color: "#1e40af",
    },
    photo: {
      width: 80, height: 80, borderRadius: 6,
      border: "2px solid #2563eb",
      objectFit: "cover", flexShrink: 0,
    },
  },

  minimal: {
    wrap: {
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      fontSize: 11,
      lineHeight: 1.7,
      color: "#333",
      background: "#fff",
      padding: "44px 52px",
      width: "100%",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "left",
      marginBottom: 28,
      paddingBottom: 20,
      borderBottom: "1px solid #ccc",
    },
    name: {
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      fontSize: 30,
      fontWeight: 300,
      color: "#111",
      margin: "0 0 6px",
      letterSpacing: 1.5,
    },
    contactRow: {
      display: "flex", flexWrap: "wrap", justifyContent: "flex-start",
      gap: "5px 20px", fontSize: 10, color: "#777", marginTop: 8,
    },
    sectionHeading: {
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "#999",
      borderBottom: "1px solid #e5e5e5",
      paddingBottom: 5,
      marginBottom: 14,
      marginTop: 0,
    },
    jobTitle: { fontWeight: 600, fontSize: 11.5, color: "#111" },
    company:  { fontSize: 11, color: "#666", marginTop: 1 },
    dateRange:{ fontSize: 10, color: "#999", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: {
      fontSize: 10,
      background: "transparent",
      border: "1px solid #ddd",
      borderRadius: 2,
      padding: "2px 8px",
      color: "#555",
    },
    photo: {
      width: 76, height: 76, borderRadius: "50%",
      border: "1px solid #ccc",
      objectFit: "cover", flexShrink: 0,
    },
  },

  executive: {
    wrap: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: 11,
      lineHeight: 1.6,
      color: "#1a1209",
      background: "#fff",
      padding: "40px 48px",
      width: "100%",
      boxSizing: "border-box",
    },
    header: {
      textAlign: "center",
      marginBottom: 22,
      paddingBottom: 16,
      borderBottom: "none",
    },
    name: {
      fontFamily: "'Georgia', serif",
      fontSize: 27,
      fontWeight: 700,
      color: "#0f1f40",
      margin: "0 0 5px",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    contactRow: {
      display: "flex", flexWrap: "wrap", justifyContent: "center",
      gap: "5px 18px", fontSize: 10, color: "#4a4030", marginTop: 8,
    },
    sectionHeading: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: "#0f1f40",
      borderBottom: "none",
      paddingBottom: 0,
      marginBottom: 14,
      marginTop: 0,
      boxShadow: "0 2px 0 #b8960c",
      display: "inline-block",
      paddingRight: 8,
    },
    jobTitle: { fontWeight: 700, fontSize: 12, color: "#0f1f40" },
    company:  { fontSize: 11, color: "#4a4030", marginTop: 1 },
    dateRange:{ fontSize: 10, color: "#6b5a30", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: {
      fontSize: 10,
      background: "#fdfaf2",
      border: "1px solid #d4b854",
      borderRadius: 2,
      padding: "3px 9px",
      color: "#3a2e10",
    },
    photo: {
      width: 82, height: 82, borderRadius: "50%",
      border: "2px solid #b8960c",
      objectFit: "cover", flexShrink: 0,
    },
  },
};

// ── CV Document ────────────────────────────────────────────────
function CVDocument({ cv, template }) {
  const p = cv.personalInfo || {};
  const s = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.classic;
  const isExecutive = template === "executive";
  const isCentred = template === "classic" || template === "executive";
  const hasPhoto = !!cv.photo;

  const headerInner = isCentred ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {hasPhoto && (
        <img src={cv.photo} alt="Profile" style={{ ...s.photo, marginBottom: 14 }} />
      )}
      <h1 style={s.name}>{p.fullName || "Your Name"}</h1>
      {p.jobTitle && (
        <div style={{
          fontSize: 12,
          color: template === "executive" ? "#b8960c" : "#666",
          marginBottom: 4,
          letterSpacing: template === "executive" ? 1 : 0,
        }}>
          {p.jobTitle}
        </div>
      )}
      <div style={s.contactRow}>
        {p.email    && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><EmailIcon /> {p.email}</span>}
        {p.phones?.filter(Boolean).map((ph, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}><PhoneIcon /> {ph}</span>
        ))}
        {p.address  && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><LocationIcon /> {p.address}</span>}
        {p.linkedIn && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><LinkedInIcon /> linkedin.com/in/{p.linkedIn}</span>}
        {p.github   && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GithubIcon /> github.com/{p.github}</span>}
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
      <div style={{ flex: 1 }}>
        <h1 style={s.name}>{p.fullName || "Your Name"}</h1>
        {p.jobTitle && (
          <div style={{
            fontSize: 12,
            color: template === "modern" ? "#2563eb" : "#666",
            fontWeight: template === "modern" ? 700 : 400,
            marginBottom: 4,
          }}>
            {p.jobTitle}
          </div>
        )}
        <div style={s.contactRow}>
          {p.email    && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><EmailIcon /> {p.email}</span>}
          {p.phones?.filter(Boolean).map((ph, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}><PhoneIcon /> {ph}</span>
          ))}
          {p.address  && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><LocationIcon /> {p.address}</span>}
          {p.linkedIn && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><LinkedInIcon /> linkedin.com/in/{p.linkedIn}</span>}
          {p.github   && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GithubIcon /> github.com/{p.github}</span>}
        </div>
      </div>
      {hasPhoto && <img src={cv.photo} alt="Profile" style={s.photo} />}
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        {isExecutive && (
          <div style={{ borderTop: "3px solid #b8960c", borderBottom: "1px solid #b8960c", height: 4, marginBottom: 14 }} />
        )}
        {headerInner}
        {isExecutive && (
          <div style={{ borderTop: "1px solid #b8960c", borderBottom: "3px solid #b8960c", height: 4, marginTop: 14 }} />
        )}
      </div>

      {cv.summary && (
        <section style={{ marginBottom: 22 }}>
          <h2 style={s.sectionHeading}>Professional Summary</h2>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: s.wrap.color }}>{cv.summary}</p>
        </section>
      )}

      {cv.experience?.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <h2 style={s.sectionHeading}>Work Experience</h2>
          {cv.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < cv.experience.length - 1 ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={s.jobTitle}>{exp.position}</div>
                  <div style={s.company}>
                    {exp.company}
                    {exp.employmentType && <span style={{ opacity: 0.7 }}> · {exp.employmentType}</span>}
                    {exp.location && <span style={{ opacity: 0.7 }}> · {exp.location}</span>}
                  </div>
                </div>
                <div style={s.dateRange}>{formatDateRange(exp)}</div>
              </div>
              {exp.description && (
                <div style={{ marginTop: 5, fontSize: 10.5, lineHeight: 1.65, opacity: 0.85 }}>
                  {exp.description.split("\n").map((line, j) => (
                    <div key={j} style={{ marginBottom: 2 }}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {cv.education?.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <h2 style={s.sectionHeading}>Education</h2>
          {cv.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: i < cv.education.length - 1 ? 14 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={s.jobTitle}>
                    {edu.qualification && <span>{edu.qualification}</span>}
                    {edu.qualification && edu.program && <span style={{ fontWeight: 400, opacity: 0.7 }}> — </span>}
                    {edu.program && <span>{edu.program}</span>}
                  </div>
                  <div style={s.company}>{edu.institute}</div>
                </div>
              </div>
              {edu.description && (
                <div style={{ fontSize: 10.5, opacity: 0.75, marginTop: 4 }}>{edu.description}</div>
              )}
              {edu.subjects?.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 10 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", opacity: 0.55, fontWeight: 600, paddingBottom: 3, borderBottom: "1px solid #e5e4e7", width: "70%" }}>Subject</th>
                        <th style={{ textAlign: "left", opacity: 0.55, fontWeight: 600, paddingBottom: 3, borderBottom: "1px solid #e5e4e7" }}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edu.subjects.map((subj, j) => (
                        <tr key={j}>
                          <td style={{ padding: "3px 0", borderBottom: "1px solid #f0ede8" }}>{subj.name}</td>
                          <td style={{ padding: "3px 0", borderBottom: "1px solid #f0ede8", fontWeight: 600 }}>{subj.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {cv.skills?.length > 0 && (
        <section>
          <h2 style={s.sectionHeading}>Skills</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px" }}>
            {cv.skills.map((skill, i) => (
              <span key={i} style={s.skillChip}>{skill}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Single-page A4 scaler ──────────────────────────────────────
function ScaledA4({ cv, template, outerRef, watermarkRef }) {
  const measureRef = useRef();
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  const recalc = useCallback(() => {
    if (!measureRef.current) return;
    const h = measureRef.current.scrollHeight;
    const next = h > A4_H ? A4_H / h : 1;
    setScale(next);
    setReady(true);
  }, []);

  useEffect(() => {
    setReady(false);
    const id = requestAnimationFrame(() => { recalc(); });
    return () => cancelAnimationFrame(id);
  }, [cv, template, recalc]);

  return (
    <div
      ref={outerRef}
      style={{
        position: "relative",
        width: A4_W,
        height: A4_H,
        overflow: "hidden",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <div
        ref={measureRef}
        style={{
          position: "absolute", top: 0, left: 0,
          width: A4_W,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <CVDocument cv={cv} template={template} />
      </div>

      <div
        style={{
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          width: scale < 1 ? `${A4_W / scale}px` : "100%",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <CVDocument cv={cv} template={template} />
      </div>

      <div
        ref={watermarkRef}
        style={{
          position: "absolute", inset: 0,
          pointerEvents: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='260'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' transform='rotate(-35 260 130)' font-family='Georgia%2C serif' font-size='28' font-weight='700' fill='rgba(220%2C38%2C38%2C0.13)' letter-spacing='2'%3EDOWNLOAD FOR WATERMARK-FREE PDF%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "520px 260px",
        }}
      >
        <div style={{
          transform: "rotate(-32deg)",
          textAlign: "center",
          padding: "18px 36px",
          border: "4px solid rgba(220, 38, 38, 0.22)",
          borderRadius: 6,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(1px)",
          userSelect: "none",
        }}>
          <div style={{
            fontFamily: "'Georgia', serif",
            fontSize: 22, fontWeight: 800,
            color: "rgba(185, 28, 28, 0.55)",
            letterSpacing: "0.06em",
            textTransform: "uppercase", lineHeight: 1.3,
          }}>
            Download for
          </div>
          <div style={{
            fontFamily: "'Georgia', serif",
            fontSize: 15, fontWeight: 700,
            color: "rgba(185, 28, 28, 0.45)",
            letterSpacing: "0.12em",
            textTransform: "uppercase", marginTop: 4,
          }}>
            Watermark-Free PDF
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Star Rating Picker ─────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: "flex", gap: 4, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{ lineHeight: 1, transition: "transform 0.1s ease", transform: hovered === n ? "scale(1.2)" : "scale(1)" }}
        >
          <StarIcon filled={n <= display} />
        </span>
      ))}
    </div>
  );
}

// ── Review Form ────────────────────────────────────────────────
function ReviewSection({ cvId }) {
  const [name, setName]       = useState("");
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!rating) { setError("Please select a star rating."); return; }
    if (comment.trim().length < 5) { setError("Please write at least a few words."); return; }

    setSubmitting(true);
    try {
      await submitReview(cvId, {
        name: name.trim() || "Anonymous",
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        maxWidth: 580,
        margin: "32px auto 0",
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "40px 32px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
      }}>
        <CheckCircleIcon />
        <div style={{
          fontFamily: "var(--serif)",
          fontSize: 20,
          fontWeight: 600,
          color: "var(--text-h)",
          marginTop: 16,
          marginBottom: 8,
        }}>
          Thank you for your feedback!
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
          Your review has been saved.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 580,
      margin: "32px auto 0",
      background: "var(--surface)",
      border: "1.5px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "28px 32px",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{
          fontFamily: "var(--serif)",
          fontSize: 17,
          fontWeight: 600,
          color: "var(--text-h)",
          marginBottom: 4,
        }}>
          Leave a Review
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
          How was your experience using the CV builder?
        </p>
      </div>

      {/* Star rating */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-h)", marginBottom: 8 }}>
          Your Rating <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} />
        {rating > 0 && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5 }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-h)", marginBottom: 6 }}>
          Your Name <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          maxLength={60}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "9px 12px",
            fontSize: 14,
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            color: "var(--text-h)",
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
          onBlur={(e)  => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {/* Comment */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-h)", marginBottom: 6 }}>
          Your Review <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with the CV builder…"
          rows={4}
          maxLength={600}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "9px 12px",
            fontSize: 14,
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            color: "var(--text-h)",
            outline: "none",
            fontFamily: "inherit",
            resize: "vertical",
            minHeight: 96,
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
          onBlur={(e)  => e.target.style.borderColor = "var(--border)"}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
          {comment.length} / 600
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 14,
          padding: "9px 12px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "var(--radius-sm)",
          fontSize: 13,
          color: "#b91c1c",
        }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        className="btn-primary"
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {submitting ? (
          <>
            <span style={{
              width: 14, height: 14,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff", borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.6s linear infinite",
            }} />
            Submitting…
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
function CVView() {
  const navigate = useNavigate();
  const cvRef = useRef();
  const watermarkRef = useRef();
  const [cv, setCv]           = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [exporting, setExporting] = useState(false);
  const [template, setTemplate] = useState(
    () => localStorage.getItem("cv_template") || "classic"
  );

  const TEMPLATE_LABELS = {
    classic:   "Classic",
    modern:    "Modern",
    minimal:   "Minimal",
    executive: "Executive",
  };

  useEffect(() => {
    const id = getCVId();
    if (!id) { setError("No CV session found."); setLoading(false); return; }
    getCV(id)
      .then(setCv)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleTemplateChange = (tpl) => {
    setTemplate(tpl);
    localStorage.setItem("cv_template", tpl);
  };

  const handleDownload = async () => {
    if (!cvRef.current) return;
    setExporting(true);
    if (watermarkRef.current) watermarkRef.current.style.display = "none";
    try {
      const name = cv?.personalInfo?.fullName?.replace(/\s+/g, "_") || "CV";
      await html2pdf()
        .set({
          margin: 0,
          filename: `${name}_CV.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2, useCORS: true, letterRendering: true,
            width: A4_W, height: A4_H, windowWidth: A4_W,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(cvRef.current)
        .save();
    } catch (err) {
      console.error(err);
    } finally {
      if (watermarkRef.current) watermarkRef.current.style.display = "flex";
      setExporting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)",
            borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your CV…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "var(--danger)", marginBottom: 20 }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/")}>Start Over</button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100svh", background: "var(--surface-2)", paddingBottom: 60 }}>

      {/* ── Toolbar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--surface)",
        borderBottom: "1.5px solid var(--border)",
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        boxShadow: "var(--shadow-sm)",
      }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 600, color: "var(--text-h)" }}>
            Your CV
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            Ready to export
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* Template switcher */}
          <div style={{
            display: "flex",
            background: "var(--surface-2)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: 3, gap: 2,
          }}>
            {Object.entries(TEMPLATE_LABELS).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTemplateChange(id)}
                style={{
                  fontSize: 12,
                  fontWeight: template === id ? 700 : 400,
                  padding: "5px 12px",
                  borderRadius: 5, border: "none", cursor: "pointer",
                  background: template === id ? "var(--surface)" : "transparent",
                  color: template === id ? "var(--text-h)" : "var(--text-muted)",
                  boxShadow: template === id ? "var(--shadow-sm)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/summary")}
            style={{ fontSize: 13 }}
          >
            <EditIcon /> Edit
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleDownload}
            disabled={exporting}
            style={{ position: "relative" }}
          >
            {exporting ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.6s linear infinite",
                }} />
                Exporting…
              </>
            ) : (
              <><DownloadIcon /> Download PDF</>
            )}
          </button>
        </div>
      </div>

      {/* ── Watermark notice banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
        border: "1px solid #fcd34d",
        borderRadius: 8,
        margin: "20px auto 0",
        maxWidth: 860,
        padding: "10px 18px",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 13, color: "#92400e",
      }}>
        <LockIcon />
        <span>
          <strong>Preview mode</strong> — your CV is watermarked below.{" "}
          Download PDF exports a clean, watermark-free version.
        </span>
      </div>

      {/* ── CV Paper ── */}
      <div style={{ padding: "20px 20px 32px", overflowX: "auto" }}>
        <div style={{
          width: "fit-content",
          margin: "0 auto",
          boxShadow: "0 4px 32px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
          borderRadius: 4,
          overflow: "hidden",
        }}>
          {cv && (
            <ScaledA4
              cv={cv}
              template={template}
              outerRef={cvRef}
              watermarkRef={watermarkRef}
            />
          )}
        </div>
      </div>

      {/* ── Review Section ── */}
      <div style={{ padding: "0 20px 48px" }}>
        {cv && <ReviewSection cvId={cv._id} />}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default CVView;