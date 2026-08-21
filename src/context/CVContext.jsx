import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cvFormData";

const defaultData = {
  personalInfo: {
    form: { fullName: "", email: "", dateOfBirth: "", address: "", linkedIn: "", github: "" },
    phones: [""],
    photo: "",
  },
  education: {
    institutes: [],
  },
  experience: {
    entries: [],
  },
  projects: {
    entries: [],
  },
  skills: {
    skills: [],
  },
  summary: {
    summary: "",
  },
};

const CVContext = createContext(null);

export function CVProvider({ children }) {
  const [cvData, setCvData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // merge with defaults so new sections you add later don't crash old saved data
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    } catch {
      return defaultData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    } catch {}
  }, [cvData]);

  // Update a whole section, or pass a function to update based on previous section value
  const updateSection = useCallback((section, value) => {
    setCvData((prev) => ({
      ...prev,
      [section]: typeof value === "function" ? value(prev[section]) : value,
    }));
  }, []);

  const resetCV = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCvData(defaultData);
  }, []);

  return (
    <CVContext.Provider value={{ cvData, updateSection, resetCV }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error("useCV must be used within a CVProvider");
  return ctx;
}

/**
 * Drop-in replacement for useState, backed by CVContext + localStorage.
 * Usage: const [form, setForm] = useCVField("personalInfo", "form");
 * Supports functional updates exactly like useState: setForm(f => ({...f, x: 1}))
 */
export function useCVField(section, field) {
  const { cvData, updateSection } = useCV();
  const value = cvData[section][field];

  const setValue = useCallback(
    (updater) => {
      updateSection(section, (prevSection) => ({
        ...prevSection,
        [field]: typeof updater === "function" ? updater(prevSection[field]) : updater,
      }));
    },
    [section, field, updateSection]
  );

  return [value, setValue];
}