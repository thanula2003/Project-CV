// src/api.js

const API_HOST =
  window.location.hostname === "localhost" ? "localhost" : "https://atsfriendlycvbuilder.com";

const BASE = `http://${API_HOST}:3001/api`;

const WEB3FORMS_ACCESS_KEY = "c826b807-641f-4051-86dd-8de1bd1694f7";

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

export const savePersonal             = (id, data)  => request("PUT", `/cv/${id}/personal`,   data);
export const savePhoto                = (id, photo) => request("PUT", `/cv/${id}/photo`,       { photo });
export const saveEducation            = (id, data)  => request("PUT", `/cv/${id}/education`,   data);
export const suggestDescription       = (id, data) => request("POST", `/cv/${id}/suggest-description`, data);
export const saveExperience           = (id, data)  => request("PUT", `/cv/${id}/experience`,  data);
export const suggestResponsibilities  = (id, data) => request("POST", `/cv/${id}/suggest-responsibilities`, data);
export const saveProjects             = (id, data)  => request("PUT", `/cv/${id}/projects`,    data);
export const suggestProjectDescription = (id, data) => request("POST", `/cv/${id}/suggest-project-description`, data);
export const saveSkills               = (id, data)  => request("PUT", `/cv/${id}/skills`,      data);
export const saveSummary              = (id, text)  => request("PUT", `/cv/${id}/summary`,     { summary: text });
export const getSkillSuggestions      = (id)        => request("GET", `/cv/${id}/skill-suggestions`);
export const generateSummary          = (id)        => request("GET", `/cv/${id}/generate-summary`);
export const getCV                    = (id)        => request("GET", `/cv/${id}`);

export async function submitReview(id, data) {
  const result = await request("POST", `/cv/${id}/reviews`, data);

  // Send email notification via Web3Forms (client-side, fire-and-forget)
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New CV Review (${data.rating}★) from ${data.name || "Anonymous"}`,
      from_name: "CV Builder",
      cv_id: id,
      name: data.name || "Anonymous",
      rating: `${data.rating} / 5`,
      comment: data.comment,
    }),
  }).catch((e) => console.error("Web3Forms email failed:", e));

  return result;
}

export const getRecentReviews         = ()          => request("GET", `/cv/reviews/top`);
export const getLatestReviews         = (limit = 3) => request("GET", `/cv/reviews/recent?limit=${limit}`);
export const getPayhereHash = (orderId, amount, currency) =>
  request("POST", `/payment/payhere/hash`, { order_id: orderId, amount, currency });