import React, { useEffect, useRef } from 'react';
import Plot from "plotly.js-dist-min";


const GroupedBarChart = ({tableData, directionColors}) => {
    useEffect(() => {
        const labels = ['-45', '-30', '-15', '0', '15', '30', '45'];
        const labeledColors = labels.map((label, index) => [label, directionColors[index]]);
        console.log(labeledColors);
        const processData = () => {
            console.log(directionColors[0]);
            const data = tableData.slice(1);
            const dataLabels= [];
            const minFix = [];
            const avgFix = [];
            const maxFix = [];
            let minFixAvg = [];
            let avgFixAvg = [];
            let maxFixAvg = [];
            data.forEach(element => {
               if(!dataLabels.includes(element[3])){
                dataLabels.push(element[3]);
                minFix.push([element[5]]);
                avgFix.push([element[6]]);
                maxFix.push([element[7]]);
                //console.log(labels.indexOf(element[3]))
               }
               else{
                minFix[dataLabels.indexOf(element[3])].push(element[5]);
                avgFix[dataLabels.indexOf(element[3])].push(element[6]);
                maxFix[dataLabels.indexOf(element[3])].push(element[7]);
                //console.log(labels.indexOf(element[3]))
               } 
            });

            function calculateAverage(dataArray) {
                return dataArray.map(element => {
                    const sum = element.reduce((acc, val) => acc + parseFloat(val), 0);
                    const mean = element.length > 0 ? (sum / element.length).toFixed(2) : "0.00";
                    return mean;
                });
            }

            minFixAvg = calculateAverage(minFix);
            avgFixAvg = calculateAverage(avgFix);
            maxFixAvg = calculateAverage(maxFix);

            return {
                labels: dataLabels,
                datasets: [
                    { label: 'Min Fix', data: minFixAvg, backgroundColor: 'rgba(76,201,240, 0.5)' },
                    { label: 'Avg Fix', data: avgFixAvg, backgroundColor: 'rgba(133,235,217, 0.5)' },
                    { label: 'Max Fix', data: maxFixAvg, backgroundColor: 'rgba(247,37,133, 0.5)' }
                ]
                
            };
        }
        const plotData = processData();
      
        const layout = {
            title: "Table Visualization",
            barmode: 'group',
            plot_bgcolor: '#19191e',
            paper_bgcolor: "#19191e",
            font: {
                color: "#e0e0e0",
              },
              xaxis: {
                tickfont: {
                    //color: directionColors, // Replace 'desiredColor' with the color you want for the X-axis labels
                    size: 16 // Optional: Adjust the font size as needed
                }
            },
        }

        Plot.newPlot('tableVizualization', plotData.datasets.map(dataset => ({
            x: plotData.labels,
            y: dataset.data,
            backgroundColor: 'black',
            type: 'bar',
            name: dataset.label,
            font: {
                size: 16,
                color: "#e0e0e0",
              },
            marker: { 
                color: dataset.backgroundColor,
                font: {
                    size: 16,
                    color: "#e0e0e0",
                  }, }
        })), layout);
        const updateColors = () => {
            const tickLabels = document.querySelectorAll('.xtick text');
            tickLabels.forEach((label) => {
                const labelWithoutDegree = label.textContent.replace('°', '');
                const foundPair = labeledColors.find(pair => pair[0] === labelWithoutDegree);
                if (foundPair) {
                    label.style.fill = foundPair[1];
                }
            });
        }
        updateColors(); // Initial color application

        document.querySelector('#tableVizualization').on('plotly_restyle', () => {
            updateColors(); // Reapply colors after plot interactions
        });


    }, [tableData, directionColors]); // Empty dependency array ensures this effect runs only once

    return <div id="tableVizualization"></div>;
};

export default GroupedBarChart;