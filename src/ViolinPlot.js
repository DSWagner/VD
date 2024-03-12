import React, { useEffect } from "react";
import Plot from "plotly.js-dist-min";

const ViolinPlot = ({ modelFileName }) => {
  useEffect(() => {
    async function fetchJsonData(modelFileName) {
      //   console.log(modelFileName);
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

    function extractViolinPlotData(jsonData) {
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        return [];
      }

      const groupedByDirection = jsonData.reduce((acc, obj) => {
        const direction = obj.condition.direction;
        if (!acc[direction]) {
          acc[direction] = [];
        }
        acc[direction].push(obj);
        return acc;
      }, {});

      const violinPlotData = Object.keys(groupedByDirection).map(
        (direction) => {
          const objs = groupedByDirection[direction];
          const values = objs.map((obj) => {
            const totalDuration = obj.fixations.reduce(
              (acc, fixation) => acc + fixation.duration / 1000,
              0
            );
            const averageDuration =
              obj.fixations.length > 0
                ? totalDuration / obj.fixations.length
                : 0;
            return averageDuration;
          });
          // Apply the formula to transform the direction value
          const transformedDirection = `${(direction - 3) * 15}°`;
          return { name: transformedDirection, values };
        }
      );

      return violinPlotData;
    }

    // Define an async function inside useEffect
    const fetchData = async () => {
      const jsonData = await fetchJsonData(modelFileName);
      if (jsonData) {
        // console.log(jsonData);

        const violin_data = extractViolinPlotData(jsonData);
        // console.log(violin_data);

        const plotData = violin_data.map((item) => ({
          type: "violin",
          y: item.values,
          name: item.name,
          box: {
            visible: true,
          },
          meanline: {
            visible: true,
          },
        }));

        const layout = {
          title: "Huslové Grafy",
          xaxis: {
            tickmode: "array",
            tickvals: violin_data.map((item, index) => index), // Assuming you want to display all violin plots
            ticktext: violin_data.map((item) => item.name), // The names of your violin plots
            title: "Direction",
            // gridcolor: "#e0e0e0",
          },
          yaxis: {
            zeroline: false,
            title: "Avg. Fixation Duration/Observer (s)",
            // gridcolor: "#e0e0e0",
          },
          paper_bgcolor: "#19191e", // Example background color
          plot_bgcolor: "#19191e", // Example background color
          font: {
            color: "#e0e0e0", // Set the global font color to white
            // family: "Arial, sans-serif", // Optionally, set the font family
            // size: 12, // Optionally, set the font size
          },
        };

        Plot.newPlot("violinPlot", plotData, layout);
      } else {
        console.log("Failed to fetch JSON data.");
      }
    };

    fetchData();
  }, [modelFileName]);

  return <div id="violinPlot"></div>;
};

export default ViolinPlot;
