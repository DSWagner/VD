// PolarHistogram.js
import React, { useEffect } from "react";
import Plot from "plotly.js-dist-min";

const PolarHistogram = ({ modelFileName }) => {
  useEffect(() => {
    const processData = (data) => {
      // Process your data here to fit the polar histogram requirements
      // This is a placeholder function, adapt it based on your actual data structure
      return data.map((item) => ({
        r: item.values,
        theta: item.directions,
        type: "barpolar",
        marker: {
          line: {
            color: "#e0e0e0", // This sets the outline color to black
            width: 1, // This sets the outline width. Adjust as needed.
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
        const direction = (observer.condition.direction - 3) * 15;
        const fixations = observer.fixations;

        if (!directionGroups[direction]) {
          directionGroups[direction] = [];
        }

        let totalDuration = 0;
        fixations.forEach((fixation) => {
          totalDuration += fixation.duration;
        });
        const averageDuration = totalDuration / 1000 / fixations.length;

        directionGroups[direction].push(averageDuration);
      });

      // Initialize arrays for values and directions
      const values = [];
      const directions = [];

      // Populate the arrays
      Object.keys(directionGroups).forEach((direction) => {
        const total = directionGroups[direction].reduce(
          (sum, curr) => sum + curr,
          0
        );
        const average = total / directionGroups[direction].length;
        values.push(average);
        directions.push(direction);
      });

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
              gridcolor: "#19191e",
              title: "Priemerná dĺžka fixácií",
            },
            angularaxis: {
              direction: "clockwise",
              tickmode: "array",
              tickvals: [315, 330, 345, 0, 15, 30, 45],
              ticktext: ["-45°", "-30°", "-15°", "0°", "15°", "30°", "45°"],
              gridcolor: "#19191e",
            },
            bgcolor: "#19191e",
          },
          paper_bgcolor: "#19191e", // Example background color
          plot_bgcolor: "#19191e", // Example background color
          font: {
            color: "#e0e0e0", // Set the global font color to white
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
                color: "#e0e0e0",
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

    // const polarHistogramData =
    // // [
    // //   {
    // //     values: [90, 70, 80, 100],
    // //     directions: ["N", "E", "S", "W"],
    // //     type: "barpolar",
    // //   },
    // //   // Add more items as needed
    // // ];

    // const plotData = processData(polarHistogramData);

    // const layout = {
    //   title: "Polar Histogram",
    //   font: { size: 16 },
    //   polar: {
    //     barmode: "overlay",
    //     bargap: 0,
    //     radialaxis: { ticksuffix: "%", angle: 45 },
    //     angularaxis: { direction: "clockwise" },
    //   },
    //   paper_bgcolor: "white",
    // };

    // Plot.newPlot("polarHistogram", plotData, layout);
  }, [modelFileName]); // Re-run the effect if data changes

  return <div id="polarHistogram"></div>;
};

export default PolarHistogram;
