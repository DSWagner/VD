// App.js
import React, { useState } from "react";
import "./App.css";
import ModelSelector from "./ModelSelector";
import ThreeCanvas from "./ThreeCanvas";
import ThreeCanvasNew from "./ThreeCanvasNew";
import ViolinPlot from "./ViolinPlot";
import PolarHistogram from "./PolarHistogram";
import StatTable from "./StatTable";
import ParametersTab from "./ParametersTab";

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
  const [cameraPos, setCameraPos] = useState();
  const [isExpandedTable, setIsExpandedTable] = useState(false);
  const [isExpandedViolin, setIsExpandedViolin] = useState(false);
  const [isExpandedPolar, setIsExpandedPolar] = useState(false);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setSelectedObserverIds(Array(7).fill(""));
    setTableData([tableData[0]]);
    setSelectedObserverId(""); // Reset observer ID when a new file is selected
  };

  const handleObserverSelected = (observerId) => {
    setSelectedObserverId(observerId);
  };

  // Handler for the visualization button
  const handleVisualizationClick = () => {
    setTimeViz(true);
  };

  const handleObsPosClick = () => {
    setObsPos(true);
  };

  const handleExpandTable = () => {
    setIsExpandedTable(!isExpandedTable);
  };

  const handleExpandViolin = () => {
    setIsExpandedViolin(!isExpandedViolin);
  };

  const handleExpandPolar = () => {
    setIsExpandedPolar(!isExpandedPolar);
  };

  return (
    <div className="App container-fluid" style={{ margin: 0 }}>
      <div className="row header">
        <h1>Vizualizácia 3D eye-tracking dát</h1>
      </div>

      <div className="row">
        <div className="col-4">
          {selectedFile && (
            <>
              <div>
                <button onClick={handleExpandTable}>Tabulka</button>
                {isExpandedTable && (
                  <StatTable
                    modelFileName={selectedFile}
                    selectedObserverIds={selectedObserverIds}
                    tableData={tableData}
                    setTableData={setTableData}
                  />
                )}
              </div>
              <div>
                <button onClick={handleExpandViolin}>Huslový graf</button>
                {isExpandedViolin && (
                  <ViolinPlot modelFileName={selectedFile} />
                )}
              </div>
              <div>
                <button onClick={handleExpandPolar}>Polárny histogram</button>
                {isExpandedPolar && (
                  <PolarHistogram modelFileName={selectedFile} />
                )}
              </div>
            </>
          )}
        </div>

        <div className="col-5">
          {selectedFile && (
            <>
              <ThreeCanvasNew
                modelFileName={selectedFile}
                observerIds={selectedObserverIds}
                cameraPos={cameraPos}
              />
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
                <div>Zvoľte si ID pozorovateľov</div>
                <ParametersTab
                  modelFileName={selectedFile}
                  observerIds={selectedObserverIds}
                  setObserverIds={setSelectedObserverIds}
                  setCameraPos={setCameraPos}
                />
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
