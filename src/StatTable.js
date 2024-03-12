// PolarHistogram.js
import React, { useEffect } from "react";

const StatTable = ({ modelFileName }) => {
  useEffect(() => {
    async function fetchJsonData(modelFileName) {
      console.log(modelFileName);
      // Replace the .stl extension with .json
      const jsonFileName = modelFileName.replace(".stl", ".json");
      // Construct the path to the JSON file
      const jsonFilePath = `${process.env.PUBLIC_URL}/Dataset/gazePerObject/${jsonFileName}`;

      try {
        // Use the fetch API to get the JSON file
        const response = await fetch(jsonFilePath);
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON in the response
        const data = await response.json();
        // Return the parsed data
        return data;
      } catch (error) {
        console.error("Error fetching JSON data:", error);
        return null; // or handle the error as needed
      }
    }

    // Define an async function inside useEffect
    const fetchData = async () => {
      const jsonData = await fetchJsonData(modelFileName);
      if (jsonData) {
        console.log(jsonData);
      } else {
        console.log("Failed to fetch JSON data.");
      }
    };

    fetchData();

    // Plot.newPlot("polarHistogram", plotData, layout);
  }, [modelFileName]); // Re-run the effect if data changes
};

export default StatTable;
