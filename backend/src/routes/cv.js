// backend/src/routes/cv.js

import express from "express";
import OpenAI from "openai";
import CV from "../models/CV.js";

const router = express.Router();

// ── Helper ─────────────────────────────────────────────────────
async function findCV(id, res) {
  const cv = await CV.findById(id);
  if (!cv) { res.status(404).json({ error: "CV not found" }); return null; }
  return cv;
}

// POST /api/cv — create blank CV
router.post("/", async (req, res, next) => {
  try {
    const cv = await CV.create({});
    res.status(201).json({ id: cv._id });
  } catch (err) { next(err); }
});

// ── GET /api/cv/reviews/recent ─────────────────────────────────
// IMPORTANT: must be declared BEFORE any /:id routes so Express
// does not try to cast the literal string "reviews" as a MongoDB _id.
router.get("/reviews/recent", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 3, 10);

    const results = await CV.aggregate([
      { $unwind: "$reviews" },
      { $match: { "reviews.rating": { $gte: 4 } } },
      {
        $project: {
          _id: 0,
          id:        { $toString: "$reviews._id" },
          name:      "$reviews.name",
          rating:    "$reviews.rating",
          comment:   "$reviews.comment",
          createdAt: "$reviews.createdAt",
        },
      },
    ]);

    res.json({ reviews: results });
  } catch (err) { next(err); }
});

