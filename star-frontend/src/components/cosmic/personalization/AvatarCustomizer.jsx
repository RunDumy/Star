import { useCollaboration } from '@/contexts/CollaborationContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export const AvatarCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, updateAvatar } = useCollaboration();

  const colorPresets = [
    { name: 'Cosmic Blue', color: '#4a90e2', description: 'Deep ocean serenity' },
    { name: 'Nebula Purple', color: '#9b59b6', description: 'Mystical energy' },
    { name: 'Solar Gold', color: '#f1c40f', description: 'Radiant warmth' },
    { name: 'Void Black', color: '#2c3e50', description: 'Infinite depth' },
    { name: 'Plasma Red', color: '#e74c3c', description: 'Fiery passion' },
    { name: 'Crystal White', color: '#ecf0f1', description: 'Pure light' },
    { name: 'Emerald Green', color: '#27ae60', description: 'Life essence' },
    { name: 'Amber Orange', color: '#e67e22', description: 'Ancient wisdom' }
  ];

  const shapeOptions = [
    { value: 'sphere', label: '🪐 Sphere', description: 'Smooth planetary form' },
    { value: 'cube', label: '⬜ Cube', description: 'Geometric crystal' },
    { value: 'pyramid', label: '🔺 Pyramid', description: 'Ancient monument' },
    { value: 'octahedron', label: '💎 Octahedron', description: 'Eight-faced crystal' },
    { value: 'tetrahedron', label: '🔶 Tetrahedron', description: 'Four-faced gem' },
    { value: 'dodecahedron', label: '⭐ Dodecahedron', description: 'Twelve-faced star' }
  ];

  const sizeOptions = [
    { value: 0.3, label: 'Mini', description: 'Compact presence' },
    { value: 0.5, label: 'Standard', description: 'Balanced form' },
    { value: 0.8, label: 'Large', description: 'Commanding presence' },
    { value: 1.2, label: 'Giant', description: 'Cosmic scale' }
  ];

  const handleColorChange = (color) => {
    updateAvatar({ color });
  };

  const handleShapeChange = (shape) => {
    updateAvatar({ shape });
  };

  const handleSizeChange = (size) => {
    updateAvatar({ size });
  };

  const randomizeAvatar = () => {
    const randomColor = colorPresets[Math.floor(Math.random() * colorPresets.length)].color;
    const randomShape = shapeOptions[Math.floor(Math.random() * shapeOptions.length)].value;
    const randomSize = sizeOptions[Math.floor(Math.random() * sizeOptions.length)].value;

    updateAvatar({
      color: randomColor,
      shape: randomShape,
      size: randomSize
    });
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Floating Customize Button */}
      <motion.button
        className="fixed top-16 right-4 bg-black/50 backdrop-blur-sm border border-purple-500/30 text-purple-200 px-4 py-2 rounded-full z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        👤 Avatar
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
              className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-200">Customize Your Avatar</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-purple-400 hover:text-purple-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Current Avatar Preview */}
              <div className="mb-6 p-4 bg-black/30 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-200 mb-2">Current Avatar</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">
                    {shapeOptions.find(s => s.value === currentUser.avatar?.shape)?.label || '🪐'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-purple-300">
                      Shape: {shapeOptions.find(s => s.value === currentUser.avatar?.shape)?.description || 'Sphere'}
                    </div>
                    <div className="text-sm text-purple-300">
                      Color: {colorPresets.find(c => c.color === currentUser.avatar?.color)?.name || 'Cosmic Blue'}
                    </div>
                    <div className="text-sm text-purple-300">
                      Size: {sizeOptions.find(s => s.value === currentUser.avatar?.size)?.label || 'Standard'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Randomize Button */}
              <div className="mb-6">
                <motion.button
                  onClick={randomizeAvatar}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎲 Randomize Avatar
                </motion.button>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-200 mb-3">Choose Your Color</h3>
                <div className="grid grid-cols-4 gap-3">
                  {colorPresets.map((preset) => (
                    <motion.button
                      key={preset.color}
                      onClick={() => handleColorChange(preset.color)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentUser.avatar?.color === preset.color
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-purple-500/30 hover:border-purple-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={preset.description}
                    >
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: preset.color }}
                      />
                      <div className="text-xs text-center text-purple-200">{preset.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Shape Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-200 mb-3">Choose Your Shape</h3>
                <div className="grid grid-cols-2 gap-3">
                  {shapeOptions.map((shape) => (
                    <motion.button
                      key={shape.value}
                      onClick={() => handleShapeChange(shape.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentUser.avatar?.shape === shape.value
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-purple-500/30 hover:border-purple-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-3xl mb-2">{shape.label}</div>
                      <div className="text-sm text-purple-200 font-medium">{shape.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-200 mb-3">Choose Your Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizeOptions.map((size) => (
                    <motion.button
                      key={size.value}
                      onClick={() => handleSizeChange(size.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        currentUser.avatar?.size === size.value
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-purple-500/30 hover:border-purple-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-2xl mb-2">
                        {size.value === 0.3 && '🔍'}
                        {size.value === 0.5 && '⚖️'}
                        {size.value === 0.8 && '📏'}
                        {size.value === 1.2 && '🌟'}
                      </div>
                      <div className="text-sm text-purple-200 font-medium">{size.label}</div>
                      <div className="text-xs text-purple-300">{size.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};