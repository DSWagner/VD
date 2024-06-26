// PolarHistogram.js
import React, { useEffect } from "react";
import Plot from "plotly.js-dist-min";

const PolarHistogram = ({
  modelFileName,
  directionColors,
  isSelected,
  selectedObserverIds,
}) => {
  useEffect(() => {
    const processData = (data) => {
      console.log(data);
      return data.map((item, index) => ({
        r: item.values,
        theta: item.directions,
        type: "barpolar",
        marker: {
          color: item.directions.map(
            (direction) => directionColors[direction / 15 + 3] || "#ffffff"
          ), // Adjust the index calculation as per your direction logic
          line: {
            color: "#000000",
            width: 1,
          },
        },
      }));
    };

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

    function extractPolarHistogramData(jsonData) {
      const directionGroups = {};

      jsonData.forEach((observer) => {
        const trueDirection = observer.condition.direction;
        const direction = (observer.condition.direction - 3) * 15;
        const fixations = observer.fixations;
        if (isSelected) {
          if (
            selectedObserverIds[trueDirection].includes(observer["observer id"])
          ) {
            if (!directionGroups[direction]) {
              directionGroups[direction] = [];
            }

            let totalDuration = 0;
            fixations.forEach((fixation) => {
              totalDuration += fixation.duration;
            });
            const averageDuration = totalDuration / 1000 / fixations.length;

            directionGroups[direction].push(averageDuration);
          }
        } else {
          if (!directionGroups[direction]) {
            directionGroups[direction] = [];
          }

          let totalDuration = 0;
          fixations.forEach((fixation) => {
            totalDuration += fixation.duration;
          });
          const averageDuration = totalDuration / 1000 / fixations.length;

          directionGroups[direction].push(averageDuration);
        }
      });

      // Convert directionGroups object to an array of [key, value] pairs
      const directionGroupsArray = Object.entries(directionGroups);

      // Sort the array based on the numeric value of the keys (directions)
      directionGroupsArray.sort((a, b) => Number(a[0]) - Number(b[0]));

      // Initialize arrays for values and directions
      const values = [];
      const directions = [];

      // Populate the arrays using the sorted directionGroupsArray
      directionGroupsArray.forEach(([direction, group]) => {
        const total = group.reduce((sum, curr) => sum + curr, 0);
        const average = total / group.length;
        values.push(average);
        directions.push(direction);
      });

      console.log(values);
      console.log(directions);

      // Return the new structure
      return [
        {
          values: values,
          directions: directions,
          type: "barpolar",
        },
      ];
    }

    // Define an async function inside useEffect
    const fetchData = async () => {
      const jsonData = await fetchJsonData(modelFileName);
      const directionGroups = {};
      if (jsonData) {
        console.log(jsonData);

        // const tmp = extractPolarHistogramData(jsonData);
        // console.log(tmp);

        const polarHistogramData = extractPolarHistogramData(jsonData);
        console.log(polarHistogramData);

        const plotData = processData(polarHistogramData);

        const layout = {
          title: "Polárny Histogram",
          font: { size: 16 },
          polar: {
            barmode: "overlay",
            radialaxis: {
              ticksuffix: "s",
              angle: 0,
              gridcolor: "#ffffff",
              title: "Priemerná dĺžka fixácií",
            },
            angularaxis: {
              direction: "clockwise",
              tickmode: "array",
              tickvals: [315, 330, 345, 0, 15, 30, 45],
              ticktext: ["-45°", "-30°", "-15°", "0°", "15°", "30°", "45°"],
              gridcolor: "#ffffff",
            },
            bgcolor: "#ffffff",
          },
          paper_bgcolor: "#ffffff", // Example background color
          plot_bgcolor: "#ffffff", // Example background color
          font: {
            color: "#000000", // Set the global font color to white
            // family: "Arial, sans-serif", // Optionally, set the font family
            // size: 12, // Optionally, set the font size
          },
          annotations: [
            {
              text: "Smer", // The title you want to display
              showarrow: false,
              xref: "paper",
              yref: "paper",
              x: 0.5, // Center the text horizontally
              y: 1.05, // Position the text above the histogram
              xanchor: "center",
              yanchor: "bottom",
              font: {
                size: 16,
                color: "#000000",
              },
            },
          ],
        };

        Plot.newPlot("polarHistogram", plotData, layout);

        //   Plot.newPlot("polarHistogram", plotData, layout);
      } else {
        console.log("Failed to fetch JSON data.");
      }
    };

    fetchData();
  }, [modelFileName, directionColors, isSelected, selectedObserverIds]); // Re-run the effect if data changes

  return <div id="polarHistogram"></div>;
};

export default PolarHistogram;
