import { useState, useEffect, useCallback, useRef } from 'react';
import PKIGraph from './components/PKIGraph';
import CommandPanel from './components/CommandPanel';
import { beginnerFlows } from './data/beginnerFlows';
import { pkiNodes } from './data/pkiNodes';

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(beginnerFlows[0]);
  const [darkMode, setDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const playIntervalRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.6,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.6,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply dark mode to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleBeginnerMode = () => {
    setBeginnerMode(!beginnerMode);
    setSelectedNode(null);
    stopAutoPlay();
  };

  const stopAutoPlay = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  const startAutoPlay = useCallback(() => {
    if (!beginnerMode || !selectedFlow) return;

    stopAutoPlay();
    setIsPlaying(true);
    setCurrentStep(0);

    // Set the first node
    const flowNodes = selectedFlow.nodes;
    const firstNode = flowNodes[0];
    const fullNode = pkiNodes.find(n => n.id === firstNode.fullId);
    setSelectedNode({ ...firstNode, ...fullNode, id: firstNode.id });

    let step = 0;
    playIntervalRef.current = setInterval(() => {
      step++;
      if (step >= flowNodes.length) {
        stopAutoPlay();
        return;
      }
      setCurrentStep(step);
      const node = flowNodes[step];
      const fullNodeData = pkiNodes.find(n => n.id === node.fullId);
      setSelectedNode({ ...node, ...fullNodeData, id: node.id });
    }, 2000);
  }, [beginnerMode, selectedFlow, stopAutoPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  // Stop autoplay when flow changes
  useEffect(() => {
    stopAutoPlay();
  }, [selectedFlow, stopAutoPlay]);

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="graph-container">
        <div className="mode-controls">
          <div className="top-buttons">
            <button
              className={`mode-toggle ${beginnerMode ? 'active' : ''}`}
              onClick={toggleBeginnerMode}
            >
              {beginnerMode ? '← Full View' : 'Beginner Mode →'}
            </button>
            <button
              className={`dark-mode-toggle ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {beginnerMode && (
            <>
              <div className="flow-selector">
                {beginnerFlows.map(flow => (
                  <button
                    key={flow.id}
                    className={`flow-btn ${selectedFlow.id === flow.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFlow(flow);
                      setSelectedNode(null);
                    }}
                  >
                    {flow.name}
                  </button>
                ))}
              </div>
              <button
                className={`play-btn ${isPlaying ? 'playing' : ''}`}
                onClick={isPlaying ? stopAutoPlay : startAutoPlay}
              >
                {isPlaying ? '⏹ Stop' : '▶ Auto-Play'}
              </button>
            </>
          )}
        </div>

        {beginnerMode && (
          <div className="flow-description">
            <strong>{selectedFlow.name}:</strong> {selectedFlow.description}
            {isPlaying && (
              <span className="step-indicator">
                {' '}— Step {currentStep + 1} of {selectedFlow.nodes.length}
              </span>
            )}
          </div>
        )}

        <PKIGraph
          onNodeClick={(node) => {
            stopAutoPlay();
            setSelectedNode(node);
          }}
          selectedNode={selectedNode}
          width={dimensions.width}
          height={dimensions.height}
          beginnerMode={beginnerMode}
          selectedFlow={selectedFlow}
          currentStep={currentStep}
          darkMode={darkMode}
        />
      </div>
      <div className="panel-container">
        <CommandPanel
          node={selectedNode}
          beginnerMode={beginnerMode}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
