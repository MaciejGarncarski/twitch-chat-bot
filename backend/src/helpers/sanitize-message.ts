export const sanitizeMessage = (text: string) =>
  text
    .normalize("NFKC")
    .replace(/[\p{M}\p{Cf}]/gu, "")
    .trim();
