// App.js
import React, { useState } from "react";
import "./App.css";
import ModelSelector from "./ModelSelector";
import ObserverSelector from "./ObserverSelector";
import ThreeCanvas from "./ThreeCanvas";

function App() {
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedObserverId, setSelectedObserverId] = useState("");
  const [timeViz, setTimeViz] = useState(false);
  const [obsPos, setObsPos] = useState(false);
  const [tableData, setTableData] = useState([
    [
      "ID poz.",
      "Model",
      "Mat.",
      "Uhol",
      "Dĺžka poz.",
      "Min. čas fix.",
      "Pr. čas fix.",
      "Max. čas fix.",
    ],
  ]);

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
    setTimeViz(true);
  };

  const handleObsPosClick = () => {
    setObsPos(true);
  };

  return (
    <div className="App">
      <div class="header">
        <h2>Vizualizácia 3D eye-tracking dát</h2>
      </div>
      <div class="content">
        <div class="column">
          <div>
            <table className="centered-table">
              <tbody>
                {tableData.map((rowData, rowIndex) => (
                  <tr key={rowIndex}>
                    {rowData.map((cellData, cellIndex) => (
                      <td key={cellIndex}>{cellData}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div class="column">
          <div>Zvoľte si 3D objekt na vizualizáciu</div>
          <div>
            <ModelSelector onFileSelected={handleFileSelected} />
          </div>
          {selectedFile && (
            <>
              {/* <div>Zvolený objekt: {selectedFile}</div> */}
              <ThreeCanvas
                observerId={selectedObserverId}
                modelFileName={selectedFile}
                timeViz={timeViz}
                setTimeViz={setTimeViz}
                obsPos={obsPos}
                setObsPos={setObsPos}
                tableData={tableData}
                setTableData={setTableData}
              />
            </>
          )}
        </div>
        <div class="column">
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
              <div>
                <button onClick={handleVisualizationClick}>
                  Vizualizácia v čase
                </button>
              </div>
              <div>
                <button onClick={handleObsPosClick}>Pozorovateľ</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
