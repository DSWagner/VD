// App.js
import React, { useState } from "react";
import "./App.css";
import ModelSelector from "./ModelSelector";
import ObserverSelector from "./ObserverSelector";
import ThreeCanvas from "./ThreeCanvas";
import ViolinPlot from "./ViolinPlot";
import PolarHistogram from "./PolarHistogram";
import StatTable from "./StatTable";

function App() {
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedObserverId, setSelectedObserverId] = useState("");
  const [selectedObserverIds, setSelectedObserverIds] = useState(
    Array(7).fill("")
  );
  const [timeViz, setTimeViz] = useState(false);
  const [obsPos, setObsPos] = useState(false);
  const [tableData, setTableData] = useState([
    [
      "ID poz.",
      "Model",
      "Mat.",
      "Smer",
      "Dĺžka poz.",
      "Min. čas fix.",
      "Pr. čas fix.",
      "Max. čas fix.",
    ],
  ]);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setSelectedObserverIds(Array(7).fill(""));
    setTableData([tableData[0]]);
    setSelectedObserverId(""); // Reset observer ID when a new file is selected
  };

  const handleObserverSelected = (observerId) => {
    setSelectedObserverId(observerId);
  };

  const handleObserversSelected = (observerId, index) => {
    const newSelectedObserverIds = [...selectedObserverIds];
    newSelectedObserverIds[index] = observerId;
    setSelectedObserverIds(newSelectedObserverIds);
    console.log(newSelectedObserverIds);
  };

  // Handler for the visualization button
  const handleVisualizationClick = () => {
    setTimeViz(true);
  };

  const handleObsPosClick = () => {
    setObsPos(true);
  };

  return (
    <div className="App container" style={{ margin: 0 }}>
      <div className="row header">
        <h1>Vizualizácia 3D eye-tracking dát</h1>
      </div>

      <div className="row">
        <div className="col-4">
          <div>
            {selectedFile && (
              <StatTable
                modelFileName={selectedFile}
                selectedObserverIds={selectedObserverIds}
                tableData={tableData}
                setTableData={setTableData}
              />
            )}
            {selectedFile && (
              <>
                <ViolinPlot modelFileName={selectedFile} />
                <PolarHistogram modelFileName={selectedFile} />
              </>
            )}
          </div>
        </div>

        <div className="col-5">
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

        <div className="col-3">
          <div className="row">
            <div>Zvoľte si 3D objekt na vizualizáciu</div>
            <div>
              <ModelSelector onFileSelected={handleFileSelected} />
            </div>
          </div>
          <div className="row">
            {selectedFile && ( // Only show the observer selector if a file is selected
              <>
                <div>Zvoľte si ID pozorovateľa</div>
                <div>
                  <ObserverSelector
                    onObserverSelected={handleObserverSelected}
                    modelFileName={selectedFile}
                    index={0}
                  />
                  <div>Zvoľte si ID pozorovateľov</div>
                  <ObserverSelector
                    onObserverSelected={(observerId) =>
                      handleObserversSelected(observerId, 0)
                    }
                    modelFileName={selectedFile}
                    index={0}
                  />
                  <ObserverSelector
                    onObserverSelected={(observerId) =>
                      handleObserversSelected(observerId, 1)
                    }
                    modelFileName={selectedFile}
                    index={1}
                  />
                  <ObserverSelector
                    onObserverSelected={(observerId) =>
                      handleObserversSelected(observerId, 2)
                    }
                    modelFileName={selectedFile}
                    index={2}
                  />
                  <ObserverSelector
                    onObserverSelected={(observerId) =>
                      handleObserversSelected(observerId, 3)
                    }
                    modelFileName={selectedFile}
                    index={3}
                  />
                  <ObserverSelector
                    onObserverSelected={(observerId) =>
                      handleObserversSelected(observerId, 4)
                    }
                    modelFileName={selectedFile}
                    index={4}
                  />
                  <ObserverSelector
                    onObserverSelected={(observerId) =>
                      handleObserversSelected(observerId, 5)
                    }
                    modelFileName={selectedFile}
                    index={5}
                  />
                  <ObserverSelector
                    onObserverSelected={(observerId) =>
                      handleObserversSelected(observerId, 6)
                    }
                    modelFileName={selectedFile}
                    index={6}
                  />
                </div>
              </>
            )}
            {selectedObserverId && ( // Only show the observer ID if it is selected
              <>
                {/* <div>Zvolené ID pozorovateľa: {selectedObserverId}</div> */}
                {/* Conditional button rendering */}
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
    </div>
  );
}

export default App;
