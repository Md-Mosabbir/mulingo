/** Matches seed rows in backend/schema/schema.sql */
export const LANGUAGE_OPTIONS = [
  { id: 1, code: "en", label: "English" },
  { id: 2, code: "es", label: "Spanish" },
  { id: 3, code: "fr", label: "French" },
  { id: 4, code: "de", label: "German" },
  { id: 5, code: "it", label: "Italian" },
  { id: 6, code: "pt", label: "Portuguese" },
  { id: 7, code: "ar", label: "Arabic" },
  { id: 8, code: "zh", label: "Chinese" },
  { id: 9, code: "ja", label: "Japanese" },
  { id: 10, code: "ko", label: "Korean" },
  { id: 11, code: "hi", label: "Hindi" },
];

export function languageLabelById(id) {
  return LANGUAGE_OPTIONS.find((l) => l.id === Number(id))?.label ?? "Unknown";
}

export function languageLabelByCode(code) {
  return LANGUAGE_OPTIONS.find((l) => l.code === code)?.label ?? code ?? "Unknown";
}
