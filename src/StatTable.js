// PolarHistogram.js
import React, { useEffect } from "react";

const StatTable = ({
  modelFileName,
  selectedObserverIds,
  tableData,
  setTableData,
}) => {
  useEffect(() => {
    async function fetchJsonData(modelFileName) {
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
        // Iterate through each object in jsonData
        let tmpTableData = [tableData[0]];
        jsonData.forEach((observer) => {
          // Check if the item has the attribute "observer id" and if it's included in selectedObserverIds
          if (
            observer["observer id"].toString() &&
            selectedObserverIds.some((idsArray) =>
              idsArray.includes(observer["observer id"])
            )
          ) {
            // Print the "observer id"
            console.log("STAT: ", observer["observer id"]);

            const model = observer.condition.model;
            const material = observer.condition.material;
            const direction = `${(observer.condition.direction - 3) * 15}°`;
            const fixations = observer["fixations"];
            const duration = (
              fixations.reduce((totalDuration, fixation) => {
                return totalDuration + fixation.duration;
              }, 0) / 1000
            ).toFixed(2);
            const minDuration = (
              Math.min(...fixations.map((fixation) => fixation.duration)) / 1000
            ).toFixed(2);
            const maxDuration = (
              Math.max(...fixations.map((fixation) => fixation.duration)) / 1000
            ).toFixed(2);
            const avgDuration = (duration / fixations.length).toFixed(2);
            // console.log(`ID poz.: ${observer["observer id"]}`);
            // console.log(`Model: ${model}`);
            // console.log(`Mat: ${material}`);
            // console.log(`Uhol: ${direction} (${(direction - 3) * 15}°)`);
            // console.log(`Dĺžka poz.: ${duration}s`);
            // console.log(`Min. čas fix.: ${minDuration}s`);
            // console.log(`Avg. čas fix.: ${avgDuration}s`);
            // console.log(`Max. čas fix.: ${maxDuration}s`);

            const row = [
              observer["observer id"],
              model,
              material,
              direction,
              duration,
              minDuration,
              avgDuration,
              maxDuration,
            ];
            console.log(row);
            // console.log(tableData);
            tmpTableData = [...tmpTableData, row];
            tmpTableData.sort((a, b) => {
              // First, compare the direction (index 3)
              const directionComparison = parseFloat(a[3]) - parseFloat(b[3]);
              if (directionComparison !== 0) {
                return directionComparison;
              }
              // If directions are equal, compare the material (index 2)
              // Assuming material is a string, use localeCompare for string comparison
              return a[2].localeCompare(b[2]);
            });
            console.log(tmpTableData);
            setTableData(tmpTableData);
          }
        });
      } else {
        console.log("Failed to fetch JSON data.");
      }
    };

    fetchData();
  }, [modelFileName, selectedObserverIds]); // Re-run the effect if data changes

  return (
    <table className="centered-table">
      <tbody>
        {tableData.map((rowData, rowIndex) => (
          <tr key={rowIndex}>
            {rowData.map((cellData, cellIndex) => (
              <td key={cellIndex}>{cellData}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatTable;
