import React, { useState, useEffect } from "react";
import VisualRepresentation from "./visual_representation/VisualRepresentation";

const ModelSelector = ({ onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
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
