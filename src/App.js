// App.js
import React, { useState } from "react";
import "./App.css";
import ModelSelector from "./ModelSelector";
import ObserverSelector from "./ObserverSelector";
import ThreeCanvas from "./ThreeCanvas";

function App() {
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedObserverId, setSelectedObserverId] = useState("");
  const [clickedTimeViz, setClickedTimeViz] = useState("");

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setSelectedObserverId(""); // Reset observer ID when a new file is selected
  };

  const handleObserverSelected = (observerId) => {
    setSelectedObserverId(observerId);
  };

  // Handler for the visualization button
  const handleVisualizationClick = () => {
    // Define what should happen when the button is clicked
    // This could be updating state, calling a function, etc.
    setClickedTimeViz(true);
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
            modelFileName={selectedFile}
            timeViz={clickedTimeViz}
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
        <>
          <div>Zvolené ID pozorovateľa: {selectedObserverId}</div>
          {/* Conditional button rendering */}
          <button onClick={handleVisualizationClick}>
            Vizualizácia v čase
          </button>
        </>
      )}
    </div>
  );
}

export default App;
