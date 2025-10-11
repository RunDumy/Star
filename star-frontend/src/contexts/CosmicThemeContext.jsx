import { createContext, useContext, useReducer } from 'react';

const CosmicThemeContext = createContext();

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_THEME':
      return { ...state, ...action.payload };
    case 'SET_PRESET':
      return { ...state, ...action.payload };
    case 'RESET_THEME':
      return initialState;
    default:
      return state;
  }
};

const initialState = {
  // Colors
  backgroundColor: '#000011',
  fogColor: '#000033',
  ambientColor: '#ffffff',
  pointLightColor: '#ffffff',
  terrainColor: '#4a4a8a',
  terrainEmissive: '#2a2a5a',

  // Visual Properties
  starDensity: 8000,
  starSize: 6,
  animationSpeed: 1,

  // Lighting
  ambientIntensity: 0.3,
  pointLightIntensity: 0.8,

  // Sky Settings
  skySettings: {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
  },

  // Particles
  particleColors: ['#ff4444', '#87CEEB', '#4361ee', '#8B4513'],
};

export const CosmicThemeProvider = ({ children }) => {
  const [theme, dispatch] = useReducer(themeReducer, initialState);

  const updateTheme = (updates) => {
    dispatch({ type: 'UPDATE_THEME', payload: updates });
  };

  const setPreset = (presetName) => {
    const presets = {
      nebula: {
        backgroundColor: '#110033',
        fogColor: '#330066',
        starDensity: 12000,
        particleColors: ['#ff00ff', '#00ffff', '#ffff00', '#ff0080'],
      },
      galaxy: {
        backgroundColor: '#000022',
        fogColor: '#001144',
        starDensity: 15000,
        animationSpeed: 2,
      },
      aurora: {
        backgroundColor: '#001122',
        fogColor: '#004466',
        ambientColor: '#00ff88',
        particleColors: ['#00ff88', '#0088ff', '#88ff00'],
      }
    };

    dispatch({ type: 'SET_PRESET', payload: presets[presetName] });
  };

  return (
    <CosmicThemeContext.Provider value={{ theme, updateTheme, setPreset }}>
      {children}
    </CosmicThemeContext.Provider>
  );
};

export const useCosmicTheme = () => {
  const context = useContext(CosmicThemeContext);
  if (!context) {
    throw new Error('useCosmicTheme must be used within CosmicThemeProvider');
  }
  return context;
};