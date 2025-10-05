import { useCollaboration } from '@/contexts/CollaborationContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';

export const ConstellationEditor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingConstellation, setEditingConstellation] = useState(null);
  const [newStarName, setNewStarName] = useState('');
  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const { constellations, createConstellation, updateConstellation, deleteConstellation, currentUser } = useCollaboration();

  const starColors = [
    { name: 'Golden', color: '#ffd700' },
    { name: 'Blue', color: '#4a90e2' },
    { name: 'Red', color: '#e74c3c' },
    { name: 'Green', color: '#27ae60' },
    { name: 'Purple', color: '#9b59b6' },
    { name: 'White', color: '#ecf0f1' },
    { name: 'Orange', color: '#e67e22' },
    { name: 'Pink', color: '#e91e63' }
  ];

  const createNewConstellation = useCallback(() => {
    const newConstellation = {
      name: `Constellation ${constellations.size + 1}`,
      stars: [],
      connections: [],
      lineColor: '#ffffff',
      theme: 'default',
      creatorId: currentUser?.id,
      isActive: true,
    };
    createConstellation(newConstellation);
    setEditingConstellation(newConstellation);
  }, [constellations.size, createConstellation, currentUser]);

  const addStar = useCallback(() => {
    if (!editingConstellation || !newStarName.trim()) return;

    const newStar = {
      id: `star-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newStarName.trim(),
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ],
      color: starColors[Math.floor(Math.random() * starColors.length)].color,
      size: 0.1 + Math.random() * 0.1,
    };

    const updatedConstellation = {
      ...editingConstellation,
      stars: [...editingConstellation.stars, newStar],
    };

    updateConstellation(updatedConstellation);
    setEditingConstellation(updatedConstellation);
    setNewStarName('');
  }, [editingConstellation, newStarName, updateConstellation]);

  const updateStar = useCallback((starId, updates) => {
    if (!editingConstellation) return;

    const updatedStars = editingConstellation.stars.map(star =>
      star.id === starId ? { ...star, ...updates } : star
    );

    const updatedConstellation = {
      ...editingConstellation,
      stars: updatedStars,
    };

    updateConstellation(updatedConstellation);
    setEditingConstellation(updatedConstellation);
  }, [editingConstellation, updateConstellation]);

  const deleteStar = useCallback((starId) => {
    if (!editingConstellation) return;

    const updatedStars = editingConstellation.stars.filter(star => star.id !== starId);
    const updatedConnections = editingConstellation.connections.filter(
      ([start, end]) => {
        const startIndex = editingConstellation.stars.findIndex(s => s.id === starId);
        const endIndex = editingConstellation.stars.findIndex(s => s.id === starId);
        return start !== startIndex && end !== endIndex;
      }
    );

    const updatedConstellation = {
      ...editingConstellation,
      stars: updatedStars,
      connections: updatedConnections,
    };

    updateConstellation(updatedConstellation);
    setEditingConstellation(updatedConstellation);
    setSelectedStar(null);
  }, [editingConstellation, updateConstellation]);

  const removeConnection = useCallback((connectionIndex) => {
    if (!editingConstellation) return;

    const updatedConnections = editingConstellation.connections.filter(
      (_, index) => index !== connectionIndex
    );

    const updatedConstellation = {
      ...editingConstellation,
      connections: updatedConnections,
    };

    updateConstellation(updatedConstellation);
    setEditingConstellation(updatedConstellation);
    setSelectedConnection(null);
  }, [editingConstellation, updateConstellation]);

  const updateConstellationProperty = useCallback((property, value) => {
    if (!editingConstellation) return;

    const updatedConstellation = {
      ...editingConstellation,
      [property]: value,
    };

    updateConstellation(updatedConstellation);
    setEditingConstellation(updatedConstellation);
  }, [editingConstellation, updateConstellation]);

  const exportConstellation = useCallback((constellation) => {
    const exportData = {
      ...constellation,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name || 'Anonymous',
      version: '1.0',
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${constellation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_constellation.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [currentUser]);

  const importConstellation = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate the imported data
        if (!importedData.name || !importedData.stars || !importedData.connections) {
          alert('Invalid constellation file format');
          return;
        }

        // Create a new constellation with imported data
        const newConstellation = {
          ...importedData,
          id: `constellation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${importedData.name} (Imported)`,
          creatorId: currentUser?.id,
          importedAt: new Date().toISOString(),
          isActive: true,
        };

        createConstellation(newConstellation);
        alert(`Successfully imported constellation: ${newConstellation.name}`);
      } catch (error) {
        alert('Error importing constellation: ' + error.message);
      }
    };
    reader.readAsText(file);
  }, [createConstellation, currentUser]);

  const shareConstellation = useCallback((constellation) => {
    const shareData = {
      title: constellation.name,
      text: `Check out this constellation: ${constellation.name}`,
      url: `${window.location.origin}/collaborative-cosmos?constellation=${encodeURIComponent(JSON.stringify(constellation))}`,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Constellation link copied to clipboard!');
      });
    }
  }, []);

  const duplicateConstellation = useCallback((constellation) => {
    const duplicated = {
      ...constellation,
      id: `constellation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${constellation.name} (Copy)`,
      creatorId: currentUser?.id,
      createdAt: new Date().toISOString(),
    };

    createConstellation(duplicated);
    setEditingConstellation(duplicated);
  }, [createConstellation, currentUser]);

  if (!currentUser) return null;

  return (
    <>
      {/* Floating Editor Button */}
      <motion.button
        className="fixed top-20 right-4 bg-black/50 backdrop-blur-sm border border-green-500/30 text-green-200 px-4 py-2 rounded-full z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        ✨ Constellations
      </motion.button>

      {/* Editor Panel */}
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
              className="bg-gradient-to-br from-green-900/90 to-blue-900/90 border border-green-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-200">Constellation Editor</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-green-400 hover:text-green-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Constellation List */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-green-200">Your Constellations</h3>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={createNewConstellation}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      + New Constellation
                    </motion.button>
                    <motion.button
                      onClick={() => document.getElementById('constellation-import').click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📁 Import
                    </motion.button>
                    <input
                      id="constellation-import"
                      type="file"
                      accept=".json"
                      onChange={importConstellation}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from(constellations.values()).map((constellation) => (
                    <motion.div
                      key={constellation.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editingConstellation?.id === constellation.id
                          ? 'border-green-400 bg-green-500/20'
                          : 'border-green-500/30 hover:border-green-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <motion.button
                          className="flex-1 text-left p-2 -m-2 rounded hover:bg-green-500/10 transition-colors"
                          onClick={() => setEditingConstellation(constellation)}
                          whileHover={{ scale: 1.01 }}
                        >
                          <h4 className="font-semibold text-green-200">{constellation.name}</h4>
                          <p className="text-sm text-green-300">
                            {constellation.stars.length} stars, {constellation.connections.length} connections
                          </p>
                        </motion.button>
                        <div className="flex space-x-1 ml-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateConstellation(constellation);
                            }}
                            className="text-green-400 hover:text-green-200 text-sm p-1 rounded hover:bg-green-500/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            title="Duplicate"
                          >
                            📋
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareConstellation(constellation);
                            }}
                            className="text-green-400 hover:text-green-200 text-sm p-1 rounded hover:bg-green-500/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            title="Share"
                          >
                            🔗
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportConstellation(constellation);
                            }}
                            className="text-green-400 hover:text-green-200 text-sm p-1 rounded hover:bg-green-500/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            title="Export"
                          >
                            💾
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Editing Panel */}
              {editingConstellation && (
                <div className="border-t border-green-500/30 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-green-200">Editing: {editingConstellation.name}</h3>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => deleteConstellation(editingConstellation.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                      <motion.button
                        onClick={() => setEditingConstellation(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Close
                      </motion.button>
                    </div>
                  </div>

                  {/* Basic Properties */}
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="constellation-name" className="block text-sm font-medium text-green-300 mb-1">Name</label>
                        <input
                          id="constellation-name"
                          type="text"
                          value={editingConstellation.name}
                          onChange={(e) => updateConstellationProperty('name', e.target.value)}
                          className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="line-color" className="block text-sm font-medium text-green-300 mb-1">Line Color</label>
                        <input
                          id="line-color"
                          type="color"
                          value={editingConstellation.lineColor}
                          onChange={(e) => updateConstellationProperty('lineColor', e.target.value)}
                          className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Star */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-200 mb-3">Add Star</h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Star name"
                        value={newStarName}
                        onChange={(e) => setNewStarName(e.target.value)}
                        className="flex-1 bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-200"
                        onKeyPress={(e) => e.key === 'Enter' && addStar()}
                      />
                      <motion.button
                        onClick={addStar}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add Star
                      </motion.button>
                    </div>
                  </div>

                  {/* Stars List */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-200 mb-3">Stars ({editingConstellation.stars.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {editingConstellation.stars.map((star, index) => (
                        <motion.div
                          key={star.id}
                          onClick={() => setSelectedStar(selectedStar === index ? null : index)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedStar === index
                              ? 'border-green-400 bg-green-500/20'
                              : 'border-green-500/30 hover:border-green-400'
                          }`}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: star.color }}
                              />
                              <span className="text-green-200 font-medium">{star.name}</span>
                              <span className="text-green-300 text-sm">
                                ({star.position.map(p => p.toFixed(1)).join(', ')})
                              </span>
                            </div>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteStar(star.id);
                              }}
                              className="text-red-400 hover:text-red-300 text-sm"
                              whileHover={{ scale: 1.1 }}
                            >
                              ✕
                            </motion.button>
                          </div>

                          {/* Star Edit Controls */}
                          {selectedStar === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-green-500/30"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div>
                                  <label htmlFor={`star-color-${star.id}`} className="block text-xs text-green-300 mb-1">Color</label>
                                  <input
                                    id={`star-color-${star.id}`}
                                    type="color"
                                    value={star.color}
                                    onChange={(e) => updateStar(star.id, { color: e.target.value })}
                                    className="w-full h-8 bg-black/50 border border-green-500/30 rounded"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`star-size-${star.id}`} className="block text-xs text-green-300 mb-1">Size</label>
                                  <input
                                    id={`star-size-${star.id}`}
                                    type="range"
                                    min="0.05"
                                    max="0.3"
                                    step="0.01"
                                    value={star.size}
                                    onChange={(e) => updateStar(star.id, { size: parseFloat(e.target.value) })}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`star-x-${star.id}`} className="block text-xs text-green-300 mb-1">X</label>
                                  <input
                                    id={`star-x-${star.id}`}
                                    type="number"
                                    step="0.1"
                                    value={star.position[0]}
                                    onChange={(e) => updateStar(star.id, {
                                      position: [parseFloat(e.target.value), star.position[1], star.position[2]]
                                    })}
                                    className="w-full bg-black/50 border border-green-500/30 rounded px-2 py-1 text-green-200 text-sm"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`star-y-${star.id}`} className="block text-xs text-green-300 mb-1">Y</label>
                                  <input
                                    id={`star-y-${star.id}`}
                                    type="number"
                                    step="0.1"
                                    value={star.position[1]}
                                    onChange={(e) => updateStar(star.id, {
                                      position: [star.position[0], parseFloat(e.target.value), star.position[2]]
                                    })}
                                    className="w-full bg-black/50 border border-green-500/30 rounded px-2 py-1 text-green-200 text-sm"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Connections */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-green-200 mb-3">
                      Connections ({editingConstellation.connections.length})
                    </h4>
                    <div className="text-sm text-green-300 mb-3">
                      Click two stars to create a connection, or click a connection to remove it.
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {editingConstellation.connections.map((connection, index) => {
                        const star1 = editingConstellation.stars[connection[0]];
                        const star2 = editingConstellation.stars[connection[1]];
                        return (
                          <motion.div
                            key={`${connection[0]}-${connection[1]}`}
                            onClick={() => setSelectedConnection(selectedConnection === index ? null : index)}
                            className={`p-2 rounded cursor-pointer transition-all ${
                              selectedConnection === index
                                ? 'border border-red-400 bg-red-500/20'
                                : 'hover:bg-green-500/10'
                            }`}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-green-200 text-sm">
                                {star1?.name} ↔ {star2?.name}
                              </span>
                              {selectedConnection === index && (
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeConnection(index);
                                  }}
                                  className="text-red-400 hover:text-red-300 text-sm ml-2"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  Remove
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};