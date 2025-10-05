import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CosmicThemeContext = createContext();

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PALETTE':
      return { ...state, palette: action.payload };
    case 'SET_GEOMETRY':
      return { ...state, geometry: action.payload };
    case 'SET_DENSITY':
      return { ...state, density: action.payload };
    case 'LOAD_SAVED_THEME':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const initialTheme = {
  palette: {
    primary: '#4a90e2',
    secondary: '#9b59b6',
    nebula: ['#667eea', '#764ba2'],
    accent: '#f1c40f',
    background: '#0f0f23'
  },
  geometry: {
    planetShape: 'sphere', // 'icosahedron', 'dodecahedron', 'torus', 'asteroid'
    cornerRadius: 'rounded', // 'sharp', 'rounded', 'pill', 'organic'
    uiDensity: 'medium' // 'compact', 'medium', 'spacious'
  },
  density: {
    stars: 5000,
    nebulae: 3,
    particles: 1000
  }
};

export const CosmicThemeProvider = ({ children }) => {
  const [theme, dispatch] = useReducer(themeReducer, initialTheme);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cosmic-theme', JSON.stringify(theme));
  }, [theme]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cosmic-theme');
    if (saved) {
      dispatch({ type: 'LOAD_SAVED_THEME', payload: JSON.parse(saved) });
    }
  }, []);

  const contextValue = useMemo(() => ({ theme, dispatch }), [theme]);

  return (
    <CosmicThemeContext.Provider value={contextValue}>
      {children}
    </CosmicThemeContext.Provider>
  );
};

CosmicThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCosmicTheme = () => {
  const context = useContext(CosmicThemeContext);
  if (!context) {
    throw new Error('useCosmicTheme must be used within CosmicThemeProvider');
  }
  return context;
};