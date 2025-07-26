/**
 * Utility functions for extracting text from Excel-imported cells
 * that contain various prefixes like "PopUp:", "Untertext:", etc.
 */

/**
 * Extracts popup text from strings with "PopUp:" prefix (case-insensitive)
 * @param cellValue - The raw cell content string
 * @returns Popup text or empty string if no popup prefix exists
 */
export function extractPopupText(cellValue: string): string {
  if (!cellValue) return '';

  // Check for Untertext: and PopUp: combination (any order, case-insensitive)
  const combinedMatch = cellValue.match(/^(.*?)(?:untertext|popup):\s*\n(.*?)\n\n(?:popup|untertext):\s*\n(.*)$/is);
  if (combinedMatch) {
    // Determine which part is the popup text
    const firstKeyword = combinedMatch[0].match(/^(.*?)(?:untertext|popup):/is)?.[0].toLowerCase();
    if (firstKeyword?.includes('popup')) {
      return combinedMatch[2].trim();
    } else {
      return combinedMatch[3].trim();
    }
  }

  // Check for standalone PopUp: prefix (case-insensitive)
  const popupMatch = cellValue.match(/^\s*popup:\s*(.*)$/is);
  if (popupMatch) {
    return popupMatch[1].trim();
  }

  // No popup prefix found
  return '';
}

/**
 * Extracts untertext (form help text) from strings with "Untertext:" prefix (case-insensitive)
 * @param cellValue - The raw cell content string
 * @returns Untertext or empty string if no untertext prefix exists
 */
export function extractUntertext(cellValue: string): string {
  if (!cellValue) return '';

  // Check for Untertext: and PopUp: combination (any order, case-insensitive)
  const combinedMatch = cellValue.match(/^(.*?)(?:untertext|popup):\s*\n(.*?)\n\n(?:popup|untertext):\s*\n(.*)$/is);
  if (combinedMatch) {
    // Determine which part is the untertext
    const firstKeyword = combinedMatch[0].match(/^(.*?)(?:untertext|popup):/is)?.[0].toLowerCase();
    if (firstKeyword?.includes('untertext')) {
      return combinedMatch[2].trim();
    } else {
      return combinedMatch[3].trim();
    }
  }

  // Check for standalone Untertext: prefix (case-insensitive)
  const untertextMatch = cellValue.match(/^\s*untertext:\s*(.*)$/is);
  if (untertextMatch) {
    return untertextMatch[1].trim();
  }

  // No untertext prefix found
  return '';
}

/**
 * Helper function to check if a string has popup text
 * @param cellValue - The raw cell content string
 * @returns true if popup text exists, false otherwise
 */
export function hasPopupText(cellValue: string): boolean {
  return extractPopupText(cellValue).length > 0;
}

/**
 * Helper function to check if a string has untertext
 * @param cellValue - The raw cell content string
 * @returns true if untertext exists, false otherwise
 */
export function hasUntertext(cellValue: string): boolean {
  return extractUntertext(cellValue).length > 0;
}

/**
 * Gets help text for popups with fallback to full string if no prefixes exist
 * @param cellValue - The raw cell content string
 * @returns Popup text, or full string if no popup/untertext prefixes exist
 */
export function getPopupTextOrFallback(cellValue: string): string {
  const popupText = extractPopupText(cellValue);
  if (popupText) {
    return popupText;
  }
  
  // If no popup text found but cell has content and no untertext prefix, use full text
  if (cellValue && cellValue.trim() && !cellValue.toLowerCase().includes('untertext:')) {
    return cellValue.trim();
  }
  
  return '';
}

/**
 * Helper function to check if a string has popup text or plain help text
 * @param cellValue - The raw cell content string
 * @returns true if popup text or fallback text exists, false otherwise
 */
export function hasPopupTextOrFallback(cellValue: string): boolean {
  return getPopupTextOrFallback(cellValue).length > 0;
}
