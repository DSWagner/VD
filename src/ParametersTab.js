// PolarHistogram.js
import React, { useEffect } from "react";
import ObserverSelector from "./ObserverSelector";

const ParametersTab = ({
  modelFileName,
  observerIds,
  setObserverIds,
  setCameraPos,
}) => {
  const handleObserversSelected = (observerId, index) => {
    const newObserverIds = [...observerIds];
    newObserverIds[index] = observerId;
    setObserverIds(newObserverIds);
    console.log(newObserverIds);
  };

  const handleStatVizCheckbox = (flag, index) => {
    console.log("Static Viz");
    console.log(flag);
    console.log(index);
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
