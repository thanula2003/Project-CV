//Home.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createCV, getRecentReviews } from "../api";
import { useCV } from "../context/CVContext";

const ATS_FEATURES = [
  { label: "ATS-Parseable Format" },
  { label: "Easiest Generation Process" },
  { label: "AI Skill Suggestions" },
  { label: "Keyword Optimised" },
];

const STEPS = ["Personal Info", "Education", "Experience", "Skills", "Summary"];

// ── Helpers ────────────────────────────────────────────────────
function StarDisplay({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="13" height="13" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27l-4.94 2.43.94-5.49-4-3.9 5.53-.8L10 1.5z"
            fill={n <= rating ? "#f59e0b" : "none"}
            stroke={n <= rating ? "#f59e0b" : "#d1d5db"}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function getInitials(name) {
  if (!name || name === "Anonymous") return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

const AVATAR_COLORS = [
  { bg: "rgba(200,169,110,0.18)", color: "#a07830" },
  { bg: "rgba(99,183,150,0.18)",  color: "#3d9e72" },
  { bg: "rgba(99,140,183,0.18)",  color: "#3d72a0" },
];

// ── Typewriter hook ────────────────────────────────────────────
function useTypewriter(text, active, speed = 22) {
  const [displayed, setDisplayed] = useState("");
  const frameRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      indexRef.current = 0;
      return;
    }

    indexRef.current = 0;
    setDisplayed("");

    const tick = () => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current < text.length) {
        frameRef.current = setTimeout(tick, speed);
      }
    };

    frameRef.current = setTimeout(tick, speed);
    return () => clearTimeout(frameRef.current);
  }, [text, active, speed]);

  return displayed;
}

