// src/components/AiLimitPopup.jsx

function AiLimitPopup({ onClose, message }) {
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--surface, #1a1a1a)",
            border: "1.5px solid var(--border, #333)",
            borderRadius: "var(--radius, 14px)",
            maxWidth: 380,
            width: "100%",
            padding: "28px 24px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 17, color: "var(--text-h, #fff)" }}>
            Free AI limit reached
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--text-muted, #999)",
            }}
          >
            {message ||
              "You've used up your free AI suggestions for this section. You can still fill it in yourself — it only takes a minute!"}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Got it
          </button>
        </div>
      </div>
    );
  }
  
  export default AiLimitPopup;