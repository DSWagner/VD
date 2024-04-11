import React, { useEffect, useRef } from 'react';
import { Chart, BarElement, CategoryScale, LinearScale, BarController } from 'chart.js';
import { element } from 'three/examples/jsm/nodes/Nodes.js';

const GroupedBarChart = (tableData, directionColors) => {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);
    let plotData = "";
    useEffect(() => {
        const processData = () => {
            const data = tableData.tableData.slice(1);
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

            plotData = {
                labels: dataLabels,
                datasets: [{
                    label: 'MinFix',
                    data: minFixAvg,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)'
                }, {
                    label: 'AvgFix',
                    data: avgFixAvg,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)'
                }, {
                  label: 'MixFix',
                  data: maxFixAvg,
                  backgroundColor: 'rgba(54, 235, 162, 0.2)'
              }]
            }
        }
        processData();
        Chart.register(BarElement, CategoryScale, LinearScale, BarController);
        // Initialize chart
        chartInstanceRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: plotData, // specify your data
            options: {} // specify your options// specify your options
        });

        // Cleanup function to destroy chart
        return () => {
            chartInstanceRef.current.destroy();
        };
    }, [tableData, directionColors]); // Empty dependency array ensures this effect runs only once

    return <canvas ref={canvasRef}></canvas>;
};

export default GroupedBarChart;