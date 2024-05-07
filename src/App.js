// App.js
import React, { useState, useEffect } from "react";
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
  const [selectedObserverIds, setSelectedObserverIds] = useState(
    Array(7).fill([])
  );
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

  const [rangeValues, setRangeValues] = useState({
    min: 100,
    max: 450,
  });
  const [middleValue, setMiddleValue] = useState(
    (rangeValues.min + rangeValues.max) / 2
  );
  const [advancedViewFlags, setAdvancedViewFlags] = useState(
    Array(7).fill(false)
  );

  useEffect(() => {
    // Update the middle value whenever min or max changes
    setMiddleValue((rangeValues.min + rangeValues.max) / 2);
  }, [rangeValues.min, rangeValues.max]);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setSelectedObserverIds(Array(7).fill([]));
    setTableData([tableData[0]]);
    setStatVizFlags(Array(7).fill(false));
    setDynaVizFlags(Array(7).fill(false));
    setCameraPos();
    setParamFlag(6);
    setRangeValues({
      min: 100,
      max: 450,
    });
    setMiddleValue((rangeValues.min + rangeValues.max) / 2);
    setAdvancedViewFlags(Array(7).fill(false));
    // setDirectionColors({});
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

  const handleRangeChange = (value, type) => {
    const newValue = Number(value);
    if (type === "middle") {
      const oldMiddleValue = middleValue;
      const difference = newValue - oldMiddleValue;

      // Calculate potential new min and max values
      const newMin = rangeValues.min + difference;
      const newMax = rangeValues.max + difference;

      // Check if the new min or max would be out of the slider's range
      if (newMin < 100 || newMax > 450) {
        // If out of range, do not update
        return;
      }

      // Update range values and middle value
      setRangeValues((prev) => ({
        min: newMin,
        max: newMax,
      }));
      setMiddleValue(newValue);
    } else if (type === "min" && newValue > rangeValues.max) {
      setRangeValues((prev) => ({ ...prev, min: prev.max }));
    } else if (type === "max" && newValue < rangeValues.min) {
      setRangeValues((prev) => ({ ...prev, max: prev.min }));
    } else {
      setRangeValues((prev) => ({ ...prev, [type]: newValue }));
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
                rangeValues={rangeValues}
                advancedViewFlags={advancedViewFlags}
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
                    advancedViewFlags={advancedViewFlags}
                    setAdvancedViewFlags={setAdvancedViewFlags}
                    setRangeValues={setRangeValues}
                  />
                  {/* Slider element added below */}
                  {dynaVizFlags.some((flag) => flag) && (
                    <div
                      className="slider-container"
                      style={{ marginTop: "20px" }}
                    >
                      <input
                        type="range"
                        min="100"
                        max="450"
                        value={rangeValues.min}
                        onChange={(e) =>
                          handleRangeChange(e.target.value, "min")
                        }
                        className="slider slider-blue"
                        style={{
                          width: "100%",
                          backgroundColor: "blue",
                        }}
                      />
                      <input
                        type="range"
                        min="100"
                        max="450"
                        value={middleValue}
                        onChange={(e) =>
                          handleRangeChange(e.target.value, "middle")
                        }
                        className="slider"
                        style={{ width: "100%", backgroundColor: "grey" }}
                      />
                      <input
                        type="range"
                        min="100"
                        max="450"
                        value={rangeValues.max}
                        onChange={(e) =>
                          handleRangeChange(e.target.value, "max")
                        }
                        className="slider"
                        style={{
                          width: "100%",
                          backgroundColor: "red",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "10px",
                        }}
                      >
                        <span>0s</span>
                        <span>1s</span>
                        <span>2s</span>
                        <span>3s</span>
                        <span>4s</span>
                        <span>5s</span>
                        <span>6s</span>
                      </div>
                    </div>
                  )}
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
