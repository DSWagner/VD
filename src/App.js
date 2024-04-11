// App.js
import React, { useState } from "react";
import "./App.css";
import ModelSelector from "./ModelSelector";
import GroupedBarChart from "./GroupedBarChart";
import ThreeCanvas from "./ThreeCanvas";
import ThreeCanvasNew from "./ThreeCanvasNew";
import ViolinPlot from "./ViolinPlot";
import PolarHistogram from "./PolarHistogram";
import StatTable from "./StatTable";
import ParametersTab from "./ParametersTab";
import colors from "./colors.json";

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
  const [isExpandedPolar, setisExpandedPolar] = useState(false);
  const [isCheckboxCheckedViolin, setisCheckboxCheckedViolin] = useState(false);
  const [isCheckboxCheckedPolar, setisCheckboxCheckedPolar] = useState(false);
  const [isExpandedViolin, setisExpandedViolin] = useState(false);
  const [statVizFlags, setStatVizFlags] = useState(Array(7).fill(false));
  const [dynaVizFlags, setDynaVizFlags] = useState(Array(7).fill(false));
  const initialDirectionColors = colors.directions.reduce(
    (acc, color, index) => {
      acc[index] = color; // Assign the color to the corresponding index
      return acc;
    },
    {}
  );
  const [directionColors, setDirectionColors] = useState(
    initialDirectionColors
  ); // Initialize state for observer colors
  const [paramFlag, setParamFlag] = useState(6);
  const [sliderValue, setSliderValue] = useState(50);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setSelectedObserverIds(Array(7).fill(""));
    setTableData([tableData[0]]);
    setStatVizFlags(Array(7).fill(false));
    setDynaVizFlags(Array(7).fill(false));
    setCameraPos();
    setSelectedObserverId(""); // Reset observer ID when a new file is selected
    // setDirectionColors({});
  };

  // const handleObserverSelected = (observerId) => {
  //   setSelectedObserverId(observerId);
  // };

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

  const handleExpandStatViolin = () => {
    setisExpandedViolin(!isExpandedViolin);
  };

  const handleExpandStatPolar = () => {
    setisExpandedPolar(!isExpandedPolar);
  };

  const handleCheckboxChangeViolin = () => {
    setisCheckboxCheckedViolin(!isCheckboxCheckedViolin);
  };

  const handleCheckboxChangePolar = () => {
    setisCheckboxCheckedPolar(!isCheckboxCheckedPolar);
  };

  const handleParameters = () => {
    console.log("Parameters button clicked, ", paramFlag);
    // Add any logic here that you want to execute when the button is clicked

    if (paramFlag === 6) {
      setParamFlag(5);
    } else {
      setParamFlag(6);
    }
  };

  return (
    <div className="App container-fluid" style={{ margin: 0 }}>
      {/* <div className="row header">
        <h1>Vizualizácia 3D eye-tracking dát</h1>
      </div> */}
      <div className="row">
        <div>Zvoľte si 3D objekt na vizualizáciu</div>
        <div>
          <ModelSelector onFileSelected={handleFileSelected} />
          {selectedFile && (
            <button style={{ marginLeft: "10px" }} onClick={handleParameters}>
              Parametre
            </button>
          )}
          {/* Add this line */}
        </div>
      </div>

      <div className="row">
        <div className="col-4">
          {selectedFile && (
            <>
              <div>
                <button
                  onClick={handleExpandTable}
                  style={{ marginTop: "10px" }}
                >
                  Tabulka
                </button>
                {isExpandedTable && (
                  <StatTable
                    modelFileName={selectedFile}
                    selectedObserverIds={selectedObserverIds}
                    tableData={tableData}
                    setTableData={setTableData}
                  />
                )}
                {isExpandedTable && (
                  <GroupedBarChart
                  tableData = {tableData}
                  directionColors = {directionColors}
                  />
                )}
              </div>

              <div>
                <button
                  onClick={handleExpandStatViolin}
                  style={{ marginTop: "10px" }}
                >
                  Violin Plot
                </button>
                {isExpandedViolin && (
                  <div>
                    <label>
                    <input
                      type="checkbox"
                      checked={isCheckboxCheckedViolin}
                      onChange={handleCheckboxChangeViolin}
                    />
                    Zobrazit zvolenych observerov
                    </label>
                    <ViolinPlot
                      modelFileName={selectedFile}
                      directionColors={directionColors}
                      isSelected={isCheckboxCheckedViolin}
                      selectedObserverIds={selectedObserverIds}
                    />
                  </div>
                  )}
              </div>

              <div>
                <button
                  onClick={handleExpandStatPolar}
                  style={{ marginTop: "10px" }}
                >
                  Polar Histogram
                </button>
                {isExpandedPolar && (
                  <div>
                    <label>
                    <input
                      type="checkbox"
                      checked={isCheckboxCheckedPolar}
                      onChange={handleCheckboxChangePolar}
                    />
                    Zobrazit zvolenych observerov
                    </label>
                    <PolarHistogram
                      modelFileName={selectedFile}
                      directionColors={directionColors}
                      isSelected={isCheckboxCheckedPolar}
                      selectedObserverIds={selectedObserverIds} 
                    />
                  </div>
                  )}
              </div>
            </>
          )}
        </div>
        <div className={`col-${paramFlag.toString()}`}>
          {selectedFile && (
            <>
              <ThreeCanvasNew
                modelFileName={selectedFile}
                observerIds={selectedObserverIds}
                cameraPos={cameraPos}
                statVizFlags={statVizFlags}
                dynaVizFlags={dynaVizFlags}
                directionColors={directionColors}
                paramFlag={paramFlag}
                sliderValue={sliderValue}
              />
            </>
          )}
        </div>
        {paramFlag - 6 != 0 && (
          <div className="col-3">
            <div className="row">
              {selectedFile && ( // Only show the observer selector if a file is selected
                <>
                  <div>Zvoľte si ID pozorovateľov</div>
                  <ParametersTab
                    modelFileName={selectedFile}
                    observerIds={selectedObserverIds}
                    setObserverIds={setSelectedObserverIds}
                    setCameraPos={setCameraPos}
                    statVizFlags={statVizFlags}
                    setStatVizFlags={setStatVizFlags}
                    dynaVizFlags={dynaVizFlags}
                    setDynaVizFlags={setDynaVizFlags}
                    directionColors={directionColors}
                    setDirectionColors={setDirectionColors}
                  />
                  {/* Slider element added below */}
                  <div
                    className="slider-container"
                    style={{ marginTop: "20px" }}
                  >
                    <input
                      type="range"
                      min="100"
                      max="400"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(e.target.value)}
                      className="slider"
                      style={{ width: "100%" }}
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
        )}
      </div>
    </div>
  );
}

export default App;
