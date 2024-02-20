import React, { useState, useEffect } from "react";

const ObserverSelector = ({ modelFileName, onObserverSelected }) => {
  const [observerIds, setObserverIds] = useState([]);

  useEffect(() => {
    const jsonFilename = modelFileName.replace(".stl", ".json");
    fetch(`${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFilename}`)
      .then((response) => response.json())
      .then((data) => {
        const ids = data.map((item) => item["observer id"]);
        setObserverIds(ids);
      })
      .catch((error) => console.error("Failed to load observer IDs:", error));
  }, [modelFileName]);

  return (
    <select
      onChange={(e) => onObserverSelected(e.target.value)}
      defaultValue=""
    >
      <option value="" disabled>
        Select Observer ID
      </option>
      {observerIds.map((id) => (
        <option key={id} value={id}>
          {id}
        </option>
      ))}
    </select>
  );
};

export default ObserverSelector;
