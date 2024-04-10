import React, { useState, useEffect } from "react";
import Select from "react-select";
import VisualRepresentation from "./visual_representation/VisualRepresentation";

const ObserverSelector = ({ modelFileName, onObserverSelected, index }) => {
  const [observerIds, setObserverIds] = useState([]);
  const [selectedObserverIds, setSelectedObserverIds] = useState([]);

  useEffect(() => {
    VisualRepresentation.getObservers(index).then((ids) => setObserverIds(ids));
    setSelectedObserverIds([]);
  }, [modelFileName, index]);

  useEffect(() => {
    // Reset selectedObserverIds when modelFileName changes
    setSelectedObserverIds([]);
  }, [modelFileName]); // Add modelFileName as a dependency

  const handleChange = (selectedOptions) => {
    setSelectedObserverIds(selectedOptions);
    console.log("SELECTED: ", selectedOptions);
    // Assuming onObserverSelected can now handle an array of objects
    onObserverSelected(selectedOptions.map((option) => option.value));
  };

  return (
    <>
      <label htmlFor={`observerSelector${index}`}>
        Smer: {(index - 3) * 15}° :
      </label>
      <Select
        isMulti
        name={`observerSelector${index}`}
        options={observerIds}
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={handleChange}
        value={selectedObserverIds}
        styles={{
          option: (provided) => ({
            ...provided,
            color: "black", // This sets the dropdown options' font color to black
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "black", // This sets the selected item's font color to black
          }),
          // control: (provided) => ({
          //   ...provided,
          //   width: "50%", // Set the width of the Select component to 50%
          // }),
          // Add more custom styles if needed
        }}
      />
    </>
  );
};

export default ObserverSelector;
