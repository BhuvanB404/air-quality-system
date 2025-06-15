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

const AirQualityChart = ({ data, regionName }) => {
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
        label: 'Air Quality Index (AQI)',
        data: data.map(item => item.aqi),
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
        label: 'Temperature (°C)',
        data: data.map(item => item.temperature),
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
          text: 'AQI',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        min: 0,
        max: Math.max(...data.map(item => item.aqi)) + 20
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        min: Math.min(...data.map(item => item.temperature)) - 5,
        max: Math.max(...data.map(item => item.temperature)) + 5
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { status: 'Good', color: '#00E400' };
    if (aqi <= 100) return { status: 'Moderate', color: '#FFFF00' };
    if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
    if (aqi <= 200) return { status: 'Unhealthy', color: '#FF0000' };
    if (aqi <= 300) return { status: 'Very Unhealthy', color: '#8F3F97' };
    return { status: 'Hazardous', color: '#7E0023' };
  };

  const currentAQI = data[data.length - 1]?.aqi;
  const aqiStatus = getAQIStatus(currentAQI);

  return (
    <div className="chart-container">
      <div className="aqi-status" style={{ backgroundColor: aqiStatus.color + '20', border: `2px solid ${aqiStatus.color}` }}>
        <h3>Current AQI: {currentAQI}</h3>
        <p>Status: {aqiStatus.status}</p>
      </div>
      <div style={{ height: '400px', marginTop: '20px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AirQualityChart; 