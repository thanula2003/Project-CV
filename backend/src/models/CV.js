// backend/src/models/CV.js

import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  { name: String, grade: String },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institute:     { type: String, trim: true },
    qualification: { type: String, trim: true },
    program:       { type: String, trim: true },
    description:   { type: String, trim: true },
    gpa:           { type: String, trim: true },
    subjects:      [subjectSchema],
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company:        { type: String, trim: true },
    position:       { type: String, trim: true },
    employmentType: { type: String, trim: true },
    location:       { type: String, trim: true },
    startMonth:     { type: String },
    startYear:      { type: String },
    endMonth:       { type: String },
    endYear:        { type: String },
    isCurrent:      { type: Boolean, default: false },
    description:    { type: String, trim: true },
  },
  { _id: false }
);

// ── NEW: Review sub-schema ─────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    name:    { type: String, trim: true, default: "Anonymous" },
    rating:  { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, required: true },
  },
  { timestamps: true }   // adds createdAt / updatedAt per review
);

const cvSchema = new mongoose.Schema(
  {
    personalInfo: {
      fullName:    { type: String, trim: true },
      email:       { type: String, trim: true, lowercase: true },
      dateOfBirth: { type: String },
      address:     { type: String, trim: true },
      phones:      [{ type: String, trim: true }],
      linkedIn:    { type: String, trim: true },
      github:      { type: String, trim: true },
    },
    photo:      { type: String, default: "" },
    education:  [educationSchema],
    experience: [experienceSchema],
    skills:     [{ type: String, trim: true }],
    summary:    { type: String, trim: true },
    reviews:    [reviewSchema],               // ← NEW
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("CV", cvSchema);