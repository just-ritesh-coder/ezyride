import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  /* Import Google Font 'Inter' */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  :root {
    --glass-border: 1px solid ${({ theme }) => theme.colors.glass.border};
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    background-image: none; /* Clean white canvas */
      
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    line-height: 1.6;
    text-rendering: optimizeLegibility;
  }

  * {
    box-sizing: border-box;
  }

  /* Custom Scrollbar - Surf Crest Themed */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-radius: 5px;
    border: 2px solid ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 700;
    letter-spacing: -0.02em; /* Modern tight tracking */
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
  }

  button {
    font-family: 'Inter', sans-serif;
    outline: none;
  }
`;
