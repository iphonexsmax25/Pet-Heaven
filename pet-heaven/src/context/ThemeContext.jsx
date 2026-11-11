import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';

// Theme is exactly "light" or "dark".
// First visit (nothing saved): follow the device once, using prefers-color-scheme. This detected value is NOT saved.
// After the user clicks the toggle, the choice is saved in localStorage under "petHeavenTheme" and always wins
// over the device theme on future visits. The theme is written to <html data-theme="...">.
// index.html sets the same attribute before React renders, to avoid a flash of the wrong colours.
export const THEME_KEY = 'petHeavenTheme';
export const THEME_CHOICES = ['light', 'dark'];
const DARK_QUERY = '(prefers-color-scheme: dark)';
const META_COLORS = { light: '#c93f06', dark: '#17120f' };

const getDeviceTheme = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
    ? 'dark'
    : 'light';

// A saved "light" or "dark" is used first. If nothing valid is saved (or storage is blocked), use the device theme.
const readInitialTheme = () => {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (error) {
    /* storage blocked: fall back to the device theme */
  }
  return getDeviceTheme();
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  // Apply the theme to the page whenever it changes (and on first render)
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META_COLORS[theme]);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!THEME_CHOICES.includes(next)) return;
    setThemeState(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      /* storage blocked: the choice still works until the page is closed */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
