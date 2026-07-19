// CVView.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCVId, getCV, submitReview, getPayhereHash } from "../api";
import html2pdf from "html2pdf.js";

// ── Icons ──────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
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
const StarIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27l-4.94 2.43.94-5.49-4-3.9 5.53-.8L10 1.5z"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#d1d5db"}
      strokeWidth="1.4" strokeLinejoin="round"
    />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#d1fae5" stroke="#10b981" strokeWidth="2"/>
    <path d="M14 24l7 7 13-14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <path d="M3 5.5l4.5 4.5L12 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Policy Content ─────────────────────────────────────────────
const POLICY_CONTENT = {
  refund: {
    title: "Refund Policy",
    body: `Thank you for using our AI-Assisted CV Generator. This Refund Policy explains how refunds are handled for the watermark-free PDF download service.

Nature of the Service

The payment unlocks a one-time, watermark-free PDF export of the CV you have created. This is a digital product delivered instantly upon successful payment.

Refund Eligibility

Because this is a digital product delivered immediately after payment, refunds are generally not available once the watermark-free PDF has been successfully generated and downloaded.

However, we will provide a full refund if:

- Your payment was completed successfully but the watermark-free PDF download failed to generate or deliver due to a technical error on our end.
- You were charged more than once for the same download due to a duplicate transaction or system error.
- You were incorrectly charged due to a pricing or currency conversion error.

Non-Refundable Cases

Refunds will not be issued for:

- Dissatisfaction with the CV content, formatting, or template you personally selected and edited.
- Change of mind after a successful download.
- Errors in the information you entered into the CV builder.

How to Request a Refund

If you believe you are eligible for a refund, please contact our support team within 7 days of the transaction, providing your payment reference number and a description of the issue.

Processing Time

Approved refunds will be processed back to your original payment method within 7-14 business days, depending on your bank or card issuer's processing times.

Contact Us

thanula2019@gmail.com
+94 78 3736 983

R.T.M.S.Rajapaksha
Udagama, Baranadana road, Mawathagama, Sri Lanka
`,
  },
  privacy: {
    title: "Privacy Policy",
    body: `This Privacy Policy explains how the AI-Assisted CV Generator collects, uses, and protects your personal information.

Information We Collect

When you use our CV builder, we may collect:

- Personal details you enter into the CV form, such as your name, contact information, education, work experience, skills, and a profile photo (if uploaded).
- Payment information processed during checkout, such as transaction reference numbers. We do not store full card details — these are handled securely by our payment gateway, PayHere.
- Technical information such as your IP address and approximate location, used to determine the correct currency (USD or LKR) for pricing.
- Optional review information, such as your name, star rating, and comments, if you choose to leave a review.

How We Use Your Information

We use the information you provide to:

- Generate your CV document and AI-suggested content (such as skill suggestions and professional summaries).
- Process your payment and deliver the watermark-free PDF.
- Display your currency-appropriate price based on your approximate location.
- Display ratings and reviews (your name and comments) to other users, if you submit a review.
- Improve our service based on aggregated usage and feedback.

Data Storage

Your CV data is stored securely in our database for the duration needed to generate your document. We do not sell, rent, or trade your personal information to third parties.

Third-Party Services

We use the following third-party services, which may process limited data as part of their function:

- PayHere — for secure payment processing.
- AI service providers — to generate skill suggestions and summary text based on the information you provide.
- IP geolocation services — to determine your currency for pricing purposes.

Each of these providers has its own privacy practices governing the data they process.

Cookies

We may not use any local storage on your device for any purpose. This information are processed in your device and closed after the CV generation.

Data Security

We take reasonable technical measures to protect your information. However, no method of electronic storage or transmission is completely secure, and we cannot guarantee absolute security.

Your Rights

You may request the deletion of your CV data and any associated information by contacting us. Reviews submitted publicly may be subject to separate handling as outlined at the time of submission.

Changes to This Policy

We may update this Privacy Policy from time to time. Continued use of the service after changes are posted constitutes acceptance of the revised policy.

Contact Us

thanula2019@gmail.com
+94 78 3736 983

R.T.M.S.Rajapaksha
Udagama, Baranadana road, Mawathagama, Sri Lanka`,
  },
  terms: {
    title: "Terms & Conditions",
    body: `Welcome to the AI-Assisted CV Generator. By using this website and its services, you agree to the following Terms & Conditions. Please read them carefully.

Use of the Service

- This service allows you to create a CV using guided forms and AI-assisted suggestions for skills and professional summaries.
- You must provide accurate information for the CV content you submit. We are not responsible for inaccuracies in the information you choose to enter.
- You may not use this service for unlawful purposes, including submitting false credentials intended to deceive employers.

AI-Generated Content

- Skill suggestions and summary text generated by AI tools are provided as drafting assistance only. You are responsible for reviewing, editing, and verifying the accuracy of any AI-generated content before using it in your CV.
- We do not guarantee that AI-generated content is free of errors or perfectly suited to your circumstances.

Pricing and Payments

- A one-time fee of Rs. 100 (or the equivalent in your local currency, calculated using real-time exchange rates for users outside Sri Lanka) is charged to download a watermark-free PDF of your CV.
- Prices displayed are determined automatically based on your approximate location at the time of payment.
- Payments are processed securely through PayHere. By making a payment, you authorize the charge of the displayed amount to your chosen payment method.
- We reserve the right to change pricing at any time. Changes will not affect payments already completed.

Free Preview

- A watermarked preview of your CV is available free of charge. The watermark-free PDF download requires the one-time payment described above.

Reviews

- If you choose to submit a review, you agree that your name (or "Anonymous" if left blank), star rating, and comment may be displayed publicly on our website.
- We reserve the right to moderate, remove, or decline to display reviews that are abusive, spam, or otherwise inappropriate.

Intellectual Property

- The CV content you create belongs to you. The design, templates, layout, and underlying software of this service belong to us and may not be copied, reproduced, or redistributed without permission.

Limitation of Liability

- This service is provided "as is" without warranties of any kind. We do not guarantee employment outcomes, interview results, or that your CV will be accepted by any particular employer or Applicant Tracking System (ATS).
- To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of this service.

Changes to These Terms

- We may update these Terms & Conditions at any time. Continued use of the service after changes are posted constitutes acceptance of the revised terms.

Contact Us

thanula2019@gmail.com
+94 78 3736 983

R.T.M.S.Rajapaksha
Udagama, Baranadana road, Mawathagama, Sri Lanka`,
  },
};

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
function formatProjectDateRange(proj) {
  const start = formatDate(proj.startMonth, proj.startYear);
  const end = proj.isOngoing ? "Ongoing" : formatDate(proj.endMonth, proj.endYear);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

// ── Geolocation-based price helper ──────────────────────────────
async function getLocalPrice() {
  try {
    // const geo = await fetch("https://ipapi.co/json/").then((r) => r.json());
    const geo = { country_code: "USA", currency: "USD" };
    const countryCode = geo?.country_code;
    const localCurrency = geo?.currency; 

    
    if (countryCode === "LK") {
      return { display: "Rs. 100.00" };
    }

    const fx = await fetch("https://open.er-api.com/v6/latest/LKR").then((r) => r.json());

    // Convert to the visitor's local currency if we have a rate for it
    if (localCurrency && fx?.rates?.[localCurrency]) {
      const converted = (100 * fx.rates[localCurrency]).toFixed(2);
      return { display: `${converted} ${localCurrency}` };
    }

    // Fallback: convert to USD if local currency rate isn't available
    const usdRate = fx?.rates?.USD || 0.003;
    const usdAmount = (100 * usdRate).toFixed(2);
    return { display: `$${usdAmount}` };
  } catch {
    // Final fallback if geolocation or FX lookup fails entirely
    return { display: "Rs. 100.00" };
  }
}

// async function getLocalPrice() {
//   return { display: "$0.30", amount: 0.3, currency: "USD" };
// }

const A4_W = 794;
const A4_H = 1123;

// ── Template style definitions ─────────────────────────────────
const TEMPLATE_STYLES = {
  classic: {
    wrap: { fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 11, lineHeight: 1.6, color: "#2d2926", background: "#fff", padding: "40px 48px", width: "100%", boxSizing: "border-box" },
    header: { textAlign: "center", marginBottom: 22, paddingBottom: 18, borderBottom: "2.5px solid #1a1714" },
    name: { fontFamily: "'Georgia', serif", fontSize: 26, fontWeight: 700, color: "#1a1714", margin: "0 0 6px", letterSpacing: 0.5 },
    contactRow: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px 18px", fontSize: 10, color: "#4a4540", marginTop: 8 },
    sectionHeading: { fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1714", borderBottom: "2px solid #1a1714", paddingBottom: 5, marginBottom: 14, marginTop: 0, fontFamily: "'Georgia', serif" },
    jobTitle: { fontWeight: 700, fontSize: 12, color: "#1a1714" },
    company: { fontSize: 11, color: "#4a4540", marginTop: 1 },
    dateRange: { fontSize: 10, color: "#6b6560", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: { fontSize: 10, background: "#f4f3ec", border: "1px solid #e2ddd6", borderRadius: 3, padding: "3px 9px", color: "#2d2926" },
    photo: { width: 80, height: 80, borderRadius: "50%", border: "2px solid #1a1714", objectFit: "cover", flexShrink: 0 },
  },
  modern: {
    wrap: { fontFamily: "'Helvetica Neue', 'Arial', sans-serif", fontSize: 11, lineHeight: 1.6, color: "#1e293b", background: "#fff", padding: "40px 48px", width: "100%", boxSizing: "border-box" },
    header: { textAlign: "left", marginBottom: 24, paddingBottom: 16, borderBottom: "3px solid #2563eb" },
    name: { fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: -0.5 },
    contactRow: { display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: "5px 18px", fontSize: 10, color: "#475569", marginTop: 8 },
    sectionHeading: { fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 5, marginBottom: 14, marginTop: 0 },
    jobTitle: { fontWeight: 700, fontSize: 12, color: "#0f172a" },
    company: { fontSize: 11, color: "#475569", marginTop: 1 },
    dateRange: { fontSize: 10, color: "#64748b", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: { fontSize: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "3px 9px", color: "#1e40af" },
    photo: { width: 80, height: 80, borderRadius: 6, border: "2px solid #2563eb", objectFit: "cover", flexShrink: 0 },
  },
  minimal: {
    wrap: { fontFamily: "'Helvetica Neue', 'Arial', sans-serif", fontSize: 11, lineHeight: 1.7, color: "#333", background: "#fff", padding: "44px 52px", width: "100%", boxSizing: "border-box" },
    header: { textAlign: "left", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #ccc" },
    name: { fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 30, fontWeight: 300, color: "#111", margin: "0 0 6px", letterSpacing: 1.5 },
    contactRow: { display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: "5px 20px", fontSize: 10, color: "#777", marginTop: 8 },
    sectionHeading: { fontSize: 9, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #e5e5e5", paddingBottom: 5, marginBottom: 14, marginTop: 0 },
    jobTitle: { fontWeight: 600, fontSize: 11.5, color: "#111" },
    company: { fontSize: 11, color: "#666", marginTop: 1 },
    dateRange: { fontSize: 10, color: "#999", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: { fontSize: 10, background: "transparent", border: "1px solid #ddd", borderRadius: 2, padding: "2px 8px", color: "#555" },
    photo: { width: 76, height: 76, borderRadius: "50%", border: "1px solid #ccc", objectFit: "cover", flexShrink: 0 },
  },
  executive: {
    wrap: { fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 11, lineHeight: 1.6, color: "#1a1209", background: "#fff", padding: "40px 48px", width: "100%", boxSizing: "border-box" },
    header: { textAlign: "center", marginBottom: 22, paddingBottom: 16, borderBottom: "none" },
    name: { fontFamily: "'Georgia', serif", fontSize: 27, fontWeight: 700, color: "#0f1f40", margin: "0 0 5px", letterSpacing: 2, textTransform: "uppercase" },
    contactRow: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px 18px", fontSize: 10, color: "#4a4030", marginTop: 8 },
    sectionHeading: { fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#0f1f40", borderBottom: "none", paddingBottom: 0, marginBottom: 14, marginTop: 0, boxShadow: "0 2px 0 #b8960c", display: "inline-block", paddingRight: 8 },
    jobTitle: { fontWeight: 700, fontSize: 12, color: "#0f1f40" },
    company: { fontSize: 11, color: "#4a4030", marginTop: 1 },
    dateRange: { fontSize: 10, color: "#6b5a30", whiteSpace: "nowrap", marginLeft: 12, marginTop: 2 },
    skillChip: { fontSize: 10, background: "#fdfaf2", border: "1px solid #d4b854", borderRadius: 2, padding: "3px 9px", color: "#3a2e10" },
    photo: { width: 82, height: 82, borderRadius: "50%", border: "2px solid #b8960c", objectFit: "cover", flexShrink: 0 },
  },
};

const TEMPLATE_META = {
  classic:   { label: "Classic",   accent: "#1a1714", badge: "Most Popular" },
  modern:    { label: "Modern",    accent: "#2563eb", badge: "ATS Friendly" },
  minimal:   { label: "Minimal",   accent: "#555",    badge: null },
  executive: { label: "Executive", accent: "#b8960c", badge: "Premium" },
};

const PAGE_MODE_META = {
  auto:   { label: "Multi-page for large CVs",  desc: "Content flows across pages",  icon: "∞" },
  "1page": { label: "1 Page",      desc: "Scaled to fit one A4 sheet",   icon: "1" },
};

// ── CV Document ────────────────────────────────────────────────
function CVDocument({ cv, template }) {
  const p = cv.personalInfo || {};
  const s = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.classic;
  const isExecutive = template === "executive";
  const isCentred = template === "classic" || template === "executive";
  const hasPhoto = !!cv.photo;

  const contactItems = [
    p.email    && <span key="email"    style={{ display: "flex", alignItems: "center", gap: 4 }}><EmailIcon />{p.email}</span>,
    ...(p.phones?.filter(Boolean).map((ph, i) => <span key={`ph${i}`} style={{ display: "flex", alignItems: "center", gap: 4 }}><PhoneIcon />{ph}</span>) || []),
    p.address  && <span key="addr"     style={{ display: "flex", alignItems: "center", gap: 4 }}><LocationIcon />{p.address}</span>,
    p.linkedIn && <span key="li"       style={{ display: "flex", alignItems: "center", gap: 4 }}><LinkedInIcon />linkedin.com/in/{p.linkedIn}</span>,
    p.github   && <span key="gh"       style={{ display: "flex", alignItems: "center", gap: 4 }}><GithubIcon />github.com/{p.github}</span>,
  ].filter(Boolean);

  const headerInner = isCentred ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {hasPhoto && <img src={cv.photo} alt="Profile" style={{ ...s.photo, marginBottom: 14 }} />}
      <h1 style={s.name}>{p.fullName || "Your Name"}</h1>
      {p.jobTitle && <div style={{ fontSize: 12, color: template === "executive" ? "#b8960c" : "#666", marginBottom: 4, letterSpacing: template === "executive" ? 1 : 0 }}>{p.jobTitle}</div>}
      <div style={s.contactRow}>{contactItems}</div>
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
      <div style={{ flex: 1 }}>
        <h1 style={s.name}>{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <div style={{ fontSize: 12, color: template === "modern" ? "#2563eb" : "#666", fontWeight: template === "modern" ? 700 : 400, marginBottom: 4 }}>{p.jobTitle}</div>}
        <div style={s.contactRow}>{contactItems}</div>
      </div>
      {hasPhoto && <img src={cv.photo} alt="Profile" style={s.photo} />}
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        {isExecutive && <div style={{ borderTop: "3px solid #b8960c", borderBottom: "1px solid #b8960c", height: 4, marginBottom: 14 }} />}
        {headerInner}
        {isExecutive && <div style={{ borderTop: "1px solid #b8960c", borderBottom: "3px solid #b8960c", height: 4, marginTop: 14 }} />}
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
                  <div style={s.company}>{exp.company}{exp.employmentType && <span style={{ opacity: 0.7 }}> · {exp.employmentType}</span>}{exp.location && <span style={{ opacity: 0.7 }}> · {exp.location}</span>}</div>
                </div>
                <div style={s.dateRange}>{formatDateRange(exp)}</div>
              </div>
              {exp.description && (
                <div style={{ marginTop: 5, fontSize: 10.5, lineHeight: 1.65, opacity: 0.85 }}>
                  {exp.description.split("\n").map((line, j) => <div key={j} style={{ marginBottom: 2 }}>{line}</div>)}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
      {cv.projects?.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <h2 style={s.sectionHeading}>Projects</h2>
          {cv.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: i < cv.projects.length - 1 ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.jobTitle}>{proj.title}</div>
                  <div style={s.company}>
                    {proj.projectType && <span>{proj.projectType}</span>}
                    {proj.projectType && proj.techStack && <span style={{ opacity: 0.6 }}> · </span>}
                    {proj.techStack && <span style={{ opacity: 0.75 }}>{proj.techStack}</span>}
                  </div>
                </div>
                {formatProjectDateRange(proj) && (
                  <div style={s.dateRange}>{formatProjectDateRange(proj)}</div>
                )}
              </div>
              {(proj.liveUrl || proj.repoUrl) && (
                <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: "3px 14px", fontSize: 9.5, opacity: 0.7 }}>
                  {proj.liveUrl && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                        <path d="M6 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 2h4m0 0v4m0-4L5.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {proj.liveUrl}
                    </span>
                  )}
                  {proj.repoUrl && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <svg width="9" height="9" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1a5.5 5.5 0 00-1.74 10.72c.28.05.38-.12.38-.26v-.9c-1.53.33-1.85-.74-1.85-.74-.25-.64-.62-.8-.62-.8-.5-.35.04-.34.04-.34.56.04.85.57.85.57.5.85 1.3.6 1.62.46.05-.36.2-.6.36-.74-1.22-.14-2.5-.61-2.5-2.73 0-.6.22-1.1.57-1.48-.06-.14-.25-.7.05-1.46 0 0 .47-.15 1.52.57a5.3 5.3 0 012.76 0c1.06-.72 1.52-.57 1.52-.57.3.76.11 1.32.05 1.46.36.39.57.88.57 1.48 0 2.13-1.3 2.6-2.53 2.73.2.17.37.51.37 1.03v1.52c0 .15.1.32.38.27A5.5 5.5 0 006.5 1z" fill="currentColor" />
                      </svg>
                      {proj.repoUrl}
                    </span>
                  )}
                </div>
              )}
              {proj.description && (
                <div style={{ marginTop: 5, fontSize: 10.5, lineHeight: 1.65, opacity: 0.85 }}>
                  {proj.description.split("\n").map((line, j) => <div key={j} style={{ marginBottom: 2 }}>{line}</div>)}
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
                {formatDateRange(edu) && (
                  <div style={s.dateRange}>{formatDateRange(edu)}</div>
                )}
              </div>
              {edu.description && <div style={{ fontSize: 10.5, opacity: 0.75, marginTop: 4 }}>{edu.description}</div>}
              {edu.gpa && <div style={{ fontSize: 10.5, color: s.wrap.color, opacity: 0.75, marginTop: 2 }}>GPA: <span style={{ fontWeight: 600, opacity: 1 }}>{edu.gpa}</span></div>}
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
            {cv.skills.map((skill, i) => <span key={i} style={s.skillChip}>{skill}</span>)}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Scaled A4 ─────────────────────────────────────────────────
function ScaledA4({ cv, template, outerRef, watermarkRef }) {
  const containerRef = useRef();
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const [containerWidth, setContainerWidth] = useState(A4_W);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setReady(false);
    const id = requestAnimationFrame(() => {
      const scaleW = containerWidth < A4_W ? containerWidth / A4_W : 1;
      setScale(scaleW);

      if (outerRef.current) {
        setNaturalHeight(outerRef.current.scrollHeight);
      }

      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [cv, template, containerWidth]);

  // How many px of empty space the scale transform leaves below the content
  const excessHeight = naturalHeight > 0 ? naturalHeight * (1 - scale) : 0;
  const scaledWidth  = A4_W * scale;

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <div style={{ position: "relative" }}>
        <div
          ref={outerRef}
          style={{
            position: "relative",          // ← stays relative so html2pdf sees it
            width: A4_W,
            background: "#fff",
            opacity: ready ? 1 : 0,
            transition: "opacity 0.2s ease",
            transformOrigin: "top left",
            transform: `scale(${scale})`,
            // Pull left: reclaim the rightward overflow
            marginRight: `${-(A4_W - scaledWidth)}px`,
            // Pull up: reclaim the downward overflow left by the scale shrink
            marginBottom: ready && excessHeight > 0 ? `-${excessHeight}px` : 0,
          }}
        >
          <CVDocument cv={cv} template={template} />

          {/* Watermark */}
          <div
            ref={watermarkRef}
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='260'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' transform='rotate(-35 260 130)' font-family='Georgia%2C serif' font-size='28' font-weight='700' fill='rgba(220%2C38%2C38%2C0.13)' letter-spacing='2'%3EDOWNLOAD FOR WATERMARK-FREE PDF%3C/text%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat", backgroundSize: "520px 260px",
            }}
          >
            <div style={{ transform: "rotate(-32deg)", textAlign: "center", padding: "18px 36px", border: "4px solid rgba(220,38,38,0.22)", borderRadius: 6, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(1px)", userSelect: "none" }}>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 800, color: "rgba(185,28,28,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.3 }}>Download for</div>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 15, fontWeight: 700, color: "rgba(185,28,28,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>Watermark-Free PDF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page Mode Picker (reusable) ────────────────────────────────
function PageModePicker({ pageMode, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Object.entries(PAGE_MODE_META).map(([id, meta]) => {
        const active = pageMode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-sm)",
              background: active ? "var(--accent-bg)" : "var(--surface-2)",
              cursor: "pointer",
              padding: "9px 8px 8px",
              textAlign: "center",
              transition: "all 0.15s ease",
              outline: "none",
              position: "relative",
            }}
          >
            {/* Page count badge */}
            <div style={{
              width: 26, height: 26,
              borderRadius: 6,
              background: active ? "var(--accent)" : "var(--border)",
              color: active ? "#fff" : "var(--text-muted)",
              fontWeight: 700,
              fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 5px",
              transition: "all 0.15s",
            }}>
              {meta.icon}
            </div>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: active ? "var(--accent)" : "var(--text-h)" }}>
              {meta.label}
            </span>
            <span style={{ display: "block", fontSize: 10, color: "var(--text-muted)", marginTop: 1, lineHeight: 1.3 }}>
              {meta.desc}
            </span>
            {/* Active checkmark */}
            {active && (
              <div style={{
                position: "absolute", top: 6, right: 6,
                width: 14, height: 14, borderRadius: "50%",
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Page mode hint ─────────────────────────────────────────────
function PageModeHint({ pageMode }) {
  if (pageMode === "auto") return (
    <div style={{ display: "flex", gap: 7, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 10 }}>
      <span style={{ flexShrink: 0 }}>📄</span>
      <span>Content flows naturally across as many pages as needed.</span>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 7, padding: "8px 10px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--radius-sm)", fontSize: 11, color: "#92400e", lineHeight: 1.5, marginTop: 10 }}>
      <span style={{ flexShrink: 0 }}>⚠️</span>
      <span><strong>1-page mode</strong> shrinks content to fit one A4 sheet. Best for concise CVs — if heavily scaled down, consider <em>Multi-page</em> instead.</span>
    </div>
  );
}

// ── Star Picker ────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: "flex", gap: 2, cursor: "pointer" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(n)}
          style={{ lineHeight: 1, transition: "transform 0.1s", transform: hovered === n ? "scale(1.25)" : "scale(1)" }}>
          <StarIcon filled={n <= display} />
        </span>
      ))}
    </div>
  );
}

// ── Review Form ────────────────────────────────────────────────
function ReviewForm({ cvId }) {
  const [name, setName]       = useState("");
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!rating) { setError("Please select a star rating."); return; }
    if (comment.trim().length < 5) { setError("Please write a few words."); return; }
    setSubmitting(true);
    try {
      await submitReview(cvId, { name: name.trim() || "Anonymous", rating, comment: comment.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "9px 12px", fontSize: 13,
    border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)",
    background: "var(--surface-2)", color: "var(--text-h)",
    outline: "none", fontFamily: "inherit", transition: "border-color 0.15s",
  };

  if (submitted) return (
    <div style={{ textAlign: "center", padding: "28px 16px" }}>
      <CheckCircleIcon />
      <div style={{ fontWeight: 600, color: "var(--text-h)", marginTop: 14, fontSize: 15 }}>Thanks for your feedback!</div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "6px 0 0" }}>Your review has been saved.</p>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
          Rating <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} />
        {rating > 0 && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5 }}>{["","Poor","Fair","Good","Very Good","Excellent"][rating]}</div>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Name <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)", opacity: 0.7 }}>(optional)</span>
        </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonymous" maxLength={60} style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e)  => (e.target.style.borderColor = "var(--border)")} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Review <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience…" rows={4} maxLength={600}
          style={{ ...inputStyle, resize: "vertical", minHeight: 88 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e)  => (e.target.style.borderColor = "var(--border)")} />
        <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{comment.length}/600</div>
      </div>

      {error && <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", fontSize: 13, color: "#b91c1c" }}>{error}</div>}

      <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
        {submitting ? (
          <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Submitting…</>
        ) : "Submit Review"}
      </button>
    </div>
  );
}

// ── Price Modal ────────────────────────────────────────────────
function PriceModal({ onConfirm, onClose, processing, onOpenPolicy, price }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.15s ease both",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          width: "100%", maxWidth: 360,
          padding: "28px 24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          animation: "fadeUp 0.2s ease both",
          textAlign: "center",
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--accent-bg)", color: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px", fontSize: 22,
        }}>
          <DownloadIcon />
        </div>

        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "var(--text-h)" }}>
          Pay to Download Your CV
        </h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Unlock a clean, watermark-free PDF.
        </p>

        <div style={{
          fontSize: 32, fontWeight: 800, color: "var(--text-h)",
          marginBottom: 20,
        }}>
          {price ? price.display : (
            <span style={{ fontSize: 16, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <span style={{ width: 14, height: 14, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
              Calculating price…
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            disabled={processing || !price}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {processing ? (
              <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />Processing…</>
            ) : "Pay Now"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={processing}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Cancel
          </button>
        </div>

        <div style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
          fontSize: 11,
          color: "var(--text-muted)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 10px",
        }}>
          <button type="button" onClick={() => onOpenPolicy("refund")} style={linkBtnStyle}>Refund Policy</button>
          <span>·</span>
          <button type="button" onClick={() => onOpenPolicy("privacy")} style={linkBtnStyle}>Privacy Policy</button>
          <span>·</span>
          <button type="button" onClick={() => onOpenPolicy("terms")} style={linkBtnStyle}>Terms & Conditions</button>
        </div>
      </div>
    </div>
  );
}

const linkBtnStyle = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--text-muted)",
  fontSize: 11,
  textDecoration: "underline",
  cursor: "pointer",
  fontFamily: "inherit",
};

// ── Policy Modal ────────────────────────────────────────────────
function PolicyModal({ policyKey, onClose }) {
  const policy = POLICY_CONTENT[policyKey];
  if (!policy) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.15s ease both",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          width: "100%", maxWidth: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          animation: "fadeUp 0.2s ease both",
        }}
      >
        <div style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-h)" }}>
            {policy.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: 20, lineHeight: 1,
              padding: 4, display: "flex",
            }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{
          padding: "18px 22px",
          overflowY: "auto",
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--text-h)",
          whiteSpace: "pre-line",
        }}>
          {policy.body}
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
function CVView() {
  const navigate = useNavigate();
  const cvRef      = useRef();
  const watermarkRef = useRef();
  const [cv, setCv]             = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [exporting, setExporting] = useState(false);
  const [template, setTemplate] = useState(() => localStorage.getItem("cv_template") || "classic");
  const [pageMode, setPageMode] = useState(() => localStorage.getItem("cv_page_mode") || "auto");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null); // "refund" | "privacy" | "terms" | null
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const id = getCVId();
    if (!id) { setError("No CV session found."); setLoading(false); return; }
    getCV(id).then(setCv).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 860);

