// src/api.js  

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export async function createCV() {
  const { id } = await request("POST", "/cv");
  localStorage.setItem("cvId", id);
  return id;
}

export function getCVId() {
  return localStorage.getItem("cvId");
}

export const savePersonal        = (id, data)  => request("PUT", `/cv/${id}/personal`,         data);
export const savePhoto           = (id, photo) => request("PUT", `/cv/${id}/photo`,  { photo });
export const saveEducation       = (id, data)  => request("PUT", `/cv/${id}/education`,         data);
export const saveExperience      = (id, data)  => request("PUT", `/cv/${id}/experience`,        data);
export const saveSkills          = (id, data)  => request("PUT", `/cv/${id}/skills`,            data);
export const saveSummary         = (id, text)  => request("PUT", `/cv/${id}/summary`, { summary: text });
export const getSkillSuggestions = (id)        => request("GET", `/cv/${id}/skill-suggestions`);
export const generateSummary     = (id)        => request("GET", `/cv/${id}/generate-summary`);
export const getCV               = (id)        => request("GET", `/cv/${id}`);
export const submitReview        = (id, data)  => request("POST", `/cv/${id}/reviews`, data);
export const getRecentReviews    = ()          => request("GET", `/cv/reviews/top`);
export const getLatestReviews    = (limit = 3) => request("GET", `/cv/reviews/recent?limit=${limit}`);