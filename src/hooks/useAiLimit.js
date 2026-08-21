// src/hooks/useAiLimit.js
import { useState, useEffect, useCallback } from "react";

/**
 * Tracks how many times the user has clicked an AI-suggestion button
 * on a given page. Persisted in localStorage per-CV so it survives
 * refreshes but doesn't leak across different CV sessions.
 *
 * Usage:
 *   const aiLimit = useAiLimit(cvId, "education", 10);
 *   ...
 *   onClick={() => {
 *     if (!aiLimit.consume()) return; // blocks + shows popup once limit hit
 *     // ...make the AI call
 *   }}
 */
export function useAiLimit(cvId, pageKey, maxClicks) {
  const storageKey = cvId ? `ai_usage_${pageKey}_${cvId}` : null;
  const [count, setCount] = useState(0);
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    const stored = parseInt(localStorage.getItem(storageKey) || "0", 10);
    setCount(Number.isNaN(stored) ? 0 : stored);
  }, [storageKey]);

  const remaining = Math.max(0, maxClicks - count);

  // Call this BEFORE making an AI request.
  // Returns true if the click is allowed, false if the limit was hit
  // (in which case it also triggers the popup).
  const consume = useCallback(() => {
    if (count >= maxClicks) {
      setShowLimitPopup(true);
      return false;
    }
    const next = count + 1;
    setCount(next);
    if (storageKey) localStorage.setItem(storageKey, String(next));
    return true;
  }, [count, maxClicks, storageKey]);

  const closePopup = () => setShowLimitPopup(false);

  return { count, remaining, maxClicks, consume, showLimitPopup, closePopup };
}