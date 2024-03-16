// PolarHistogram.js
import React, { useEffect } from "react";
import ObserverSelector from "./ObserverSelector";

const ParametersTab = ({
  modelFileName,
  observerIds,
  setObserverIds,
  setCameraPos,
  statVizFlags,
  setStatVizFlags,
}) => {
  useEffect(() => {
    if (!modelFileName) return;
    // Reset statVizFlags to false for each observerId when modelFileName changes
    const resetFlags = observerIds.map(() => false);
    setStatVizFlags(resetFlags);
  }, [modelFileName]);

  const handleObserversSelected = (observerId, index) => {
    const newObserverIds = [...observerIds];
    newObserverIds[index] = observerId;
    setObserverIds(newObserverIds);
    console.log(newObserverIds);
  };

  const handleStatVizCheckbox = (flag, index) => {
    // Update statVizFlags in an immutable way
    const updatedFlags = statVizFlags.map((item, idx) =>
      idx === index ? flag : item
    );
    // console.log(updatedFlags);
    setStatVizFlags(updatedFlags);
  };

  const handleDynaVizCheckbox = (flag, index) => {
    console.log("Dynamic Viz");
    console.log(flag);
    console.log(index);
  };

  const handleObserverPosition = (index) => {
    console.log("Position");
    console.log(index);
    setCameraPos(index);
  };

  return (
    <div>
      {observerIds.map((observerId, index) => (
        <div>
          <ObserverSelector
            onObserverSelected={(_observerId) =>
              handleObserversSelected(_observerId, index)
            }
            modelFileName={modelFileName}
            index={index}
          />
          <> SV </>
          <input
            type="checkbox"
            checked={statVizFlags[index]}
            onChange={(e) => handleStatVizCheckbox(e.target.checked, index)}
          />
          <> DV </>
          <input
            type="checkbox"
            onChange={(e) => handleDynaVizCheckbox(e.target.checked, index)}
          />
          <button onClick={() => handleObserverPosition(index)}>Pozícia</button>
        </div>
      ))}
    </div>
  );
};

export default ParametersTab;