useEffect(() => {
  const mq = window.matchMedia("(max-width: 860px)");
  const handler = (e) => setIsMobile(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, []);

  // Fetch geolocation-based price once when the price modal is first opened
  useEffect(() => {
    if (showPriceModal && !price) {
      getLocalPrice().then(setPrice);
    }
  }, [showPriceModal, price]);

  const handleTemplateChange = (tpl) => { setTemplate(tpl); localStorage.setItem("cv_template", tpl); };
  const handlePageModeChange = (mode) => { setPageMode(mode); localStorage.setItem("cv_page_mode", mode); };

  const handleDownload = async () => {
    if (!cvRef.current) return;
    setExporting(true);
    if (watermarkRef.current) watermarkRef.current.style.display = "none";

    const el = cvRef.current;
    const name = cv?.personalInfo?.fullName?.replace(/\s+/g, "_") || "CV";

    // Reset any preview transform so html2canvas sees the element at true A4_W.
    // NOTE: marginBottom must be reset here too — on mobile, ScaledA4 applies a
    // large *negative* marginBottom to compensate for the CSS scale-down used
    // in the on-screen preview (mobile screens are narrower than A4_W, so the
    // preview is shrunk and the leftover empty space below it is pulled up
    // with a negative margin). If we only reset `transform` and forget
    // `marginBottom`, the element pops back to full natural height while the
    // huge negative margin from the shrunk preview is still applied — which
    // visually crushes/clips everything below roughly where the scaled
    // preview used to end. That's exactly the "content missing below Work
    // Experience" bug on phones. On desktop this was invisible because
    // scale is usually 1 there, so marginBottom was already 0.
    const prev = {
      transform: el.style.transform,
      transformOrigin: el.style.transformOrigin,
      opacity: el.style.opacity,
      marginRight: el.style.marginRight,
      marginBottom: el.style.marginBottom,
    };
    el.style.transform       = "none";
    el.style.transformOrigin = "top left";
    el.style.opacity         = "1";
    el.style.marginRight     = "0";
    el.style.marginBottom    = "0";

    try {
      if (pageMode === "1page") {
        const naturalH = el.scrollHeight;
        const fitScale = naturalH > A4_H ? A4_H / naturalH : 1;
        const scaledH  = Math.round(naturalH * fitScale);

        await html2pdf()
          .set({
            margin: [0, 0, 0, 0],
            filename: `${name}_CV.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true,
              width: A4_W,
              windowWidth: A4_W,
              onclone: (_doc, clonedEl) => {
                // Apply the shrink transform so the canvas captures scaled content
                clonedEl.style.transform       = `scale(${fitScale})`;
                clonedEl.style.transformOrigin = "top left";
                clonedEl.style.width           = `${A4_W}px`;
                // Collapse the extra whitespace the scale leaves behind
                clonedEl.style.marginBottom    = `-${naturalH * (1 - fitScale)}px`;
              },
            },
            jsPDF: {
              unit: "px",
              // Page is exactly as wide as A4 and as tall as the scaled content
              format: [A4_W, scaledH],
              orientation: "portrait",
            },
            pagebreak: { mode: [] },
          })
          .from(el)
          .save();

      } else {
        // ── Multi-page PDF (unchanged) ─────────────────────────
        const pageStyle = document.createElement("style");
        pageStyle.id = "__cv-page-style__";
        pageStyle.textContent = "@page { margin: 18mm 0 18mm; }";
        document.head.appendChild(pageStyle);

        await html2pdf()
          .set({
            margin: [18, 0, 18, 0],
            filename: `${name}_CV.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true,
              width: A4_W,
              windowWidth: A4_W,
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
            },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
          })
          .from(el)
          .save();

        document.getElementById("__cv-page-style__")?.remove();
      }
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      // Always restore the element's visual state
      el.style.transform       = prev.transform;
      el.style.transformOrigin = prev.transformOrigin;
      el.style.opacity         = prev.opacity;
      el.style.marginRight     = prev.marginRight;
      el.style.marginBottom    = prev.marginBottom;
      if (watermarkRef.current) watermarkRef.current.style.display = "";
      setExporting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your CV…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p style={{ color: "var(--danger)", marginBottom: 20 }}>{error}</p>
        <button className="btn-primary" onClick={() => navigate("/")}>Start Over</button>
      </div>
    </div>
  );

  const currentMeta = TEMPLATE_META[template];

  // ── Layout ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100svh", background: "var(--surface-2)" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        /* ── Desktop two-panel ── */
        .cvview-layout {
          display: flex;
          min-height: 100svh;
        }

        /* Left sidebar */
        .cvview-sidebar {
          width: 300px;
          flex-shrink: 0;
          background: var(--surface);
          border-right: 1.5px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100svh;
          overflow-y: auto;
        }

        /* Right canvas */
        .cvview-canvas {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background:
            radial-gradient(ellipse at 60% 0%, rgba(var(--accent-rgb, 99,102,241),0.06) 0%, transparent 60%),
            var(--surface-2);
          padding: 40px 32px 60px;
        }

        .cv-paper-shadow {
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.06),
            0 8px 24px rgba(0,0,0,0.10),
            0 32px 64px rgba(0,0,0,0.08);
          border-radius: 3px;
          overflow: hidden;
          animation: fadeUp 0.4s ease both;
          max-width: ${A4_W}px;
          width: 100%;
        }

        /* Template cards grid */
        .template-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .template-btn {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface-2);
          cursor: pointer;
          padding: 10px 10px 8px;
          text-align: left;
          transition: all 0.15s ease;
          position: relative;
          outline: none;
        }
        .template-btn:hover { border-color: var(--border-focus); background: var(--surface); }
        .template-btn.active { border-color: var(--accent); background: var(--accent-bg); }

        .template-btn-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          margin-bottom: 6px;
          flex-shrink: 0;
        }
        .template-btn-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-h);
          display: block;
        }
        .template-btn-badge {
          font-size: 10px;
          color: var(--text-muted);
          display: block;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .template-check {
          position: absolute;
          top: 8px; right: 8px;
          width: 16px; height: 16px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .template-btn.active .template-check { opacity: 1; }

        /* Sidebar section separator */
        .sidebar-section {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-section:last-child { border-bottom: none; }

        .sidebar-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
          display: block;
        }

        /* Review collapsible */
        .review-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: var(--text-h);
        }

        /* Watermark notice pill */
        .watermark-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 12px;
          color: #92400e;
          margin-bottom: 20px;
          animation: fadeUp 0.4s 0.1s ease both;
        }

        /* ─── Mobile layout ─── */
        @media (max-width: 860px) {
          .cvview-layout { flex-direction: column; }
          .cvview-sidebar { display: none; }
          .cvview-canvas {
            padding: 0 0 48px;
            background: var(--surface-2);
            align-items: stretch;
          }

          /* Template + page mode strip */
          .mobile-template-strip {
            display: block;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 14px 16px;
          }
          .mobile-template-strip .strip-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 10px;
            display: block;
          }
          .mobile-template-strip .template-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 7px;
          }

          .mobile-cv-area {
            display: block;
            padding: 16px 12px 12px;
          }
          .mobile-cv-area .mobile-watermark-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 20px;
            padding: 4px 10px;
            font-size: 11px;
            color: #92400e;
            margin-bottom: 10px;
          }

          .mobile-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 0 16px 4px;
          }
          .mobile-actions .btn-primary,
          .mobile-actions .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .mobile-notices {
            padding: 12px 16px 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .mobile-review {
            display: block;
            margin: 16px 16px 0;
            background: var(--surface);
            border: 1.5px solid var(--border);
            border-radius: var(--radius);
            overflow: hidden;
          }
          .mobile-review-header {
            padding: 14px 16px;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
          }
          .mobile-review-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-h);
            margin: 0 0 2px;
          }
          .mobile-review-subtitle {
            font-size: 12px;
            color: var(--text-muted);
            margin: 0;
          }
          .mobile-review-body { padding: 16px; }

          .cvview-canvas > .watermark-pill { display: none; }
        }

        @media (max-width: 440px) {
          .mobile-template-strip .template-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="cvview-layout">

        {/* ══ LEFT SIDEBAR (desktop only) ═══════════════════════ */}
        <aside className="cvview-sidebar">

          {/* Brand / title */}
          <div className="sidebar-section" style={{ paddingTop: 22, paddingBottom: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--serif)", color: "var(--text-h)", marginBottom: 2 }}>
              Your CV
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {cv?.personalInfo?.fullName ? `Ready for ${cv.personalInfo.fullName.split(" ")[0]}` : "Ready to export"}
            </div>
          </div>

          {/* Template picker */}
          <div className="sidebar-section">
            <span className="sidebar-label">Template</span>
            <div className="template-grid">
              {Object.entries(TEMPLATE_META).map(([id, meta]) => (
                <button
                  key={id}
                  type="button"
                  className={`template-btn ${template === id ? "active" : ""}`}
                  onClick={() => handleTemplateChange(id)}
                >
                  <div className="template-btn-dot" style={{ background: meta.accent, opacity: template === id ? 1 : 0.5 }} />
                  <span className="template-btn-name">{meta.label}</span>
                  {meta.badge && <span className="template-btn-badge">{meta.badge}</span>}
                  <div className="template-check" style={{ background: meta.accent }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected template accent bar */}
            <div style={{ marginTop: 14, padding: "9px 12px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 3, height: 28, borderRadius: 2, background: currentMeta.accent, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-h)" }}>{currentMeta.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{currentMeta.badge || "Clean & professional"}</div>
              </div>
            </div>
          </div>

          {/* ── Page mode picker (desktop) ── */}
          <div className="sidebar-section">
            <span className="sidebar-label">Page Count</span>
            <PageModePicker pageMode={pageMode} onChange={handlePageModeChange} />
            <PageModeHint pageMode={pageMode} />
          </div>

          {/* Actions */}
          <div className="sidebar-section">
            <span className="sidebar-label">Actions</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button type="button" className="btn-primary" onClick={() => setShowPriceModal(true)} disabled={exporting}
            style={{ width: "100%", justifyContent: "center" }}>
            {exporting ? (
              <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />Exporting…</>
            ) : (
              <><DownloadIcon />Download PDF</>
            )}
          </button>
            </div>
          </div>

          {/* Watermark notice */}
          <div className="sidebar-section">
            <div style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--radius-sm)", fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
              <LockIcon />
              <span><strong>Preview mode</strong> — CV is watermarked. Download exports a clean, watermark-free PDF.</span>
            </div>
          </div>

          

          {/* Review (collapsible) */}
          <div className="sidebar-section" style={{ flex: 1 }}>
            <button className="review-toggle" onClick={() => setReviewOpen((o) => !o)}>
              <span className="sidebar-label" style={{ margin: 0 }}>Leave a Review</span>
              <ChevronIcon open={reviewOpen} />
            </button>
            {reviewOpen && (
              <div style={{ marginTop: 16, animation: "fadeUp 0.2s ease both" }}>
                {cv && <ReviewForm cvId={cv._id} />}
              </div>
            )}
          </div>
        </aside>

        {/* ══ RIGHT CANVAS ══════════════════════════════════════ */}
        <main className="cvview-canvas">

          {/* Desktop watermark pill */}
          <div className="watermark-pill">
            <LockIcon />
            Preview — watermarked
          </div>

          {/* ── MOBILE-ONLY CONTENT ── */}

          {/* 1. Template + page mode strip */}
          <div className="mobile-template-strip">
            <span className="strip-label">Template</span>
            <div className="template-grid">
              {Object.entries(TEMPLATE_META).map(([id, meta]) => (
                <button
                  key={id}
                  type="button"
                  className={`template-btn ${template === id ? "active" : ""}`}
                  onClick={() => handleTemplateChange(id)}
                >
                  <div className="template-btn-dot" style={{ background: meta.accent, opacity: template === id ? 1 : 0.5 }} />
                  <span className="template-btn-name">{meta.label}</span>
                  {meta.badge && <span className="template-btn-badge">{meta.badge}</span>}
                  <div className="template-check" style={{ background: meta.accent }}>
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            {/* Page mode picker — mobile */}
            <div style={{ marginTop: 14 }}>
              <span className="strip-label">Page Count</span>
              <PageModePicker pageMode={pageMode} onChange={handlePageModeChange} />
              <PageModeHint pageMode={pageMode} />
            </div>
          </div>

          {/* 2. CV preview (mobile only — desktop renders its own copy below) */}
          {isMobile && (
            <div className="mobile-cv-area">
              <div className="mobile-watermark-pill">
                <LockIcon />
                Preview — watermarked
              </div>
              <div className="cv-paper-shadow" style={{ width: "100%" }}>
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
          )}

          {/* 3. Action buttons */}
          <div className="mobile-actions">
          <button type="button" className="btn-primary" onClick={() => setShowPriceModal(true)} disabled={exporting}
            style={{ width: "100%", justifyContent: "center" }}>
            {exporting ? (
              <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />Exporting…</>
            ) : (
              <><DownloadIcon />Download PDF</>
            )}
          </button>
          </div>

          {/* 4. Info notices */}
          <div className="mobile-notices">
            <div style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--radius-sm)", fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
              <LockIcon />
              <span><strong>Preview mode</strong> — CV is watermarked. Download exports a clean, watermark-free PDF.</span>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>✅</span>
              <span><strong style={{ color: "var(--text-h)" }}>ATS-safe</strong> — single-column, no images or tables.</span>
            </div>
          </div>

          {/* 5. Leave a Review */}
          <div className="mobile-review">
            <div className="mobile-review-header">
              <p className="mobile-review-title">Leave a Review</p>
              <p className="mobile-review-subtitle">How was your experience building your CV?</p>
            </div>
            <div className="mobile-review-body">
              {cv && <ReviewForm cvId={cv._id} />}
            </div>
          </div>

          {/* ── Desktop CV paper ── */}
          {!isMobile && (
            <div className="cv-paper-shadow desktop-cv-paper" style={{ width: "100%" }}>
              {cv && (
                <ScaledA4
                  cv={cv}
                  template={template}
                  outerRef={cvRef}
                  watermarkRef={watermarkRef}
                />
              )}
            </div>
          )}

        </main>
      </div>

      <style>{`
        @media (min-width: 861px) {
          .mobile-template-strip,
          .mobile-cv-area,
          .mobile-actions,
          .mobile-notices,
          .mobile-review { display: none !important; }
        }
        @media (max-width: 860px) {
          .desktop-cv-paper { display: none !important; }
        }
      `}</style>

{showPriceModal && (
          <PriceModal
            processing={exporting}
            price={price}
            onClose={() => !exporting && setShowPriceModal(false)}
            onOpenPolicy={(key) => setActivePolicy(key)}
            onConfirm={async () => {
              setExporting(true);
              try {
                const orderId = `${cv._id}-${Date.now()}`;
                const currency = "LKR";
                const amount = 100;
            
                const { hash, merchant_id, amount: amountFormatted } = await getPayhereHash(orderId, amount, currency);
            
                const payment = {
                  sandbox: true,
                  merchant_id,
                  return_url: window.location.origin + window.location.pathname,
                  cancel_url: window.location.origin + window.location.pathname,
                  notify_url: "https://your-backend-domain.com/api/payment/payhere/notify",
                  order_id: orderId,
                  items: "CV PDF Download",
                  amount: amountFormatted,
                  currency,
                  hash,
                  first_name: cv?.personalInfo?.fullName?.split(" ")[0] || "Customer",
                  last_name: cv?.personalInfo?.fullName?.split(" ").slice(1).join(" ") || "User",
                  email: cv?.personalInfo?.email || "test@example.com",
                  phone: cv?.personalInfo?.phones?.[0] || "0771234567",
                  address: cv?.personalInfo?.address || "N/A",
                  city: "Colombo",
                  country: "Sri Lanka",
                };
            
                console.log("Payment object:", JSON.stringify(payment, null, 2));
            
                window.payhere.onCompleted = function () {
                  setShowPriceModal(false);
                  handleDownload();
                };
                window.payhere.onDismissed = function () {
                  setExporting(false);
                };
                window.payhere.onError = function (error) {
                  console.error("Payment error:", error);
                  setExporting(false);
                };
            
                window.payhere.startPayment(payment);
              } catch (err) {
                console.error(err);
                setExporting(false);
              }
            }}
          />
        )}

        {activePolicy && (
          <PolicyModal
            policyKey={activePolicy}
            onClose={() => setActivePolicy(null)}
          />
        )}
    </div>
  );
}

export default CVView;