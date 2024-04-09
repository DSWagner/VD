// import React, { useState, useEffect } from "react";

// const ObserverSelector = ({ modelFileName, onObserverSelected, index }) => {
//   const [observerIds, setObserverIds] = useState([]);

//   useEffect(() => {
//     const jsonFilename = modelFileName.replace(".stl", ".json");
//     fetch(`${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFilename}`)
//       .then((response) => response.json())
//       .then((data) => {
//         // Filter items where ["condition"]["direction"] matches the index
//         const filteredData = data.filter(
//           (item) => item["condition"]["direction"] === index
//         );
//         // Extract "observer id" from the filtered items
//         const ids = filteredData.map((item) => item["observer id"]);
//         setObserverIds(ids);
//       })
//       .catch((error) => console.error("Failed to load observer IDs:", error));
//   }, [modelFileName, index]); // Include index in the dependency array

//   return (
//     <>
//       <label htmlFor={`observerSelector${index}`}>
//         Smer: {(index - 3) * 15}° :
//       </label>
//       <select
//         onChange={(e) => onObserverSelected(e.target.value)}
//         defaultValue=""
//         key={modelFileName} // Add this line
//       >
//         <option value="" disabled>
//           ID pozorovateľa
//         </option>
//         {observerIds.map((id) => (
//           <option key={id} value={id}>
//             {id}
//           </option>
//         ))}
//       </select>
//     </>
//   );
// };

// export default ObserverSelector;

import React, { useState, useEffect } from "react";
import Select from "react-select";

const ObserverSelector = ({ modelFileName, onObserverSelected, index }) => {
  const [observerIds, setObserverIds] = useState([]);
  const [selectedObserverIds, setSelectedObserverIds] = useState([]);

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
    // Reset selectedObserverIds when modelFileName changes
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
