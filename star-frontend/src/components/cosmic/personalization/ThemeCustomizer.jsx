import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, dispatch } = useCosmicTheme();

  const palettePresets = [
    { name: 'Cosmic Ocean', colors: ['#4a90e2', '#667eea', '#764ba2'] },
    { name: 'Nebula Dream', colors: ['#9b59b6', '#e74c3c', '#f1c40f'] },
    { name: 'Deep Space', colors: ['#2c3e50', '#34495e', '#16a085'] },
    { name: 'Solar Flare', colors: ['#e67e22', '#d35400', '#f39c12'] }
  ];

  const shapeOptions = [
    { value: 'sphere', label: '🪐 Spheres', description: 'Smooth planetary bodies' },
    { value: 'icosahedron', label: '🔺 Crystals', description: 'Geometric crystal forms' },
    { value: 'dodecahedron', label: '✨ Stars', description: 'Complex star shapes' },
    { value: 'torus', label: '🌀 Rings', description: 'Orbital ring structures' },
    { value: 'asteroid', label: '🌑 Asteroids', description: 'Organic rocky forms' }
  ];

  return (
    <>
      {/* Floating Customize Button */}
      <motion.button
        className="fixed top-4 right-4 bg-black/50 backdrop-blur-sm border border-cyan-500/30 text-cyan-200 px-4 py-2 rounded-full z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        🎨 Customize Cosmos
      </motion.button>

      {/* Customization Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Cosmic Personalization</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-cyan-200 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Color Palette Section */}
              <section className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Color Palette</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {palettePresets.map((preset, index) => (
                    <button
                      key={preset.name}
                      onClick={() => dispatch({
                        type: 'SET_PALETTE',
                        payload: {
                          ...theme.palette,
                          primary: preset.colors[0],
                          secondary: preset.colors[1],
                          nebula: [preset.colors[0], preset.colors[1]]
                        }
                      })}
                      className="p-3 rounded-lg border border-cyan-500/30 bg-black/30 text-left hover:border-cyan-400 transition-colors"
                    >
                      <div className="flex space-x-1 mb-2">
                        {preset.colors.map((color, i) => (
                          <div
                            key={`${preset.name}-${color}-${i}`}
                            className="w-6 h-6 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="text-cyan-200 text-sm font-medium">{preset.name}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Color Picker */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="primary-color" className="text-cyan-200 text-sm block mb-2">Primary Color</label>
                    <input
                      id="primary-color"
                      type="color"
                      value={theme.palette.primary}
                      onChange={(e) => dispatch({
                        type: 'SET_PALETTE',
                        payload: { ...theme.palette, primary: e.target.value }
                      })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </section>

              {/* Geometry & Shapes */}
              <section className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Planet Shapes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {shapeOptions.map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => dispatch({
                        type: 'SET_GEOMETRY',
                        payload: { ...theme.geometry, planetShape: shape.value }
                      })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        theme.geometry.planetShape === shape.value
                          ? 'border-cyan-400 bg-cyan-400/20'
                          : 'border-cyan-500/30 hover:border-cyan-400'
                      }`}
                    >
                      <div className="text-lg mb-1">{shape.label.split(' ')[0]}</div>
                      <div className="text-sm opacity-80">{shape.description}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Density Controls */}
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Cosmic Density</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-cyan-200 text-sm block mb-2">
                      Star Density: {theme.density.stars}
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="1000"
                      value={theme.density.stars}
                      onChange={(e) => dispatch({
                        type: 'SET_DENSITY',
                        payload: { ...theme.density, stars: parseInt(e.target.value) }
                      })}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="ui-density" className="text-cyan-200 text-sm block mb-2">UI Density</label>
                    <select
                      id="ui-density"
                      value={theme.geometry.uiDensity}
                      onChange={(e) => dispatch({
                        type: 'SET_GEOMETRY',
                        payload: { ...theme.geometry, uiDensity: e.target.value }
                      })}
                      className="w-full bg-black/30 border border-cyan-500/30 rounded-lg p-2 text-cyan-200"
                    >
                      <option value="compact">Compact</option>
                      <option value="medium">Medium</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>
              </section>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};