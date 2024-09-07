const ctx = document.getElementById('myChart').getContext('2d');

// Initialize chart data
const data = [];

// Initialize Chart.js chart
const myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
        label: 'Test Status',
        data: data,
        backgroundColor: [], // start with empty color
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        pointRadius: 5,
    }]},
    options: {
        scales: {
            x: {
                type: 'time', // Use time scale for date-time x-axis
                time: {
                    unit: 'minute', // Adjust unit as necessary
                    tooltipFormat: 'll HH:mm:ss'
                },
                title: {
                    display: true,
                    text: 'Date Time'
                }
            },
            y: {
                type: 'category', // Use category scale for categorical y-axis
                labels: ['test pass', 'test fail'], // Define the categories
                title: {
                    display: true,
                    text: 'Test Result'
                }
            }
        },
        plugins: {
            legend: {
              labels: {
                color: 'rgb(255, 99, 132)' // Color of the legend labels
              }
            }
        }
    }
});

// get color by logic
const getColor = (x, y) => {
    return y == 'test pass' ? 'green' : 'red';
};

// Establish WebSocket connection
const socket = new WebSocket('ws://localhost:8080'); // Ensure this URL matches your WebSocket server

socket.onmessage = function(event) {
    try {
        const newData = JSON.parse(event.data);

        // Check if data has the expected properties
        if (!newData || typeof newData.result !== 'string' || !newData.timestamp) {
            console.error('Invalid data received:', newData);
            return;
        }

        let yValue;
        switch (newData.result.trim().toLowerCase()) {
            case 'test pass':
                yValue = 'test pass';
                break;
            case 'test fail':
                yValue = 'test fail';
                break;
            default:
                console.error('Unknown test result:', newData.result);
                return; // Ignore unknown test results
        }

        // Convert timestamp to Date object
        const xValue = new Date(newData.timestamp);

        // Add new data point to chart
        const newPoint = {
            x: xValue,
            y: yValue
        };

        myChart.data.datasets[0].data.push(newPoint);
        myChart.data.datasets[0].backgroundColor.push(getColor(newPoint.x, newPoint.y));

        // Update chart without animation for real-time performance
        // myChart.update('none');
        myChart.update();
    } catch (error) {
        console.error('Error processing WebSocket message:', error);
    }
};