// ── GET /api/cv/reviews/top ────────────────────────────────────
router.get("/reviews/top", async (req, res, next) => {
  try {
    const results = await CV.aggregate([
      { $unwind: "$reviews" },
      {
        $project: {
          _id: 0,
          id:        { $toString: "$reviews._id" },
          name:      "$reviews.name",
          rating:    "$reviews.rating",
          comment:   "$reviews.comment",
          createdAt: "$reviews.createdAt",
        },
      },
    ]);

    if (results.length === 0) return res.json({ reviews: [] });

    if (results.length <= 9) {
      const sorted = [...results].sort((a, b) => b.rating - a.rating);
      return res.json({ reviews: sorted });
    }

    const payload = results.map(r => ({
      id:      r.id,
      rating:  r.rating,
      comment: r.comment,
    }));

    const prompt = `You are a review curator for a professional CV builder web app.
Given the following user reviews as JSON, return a JSON array of up to 9 IDs
representing the most positive, genuine, and helpful reviews.
Rules:
- EXCLUDE any review with negative, offensive, or unhelpful comments even if the rating is high.
- EXCLUDE reviews that are vague (e.g. "ok", "fine", "good") — prefer specific, authentic praise.
- Return fewer than 9 IDs if not enough reviews pass the quality bar.
- Return ONLY a raw JSON array of ID strings — no markdown, no explanation, nothing else.

Reviews:
${JSON.stringify(payload)}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 256, temperature: 0.3 },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";

    let topIds;
    try {
      topIds = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      topIds = [];
    }

    let topReviews = topIds
      .map(id => results.find(r => r.id === id))
      .filter(Boolean)
      .slice(0, 9);

    if (topReviews.length < 9) {
      topReviews = [...results]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 9);
    }

    res.json({ reviews: topReviews });
  } catch (err) {
    try {
      const fallback = await CV.aggregate([
        { $unwind: "$reviews" },
        { $match: { "reviews.rating": { $gte: 4 } } },
        { $sort: { "reviews.rating": -1, "reviews.createdAt": -1 } },
        { $limit: 9 },
        {
          $project: {
            _id: 0,
            id:        { $toString: "$reviews._id" },
            name:      "$reviews.name",
            rating:    "$reviews.rating",
            comment:   "$reviews.comment",
            createdAt: "$reviews.createdAt",
          },
        },
      ]);
      res.json({ reviews: fallback });
    } catch (fallbackErr) { next(fallbackErr); }
  }
});

// PUT /api/cv/:id/personal
router.put("/:id/personal", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    cv.personalInfo = req.body;
    await cv.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// PUT /api/cv/:id/photo
router.put("/:id/photo", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    cv.photo = req.body.photo || "";
    await cv.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// PUT /api/cv/:id/education
router.put("/:id/education", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    cv.education = req.body;
    await cv.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/cv/:id/suggest-description
router.post("/:id/suggest-description", async (req, res, next) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cv = await findCV(req.params.id, res);
    if (!cv) return;

    const { institute, qualification, program } = req.body;
    if (!institute || !qualification || !program) {
      return res.status(400).json({ error: "Institution, qualification, and program are required." });
    }

    const prompt = `You are a professional CV writer. Write a short description for an education entry on a CV.

Institution: ${institute}
Qualification: ${qualification}
Program / Field of Study: ${program}

Rules:
- Write 2–3 sentences only
- Describe the focus areas, skills gained, or relevant coursework typical of this program
- Be specific and professional
- Return plain text only — no markdown, no headings
- Maximum characters including spaces 300`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 150,
    });

    const description = completion.choices[0].message.content.trim();
    res.json({ description });
  } catch (err) { next(err); }
});

// PUT /api/cv/:id/experience
router.put("/:id/experience", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    cv.experience = req.body;
    await cv.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/cv/:id/suggest-responsibilities
router.post("/:id/suggest-responsibilities", async (req, res, next) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cv = await findCV(req.params.id, res);
    if (!cv) return;

    const { company, position, employmentType } = req.body;
    if (!company || !position) {
      return res.status(400).json({ error: "Company and position are required." });
    }

    const prompt = `You are a professional CV writer. Write roles and responsibilities for a work experience entry on a CV.

Company: ${company}
Position: ${position}
Employment Type: ${employmentType || "Not specified"}

Rules:
- Write 3–5 bullet points
- Each bullet starts with "• " followed by an action verb
- Be specific, achievement-oriented, and professional
- Include realistic responsibilities and impact typical of this role
- Return plain text only — no markdown headings, just the bullet lines separated by newlines
- Maximum characters including spaces 400`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 200,
    });

    const description = completion.choices[0].message.content.trim();
    res.json({ description });
  } catch (err) { next(err); }
});

// PUT /api/cv/:id/projects ← NEW
router.put("/:id/projects", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    cv.projects = req.body;
    await cv.save();
    res.json({ ok: true, total: cv.projects.length });
  } catch (err) { next(err); }
});

router.post("/:id/suggest-project-description", async (req, res, next) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cv = await findCV(req.params.id, res);
    if (!cv) return;

    const { title, projectType, techStack } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Project title is required." });
    }

    const prompt = `You are a professional CV writer. Write a project description for a CV.

Project Title: ${title}
Project Type: ${projectType || "Not specified"}
Tech Stack: ${techStack || "Not specified"}

Rules:
- Write 3–4 bullet points
- Each bullet starts with "• " followed by an action verb
- Be specific, achievement-oriented, and professional
- Mention realistic features, technologies used, and impact/outcomes
- Return plain text only — no markdown headings, just the bullet lines separated by newlines
- Maximum characters including spaces 400`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 200,
    });

    const description = completion.choices[0].message.content.trim();
    res.json({ description });
  } catch (err) { next(err); }
});

// PUT /api/cv/:id/skills
router.put("/:id/skills", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    cv.skills = req.body;
    await cv.save();
    res.json({ ok: true, total: cv.skills.length });
  } catch (err) { next(err); }
});

// GET /api/cv/:id/skill-suggestions
router.get("/:id/skill-suggestions", async (req, res, next) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cv = await findCV(req.params.id, res);
    if (!cv) return;

    const eduLines = (cv.education || [])
      .filter((e) => e.institute || e.program)
      .map((e) => {
        const base = `${e.qualification || ""} in ${e.program || ""} at ${e.institute || ""}`.trim();
        const subs = e.subjects?.length ? `  Subjects: ${e.subjects.map((s) => s.name).join(", ")}` : "";
        return base + (subs ? `\n${subs}` : "");
      }).join("\n");

    const expLines = (cv.experience || [])
      .filter((e) => e.company || e.position)
      .map((e) => {
        const duration = e.isCurrent
          ? `${e.startMonth ?? ""} ${e.startYear ?? ""} – Present`
          : `${e.startMonth ?? ""} ${e.startYear ?? ""} – ${e.endMonth ?? ""} ${e.endYear ?? ""}`;
        const desc = e.description ? `\n  Responsibilities: ${e.description}` : "";
        return `${e.position || "Role"} at ${e.company || "Company"} (${e.employmentType || ""}) | ${duration}${desc}`;
      }).join("\n");

    // Also factor in projects for richer skill suggestions
    const projLines = (cv.projects || [])
      .filter((p) => p.title || p.techStack)
      .map((p) => `${p.title || "Project"}: ${p.techStack || ""}${p.description ? " — " + p.description : ""}`)
      .join("\n");

    if (!eduLines && !expLines && !projLines) return res.json({ suggestions: [] });

    const prompt = `You are a professional CV writer. Based on the candidate's background below, suggest exactly 10 relevant professional skills suitable for their CV.

--- Education ---
${eduLines || "Not provided"}

--- Work Experience ---
${expLines || "Not provided"}

--- Projects ---
${projLines || "Not provided"}

Rules:
- Return ONLY a valid JSON array of 10 short skill strings (1–4 words each).
- No markdown, no explanation, no extra text — just the raw JSON array.
- Include a mix of technical and soft skills relevant to their background.
- If IT related, must return programming languages and tools.

Example output format: ["JavaScript", "Team Leadership", "Data Analysis"]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 200,
    });

    const raw = completion.choices[0].message.content.trim();
    let suggestions;
    try {
      suggestions = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      const matches = raw.match(/"([^"]+)"/g) || [];
      suggestions = matches.map((m) => m.replace(/"/g, "")).slice(0, 10);
    }

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (err) { next(err); }
});

