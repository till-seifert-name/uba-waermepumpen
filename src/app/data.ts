import {Sheet} from "./data-grid";

/**
 * WÄRMEPUMPEN TOOL - Data structure
 * 
 * This file contains the basic data structure for the Wärmepumpen tool.
 * It will be expanded with specific data and logic during implementation.
 */

// Basic input fields for the Wärmepumpen tool
export const Waermepumpen_Eingabedaten: Sheet = {
  // Common fields
  A_JN1: "Ja",
  A_JN2: "Nein",
  
  // Input fields (placeholders) - to be expanded
  F_GB1: '', // Gebäudetyp
  F_BJ1: '', // Baujahr
  F_WF1: '', // Wohnfläche in m²
  F_HK1: '', // Aktuelle Heizungsart
  
  // Basic options (minimal set for testing)
  A_GB1: "Einfamilienhaus",
  A_HK1: "Öl",
  A_HK2: "Gas"
};

// Placeholder for recommendations
export const Waermepumpen_Empfehlungen: Sheet = {
  // Basic recommendation placeholders
  "E_WP1": "Empfehlung zu Wärmepumpentyp wird hier angezeigt.",
  "E_EF1": "Empfehlung zur Energieeffizienz wird hier angezeigt."
};

// Placeholder for additional information
export const Waermepumpen_Hinweise: Sheet = {
  // Basic hint placeholders
  'H_W1': 'Hinweis zur Wirtschaftlichkeit wird hier angezeigt.',
  'H_U1': 'Hinweis zur Umsetzung wird hier angezeigt.'
};
