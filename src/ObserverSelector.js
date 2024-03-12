import React, { useState, useEffect } from "react";

const ObserverSelector = ({ modelFileName, onObserverSelected, index }) => {
  const [observerIds, setObserverIds] = useState([]);

  useEffect(() => {
    const jsonFilename = modelFileName.replace(".stl", ".json");
    fetch(`${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFilename}`)
      .then((response) => response.json())
      .then((data) => {
        // Filter items where ["condition"]["direction"] matches the index
        const filteredData = data.filter(
          (item) => item["condition"]["direction"] === index
        );
        // Extract "observer id" from the filtered items
        const ids = filteredData.map((item) => item["observer id"]);
        setObserverIds(ids);
      })
      .catch((error) => console.error("Failed to load observer IDs:", error));
  }, [modelFileName, index]); // Include index in the dependency array

  return (
    <select
      onChange={(e) => onObserverSelected(e.target.value)}
      defaultValue=""
      key={modelFileName} // Add this line
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

// import React, { useState, useEffect } from "react";

// const ObserverSelector = ({ modelFileName, onObserverSelected }) => {
//   const [observerIds, setObserverIds] = useState([]);

//   useEffect(() => {
//     const jsonFilename = modelFileName.replace(".stl", ".json");
//     fetch(`${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFilename}`)
//       .then((response) => response.json())
//       .then((data) => {
//         const ids = data.map((item) => item["observer id"]);
//         setObserverIds(ids);
//       })
//       .catch((error) => console.error("Failed to load observer IDs:", error));
//   }, [modelFileName]);

//   return (
//     <select
//       onChange={(e) => onObserverSelected(e.target.value)}
//       defaultValue=""
//       key={modelFileName} // Add this line
//     >
//       <option value="" disabled>
//         Select Observer ID
//       </option>
//       {observerIds.map((id) => (
//         <option key={id} value={id}>
//           {id}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default ObserverSelector;