// GET /api/cv/:id/generate-summary
router.get("/:id/generate-summary", async (req, res, next) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cv = await findCV(req.params.id, res);
    if (!cv) return;

    const name = cv.personalInfo?.fullName || "The candidate";

    const eduLines = (cv.education || [])
      .filter((e) => e.institute || e.program)
      .map((e) => `${e.qualification || ""} in ${e.program || ""} at ${e.institute || ""}`.trim())
      .join("; ");

    const expLines = (cv.experience || [])
      .filter((e) => e.company || e.position)
      .map((e) => {
        const duration = e.isCurrent ? "currently" : `${e.startYear || ""}${e.endYear ? "–" + e.endYear : ""}`;
        return `${e.position || "Role"} at ${e.company || "Company"} (${duration})${e.description ? ": " + e.description : ""}`;
      }).join("; ");

    const projLines = (cv.projects || [])
      .filter((p) => p.title)
      .map((p) => `${p.title}${p.techStack ? " (" + p.techStack + ")" : ""}`)
      .join(", ");

    const skillsLine = (cv.skills || []).join(", ");

    const prompt = `You are a professional CV writer. Write a compelling professional summary for a CV based on the candidate's details below.

Name: ${name}
Education: ${eduLines || "Not provided"}
Experience: ${expLines || "Not provided"}
Projects: ${projLines || "Not provided"}
Skills: ${skillsLine || "Not provided"}

Rules:
- Write 3–4 sentences only
- Write in third person (e.g. "Alexandra is a...")
- Be specific, confident, and professional
- Highlight their strongest points
- Return plain text only — no markdown, no bullet points, no headings
- Do not start with "I"
- Do not emphasize gender (NO words like he/she/his/her/they/them or any kind of person addressing)
- Maximum characters including spaces 590`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
      max_completion_tokens: 300,
    });

    const summary = completion.choices[0].message.content.trim();
    res.json({ summary });
  } catch (err) { next(err); }
});

// PUT /api/cv/:id/summary
router.put("/:id/summary", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    cv.summary = req.body.summary;
    await cv.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/cv/:id/reviews
router.post("/:id/reviews", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;

    const { name, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }
    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ error: "Please write at least a few words." });
    }

    const review = {
      name: name?.trim() || "Anonymous",
      rating: Number(rating),
      comment: comment.trim(),
    };

    cv.reviews.push(review);
    await cv.save();

    

    res.status(201).json({ ok: true, review: cv.reviews[cv.reviews.length - 1] });
  } catch (err) { next(err); }
});

// GET /api/cv/:id — full document (always last — catch-all for /:id)
router.get("/:id", async (req, res, next) => {
  try {
    const cv = await findCV(req.params.id, res);
    if (!cv) return;
    res.json(cv);
  } catch (err) { next(err); }
});

export default router;