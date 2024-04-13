import React, { useState, useEffect } from "react";
import Select from "react-select";

const ObserverSelector = ({ modelFileName, onObserverSelected, index }) => {
  const [observerIds, setObserverIds] = useState([]);
  const [selectedObserverIds, setSelectedObserverIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const jsonFilename = modelFileName.replace(".stl", ".json");
    fetch(`${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFilename}`)
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter(
          (item) => item["condition"]["direction"] === index
        );
        const ids = filteredData.map((item) => ({
          value: item["observer id"],
          label: item["observer id"],
        }));
        setObserverIds(ids);
      })
      .catch((error) => console.error("Failed to load observer IDs:", error));
  }, [modelFileName, index]);

  useEffect(() => {
    if (selectAll) {
      setSelectedObserverIds(observerIds);
    } else {
      setSelectedObserverIds([]);
    }
  }, [selectAll]); // This effect runs when modelFileName changes

  useEffect(() => {
    setObserverIds([]); // Clear all observer IDs
    setSelectedObserverIds([]); // Clear selected observer IDs
    setSelectAll(false); // Uncheck the "Select All" checkbox
  }, [modelFileName]); // This effect runs when modelFileName changes

  const handleCheckboxChange = (event) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      setSelectedObserverIds(observerIds);
      onObserverSelected(observerIds.map((option) => option.value));
    } else {
      setSelectedObserverIds([]);
      onObserverSelected([]);
    }
  };

  const handleChange = (selectedOptions) => {
    setSelectedObserverIds(selectedOptions);
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
            color: "black",
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "black",
          }),
        }}
      />
      <label>
        Zvoliť všetkých
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleCheckboxChange}
        />
      </label>
    </>
  );
};

export default ObserverSelector;
