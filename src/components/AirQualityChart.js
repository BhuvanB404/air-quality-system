import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Adjusted AQI formula
function getAdjustedAQI(aqi, temp, humidity) {
  // Temperature stress
  let tempStress = 1;
  if (temp < 15 || temp > 30) tempStress = 1.2;
  else if ((temp >= 15 && temp < 18) || (temp > 25 && temp <= 30)) tempStress = 1.1;

  // Humidity stress
  let humidityStress = 1;
  if (humidity < 30 || humidity > 70) humidityStress = 1.2;
  else if ((humidity >= 30 && humidity < 40) || (humidity > 60 && humidity <= 70)) humidityStress = 1.1;

  // Environmental Stress Factor
  const esf = tempStress * humidityStress;
  // Adjusted AQI
  return aqi * esf;
}

const AirQualityChart = ({ data, regionName }) => {
  // Ensure data exists and is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data">
          <h3>No data available for {regionName}</h3>
          <p>Please check if the sensor is active and sending data.</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }),
    datasets: [
      {
        label: 'Adjusted AQI (Temp & Humidity Weighted)',
        data: data.map(item => {
          const aqi = item.aqi || item.pollution_level || 0;
          const temp = item.temperature || 0;
          const humidity = item.humidity || 0;
          return Math.round(getAdjustedAQI(aqi, temp, humidity));
        }),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Raw AQI',
        data: data.map(item => item.aqi || item.pollution_level || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `Air Quality Data - ${regionName}`,
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Adjusted AQI',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        min: 0,
        max: Math.max(...data.map(item => {
          const aqi = item.aqi || item.pollution_level || 0;
          const temp = item.temperature || 0;
          const humidity = item.humidity || 0;
          return Math.round(getAdjustedAQI(aqi, temp, humidity));
        })) + 20
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Raw AQI',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        min: Math.min(...data.map(item => item.aqi || item.pollution_level || 0)) - 5,
        max: Math.max(...data.map(item => item.aqi || item.pollution_level || 0)) + 5
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Calculate current adjusted AQI and status
  const last = data[data.length - 1] || {};
  const rawAQI = last.aqi || last.pollution_level || 0;
  const temp = last.temperature || 0;
  const humidity = last.humidity || 0;
  const adjustedAQI = Math.round(getAdjustedAQI(rawAQI, temp, humidity));
  const isHarmful = adjustedAQI > 110;

  return (
    <div className="chart-container">
      <div className="aqi-status" style={{ backgroundColor: (isHarmful ? '#FF000020' : '#E8F5E8'), border: `2px solid ${isHarmful ? '#FF0000' : '#00E400'}` }}>
        <h3>Current Adjusted AQI: {adjustedAQI}</h3>
        <p>Status: {isHarmful ? 'Harmful' : 'Not Harmful'} (Temp/Humidity Weighted)</p>
      </div>
      <div style={{ height: '400px', marginTop: '20px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AirQualityChart; 