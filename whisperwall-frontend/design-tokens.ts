import crypto from "crypto";

// Calculate deterministic seed
const projectName = "WhisperWall";
const network = "sepolia";
const yearMonth = "202510";
const contractName = "WhisperWall.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seed = crypto.createHash("sha256").update(seedString).digest("hex");

// Parse seed to select design dimensions
const seedNum = parseInt(seed.substring(0, 8), 16);

// Design System: Neumorphism (soft UI with raised/pressed effects)
// Color Scheme: E group (Purple/Deep Purple/Indigo) - Luxury/Mystery
// Typography: Sans-Serif (Inter) - 1.25 scale
// Layout: Sidebar
// Component Style: Small radius (4px) + medium shadow + thin border (1px)
// Animation: Smooth (300ms)

export const designTokens = {
  system: "Neumorphism",
  seed: seed,
  
  colors: {
    light: {
      primary: "#A855F7",        // Purple
      secondary: "#7C3AED",       // Deep Purple
      accent: "#6366F1",          // Indigo
      background: "#F5F5F7",      // Soft gray background for neumorphism
      surface: "#FFFFFF",         // White surface
      surfaceRaised: "#FAFAFA",   // Slightly raised surface
      text: "#1F2937",            // Dark gray text
      textSecondary: "#6B7280",   // Medium gray text
      border: "#E5E7EB",          // Light border
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    dark: {
      primary: "#C084FC",         // Light purple
      secondary: "#A78BFA",       // Light deep purple
      accent: "#818CF8",          // Light indigo
      background: "#1F2937",      // Dark background
      surface: "#374151",         // Dark surface
      surfaceRaised: "#4B5563",   // Raised dark surface
      text: "#F9FAFB",            // Light text
      textSecondary: "#D1D5DB",   // Medium light text
      border: "#4B5563",          // Dark border
      success: "#34D399",
      warning: "#FBBF24",
      error: "#F87171",
    },
  },
  
  typography: {
    fontFamily: {
      sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      mono: ["JetBrains Mono", "Menlo", "Monaco", "Courier New", "monospace"],
    },
    scale: 1.25,
    sizes: {
      xs: "0.75rem",      // 12px
      sm: "0.875rem",     // 14px
      base: "1rem",       // 16px
      lg: "1.25rem",      // 20px
      xl: "1.563rem",     // 25px
      "2xl": "1.953rem",  // 31px
      "3xl": "2.441rem",  // 39px
      "4xl": "3.052rem",  // 49px
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  
  spacing: {
    unit: 8, // Base spacing unit 8px
  },
  
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  
  // Neumorphism-specific shadows
  shadows: {
    neumorphism: {
      light: {
        raised: "6px 6px 12px #d1d1d3, -6px -6px 12px #ffffff",
        pressed: "inset 4px 4px 8px #d1d1d3, inset -4px -4px 8px #ffffff",
        flat: "0 0 0 transparent",
      },
      dark: {
        raised: "6px 6px 12px #0f1419, -6px -6px 12px #2f3a47",
        pressed: "inset 4px 4px 8px #0f1419, inset -4px -4px 8px #2f3a47",
        flat: "0 0 0 transparent",
      },
    },
    standard: {
      sm: "0 1px 2px rgba(0,0,0,0.05)",
      md: "0 4px 6px rgba(0,0,0,0.1)",
      lg: "0 10px 15px rgba(0,0,0,0.15)",
      xl: "0 20px 25px rgba(0,0,0,0.2)",
    },
  },
  
  transitions: {
    duration: {
      fast: "100ms",
      normal: "200ms",
      smooth: "300ms", // Selected: smooth
    },
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  layout: "sidebar", // Sidebar layout mode
  
  density: {
    compact: {
      padding: { 
        sm: "4px 8px", 
        md: "8px 16px", 
        lg: "12px 24px" 
      },
      gap: "8px",
    },
    comfortable: {
      padding: { 
        sm: "8px 16px", 
        md: "16px 24px", 
        lg: "20px 32px" 
      },
      gap: "16px",
    },
  },
  
  breakpoints: {
    mobile: "0px",
    tablet: "768px",
    desktop: "1024px",
  },
};

export type DesignTokens = typeof designTokens;


