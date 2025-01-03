export function normalizeReferenceString(referenceString: string) {
  const pattern = /^urn:uuid:([a-fA-F0-9\-]+)$/;
  const match = referenceString.match(pattern);
  if (match) {
    return match[1];
  }

  // Assumes full url
  try {
    const url = new URL(referenceString);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || referenceString;
  } catch (e) {
    return referenceString;
  }
}
