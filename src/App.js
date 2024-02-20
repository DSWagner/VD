// App.js
import React, { useState } from "react";
import "./App.css";
import ModelSelector from "./ModelSelector";
import ObserverSelector from "./ObserverSelector";
import ThreeCanvas from "./ThreeCanvas";

function App() {
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedObserverId, setSelectedObserverId] = useState("");
  const [isHeatmapChecked, setHeatmapChecked] = useState(false);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setSelectedObserverId(""); // Reset observer ID when a new file is selected
  };

  const handleObserverSelected = (observerId) => {
    setSelectedObserverId(observerId);
  };

  const handleHeatmapCheckboxChange = (e) => {
    setHeatmapChecked(e.target.checked);
  };

  return (
    <div className="App">
      <h1>Vizualizácia 3D eye-tracking dát</h1>
      <div>Zvoľte si 3D objekt na vizualizáciu</div>
      <div>
        <ModelSelector onFileSelected={handleFileSelected} />
      </div>
      {selectedFile && (
        <>
          <div>Zvolený objekt: {selectedFile}</div>
          <ThreeCanvas
            observerId={selectedObserverId}
            modelFileName={`/Dataset/3d_models/${selectedFile}`}
          />
        </>
      )}
      {selectedFile && ( // Only show the observer selector if a file is selected
        <>
          <div>Zvoľte si ID pozorovateľa</div>
          <div>
            <ObserverSelector
              onObserverSelected={handleObserverSelected}
              modelFileName={selectedFile}
            />
          </div>
        </>
      )}
      {selectedObserverId && ( // Only show the observer ID if it is selected
        <div>Zvolené ID pozorovateľa: {selectedObserverId}</div>
      )}
      {selectedObserverId && (
        <>
          <div>
            <input
              type="checkbox"
              id="heatmapCheckbox"
              checked={isHeatmapChecked}
              onChange={handleHeatmapCheckboxChange}
            />
            <label htmlFor="heatmapCheckbox">Heatmap</label>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