// ── Pure presentational review card ───────────────────────────
function ReviewCard({ review, index, isVisible, typing, displayed, nameVisible }) {
  const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.45s ease ${index * 0.12}s, transform 0.45s ease ${index * 0.12}s`,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Quote decoration */}
      <div style={{
        position: "absolute", top: 8, right: 12,
        fontSize: 44, lineHeight: 1,
        color: "var(--accent)", opacity: 0.10,
        fontFamily: "Georgia, serif", userSelect: "none", pointerEvents: "none",
      }}>
        "
      </div>

      {/* Stars */}
      <StarDisplay rating={review.rating} />

      {/* Typed comment */}
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.65,
        color: "var(--text)", fontStyle: "italic", flex: 1, minHeight: 38,
      }}>
        {displayed || <span style={{ opacity: 0 }}>placeholder</span>}
        {typing && displayed.length < review.comment.length && (
          <span style={{
            display: "inline-block", width: 2, height: "1em",
            background: "var(--accent)", marginLeft: 1, verticalAlign: "middle",
            animation: "blink 0.7s step-end infinite",
          }} />
        )}
      </p>

      {/* Author row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        opacity: nameVisible ? 1 : 0,
        transform: nameVisible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: colors.bg, color: colors.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, flexShrink: 0, letterSpacing: 0.3,
        }}>
          {getInitials(review.name)}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-h)" }}>
          {review.name || "Anonymous"}
        </span>
      </div>
    </div>
  );
}

// ── Animated wrapper — handles typing state per card ───────────
function AnimatedReviewCard({ review, index, isVisible }) {
  const [typing, setTyping]           = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const displayed = useTypewriter(review.comment, typing, 20);

  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => {
      setTyping(true);
      setTimeout(() => setNameVisible(true), review.comment.length * 20 + 200);
    }, 200 + index * 320);
    return () => clearTimeout(t);
  }, [isVisible, index, review.comment.length]);

  return (
    <ReviewCard
      review={review}
      index={index}
      isVisible={isVisible}
      typing={typing}
      displayed={displayed}
      nameVisible={nameVisible}
    />
  );
}

// ── Arrow Button ───────────────────────────────────────────────
function ArrowBtn({ dir, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flexShrink: 0,
        width: 36, height: 36,
        borderRadius: "50%",
        border: "1.5px solid var(--border)",
        background: disabled ? "transparent" : "var(--surface)",
        color: disabled ? "var(--text-muted)" : "var(--text-h)",
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.35 : 1,
        transition: "opacity 0.2s, background 0.2s, border-color 0.2s",
        outline: "none",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = "var(--accent)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        {dir === "left"
          ? <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  );
}

// ── Reviews Section ────────────────────────────────────────────
function RecentReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    getRecentReviews()
      .then(({ reviews: r }) => setReviews(r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Update arrow disabled state on scroll
  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [reviews, loading]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (!loading && reviews.length === 0) return null;

  return (
    <div style={{ marginTop: 52, width: "100%" }}>

      {/* Section label */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 18, justifyContent: "center",
      }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap",
        }}>
          What users say
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* Loading shimmer */}
      {loading ? (
        <div style={{
          display: "flex", flexDirection: "row",
          overflowX: "auto", gap: 12,
          scrollbarWidth: "none", msOverflowStyle: "none",
        }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} style={{
              flex: "0 0 260px",
              height: 120, borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--border)",
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.08) 50%, transparent 100%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite",
              }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop: arrow buttons + scrollable row */}
          <div className="reviews-desktop-wrapper">
            <ArrowBtn dir="left"  onClick={() => scroll("left")}  disabled={!canLeft}  />

            <div className="reviews-desktop" ref={scrollRef}>
              {reviews.map((r, i) => (
                <div key={i} style={{
                  flex: reviews.length <= 4 ? "1 1 0" : "0 0 260px",
                  minWidth: 220,
                  maxWidth: reviews.length <= 4 ? "none" : 320,
                }}>
                  <AnimatedReviewCard review={r} index={i} isVisible={visible} />
                </div>
              ))}
            </div>

            <ArrowBtn dir="right" onClick={() => scroll("right")} disabled={!canRight} />
          </div>

          {/* Mobile: horizontal swipe carousel */}
          <div className="reviews-mobile">
            <div style={{
              display: "flex",
              overflowX: "auto",
              gap: 12,
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingBottom: 4,
              paddingLeft: 4,
              marginLeft: -4,
            }}>
              {reviews.map((r, i) => (
                <div
                  key={i}
                  style={{
                    flex: "0 0 82%",
                    maxWidth: 320,
                    scrollSnapAlign: "center",
                  }}
                >
                  <AnimatedReviewCard review={r} index={i} isVisible={visible} />
                </div>
              ))}
            </div>
            <p style={{
              textAlign: "center", fontSize: 11,
              color: "var(--text-muted)", marginTop: 10, letterSpacing: "0.04em",
            }}>
              swipe for more →
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetCV } = useCV();   

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      resetCV();          // ← clear any leftover data from a previous CV session
      await createCV();
      navigate("/personal-info");
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "var(--bg)",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 540, width: "100%" }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--accent-bg)",
          border: "1.5px solid rgba(200,169,110,0.3)",
          borderRadius: 20, padding: "6px 16px",
          fontSize: 12, fontWeight: 600,
          letterSpacing: "0.06em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 28,
        }}>
          ✦ ATS-Optimised CV Builder
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(38px, 8vw, 60px)",
          fontWeight: 700, letterSpacing: "-1.5px",
          lineHeight: 1.1, color: "var(--text-h)",
          margin: "0 0 20px",
        }}>
          CVs That Get
          <br />
          <span style={{ color: "var(--accent)" }}>Past the Bots</span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 17, color: "var(--text)",
          lineHeight: 1.65, marginBottom: 12,
        }}>
          Build a professional CV designed to pass Applicant Tracking Systems
          and land on a real recruiter's desk.
        </p>

        {/* ATS stat callout */}
        <p style={{
          fontSize: 13, color: "var(--text-muted)",
          marginBottom: 32, lineHeight: 1.6,
        }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            75% of CVs
          </span>{" "}
          are filtered out by ATS software before a human ever reads them.
          Ours are built to pass.
        </p>

        {/* Feature pills */}
        <div style={{
          display: "flex", gap: 10, justifyContent: "center",
          flexWrap: "wrap", marginBottom: 36,
        }}>
          {ATS_FEATURES.map(({ label }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "7px 14px",
              fontSize: 12, fontWeight: 600,
              color: "var(--text)", letterSpacing: "0.02em",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#4caf82", display: "inline-block", flexShrink: 0,
              }} />
              {label}
            </div>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 16 }}>
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={loading}
          style={{ padding: "16px 36px", fontSize: 16 }}
        >
          {loading ? "Starting…" : "Create Your CV"}
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3.75 9h10.5M9 4.5L13.5 9 9 13.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Step indicators */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: 24, marginTop: 48, flexWrap: "wrap",
        }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1.5px solid var(--border)",
                background: "var(--surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, color: "var(--text-muted)",
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Reviews — outside the 540px column, spans full page width */}
      <div style={{
        width: "100%",
        maxWidth: 1100,
        padding: "0 20px",
        boxSizing: "border-box",
      }}>
        <RecentReviews />
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        /* Desktop: arrow + scroll wrapper */
        .reviews-desktop-wrapper {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }

        /* Desktop: single horizontal scrollable row */
        .reviews-desktop {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          overflow-x: auto !important;
          gap: 12px !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          padding-bottom: 4px !important;
          flex: 1 !important;
        }
        .reviews-desktop::-webkit-scrollbar { display: none; }

        /* Mobile: hidden by default, shown below 600px */
        .reviews-mobile { display: none !important; }

        @media (max-width: 600px) {
          .reviews-desktop-wrapper { display: none  !important; }
          .reviews-mobile          { display: block !important; }
        }

        /* Hide scrollbar in mobile carousel for WebKit */
        .reviews-mobile div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default Home;