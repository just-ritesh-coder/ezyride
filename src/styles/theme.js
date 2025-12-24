export const theme = {
  colors: {
    background: "#ffffff", // Pure White Canvas
    backgroundAlt: "#f8faf9",

    // User Forced Palette
    palette: {
      tomThumb: "#2b492c",
      surfCrest: "#d2e9d5",
      summerGreen: "#92bbab",
      envy: "#8cae8f"
    },

    section: {
      dark: "#2b492c",    // Tom Thumb
      light: "#d2e9d5",   // Surf Crest
      accent: "#8cae8f",  // Envy
      medium: "#92bbab"   // Summer Green
    },

    surface: "rgba(43, 73, 44, 0.03)",
    surfaceHover: "rgba(43, 73, 44, 0.08)",

    primary: "#2b492c", // Tom Thumb
    primaryGradient: "linear-gradient(135deg, #2b492c 0%, #1a2e1b 100%)",

    accentBright: "#d2e9d5", // Surf Crest

    secondary: "#92bbab", // Summer Green
    secondaryGradient: "linear-gradient(135deg, #92bbab 0%, #2b492c 100%)",

    text: {
      primary: "#2b492c", // Tom Thumb (Dark Text)
      secondary: "#5c7a60",
      inverse: "#ffffff",
      inverseSecondary: "#d2e9d5", // Surf Crest
      accent: "#2b492c",
    },
    success: "#8cae8f", // Envy
    warning: "#FCD34D",
    error: "#F87171",
    glass: {
      light: "rgba(255, 255, 255, 0.05)",
      medium: "rgba(255, 255, 255, 0.03)",
      heavy: "rgba(43, 73, 44, 0.6)",
      border: "rgba(146, 187, 171, 0.3)", // Summer Green tint
      input: "rgba(0, 0, 0, 0.05)",
    }
  },
  shadows: {
    sm: "0 4px 6px -1px rgba(0, 0, 0, 0.15)",
    md: "0 10px 30px -5px rgba(0, 0, 0, 0.3)", // Deeper shadow for lift
    lg: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", // Floating effect
    neon: "0 0 20px rgba(146, 187, 171, 0.15), 0 0 40px rgba(146, 187, 171, 0.05)", // Soft Summer Green glow
    glass: "0 8px 32px 0 rgba(0, 0, 0, 0.25)",
  },
  animations: {
    info: "transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    float: `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
        100% { transform: translateY(0px); }
      }
    `,
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `
  },
  borders: {
    radius: {
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      full: "50px"
    }
  }
};
