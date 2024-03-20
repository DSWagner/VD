import React, { useState, useEffect } from "react";
import VisualRepresentation from "./visual_representation/VisualRepresentation";

const ModelSelector = ({ onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch the file list from the public directory
    // fetch(`${process.env.PUBLIC_URL}/fileList.json`)
    //   .then((response) => {
    //     // Check if the response is ok (status in the range 200-299)
    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }
    //     return response.json();
    //   })
    //   .then((data) => setFiles(data))
    //   .catch((error) => console.error("Error fetching file list:", error));
    VisualRepresentation.getModels().then((data) => setFiles(data))
  }, []); // The empty array ensures this effect runs only once after the initial render

  const handleDropdownChange = (e) => {
    const selected = e.target.value;
    setSelectedFile(selected);
    onFileSelected(selected); // Notify parent component
  };

  return (
    <select value={selectedFile} onChange={handleDropdownChange}>
      <option value="">Select a File</option>
      {files.map((file, index) => (
        <option key={index} value={file}>
          {file}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;
