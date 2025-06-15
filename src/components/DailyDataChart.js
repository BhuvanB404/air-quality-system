import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const DailyDataChart = ({ data, regionName }) => {
  // Process data for the last 24 hours
  const last24Hours = data.slice(-24);
  
  const chartData = {
    labels: last24Hours.map(item => {
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
        data: last24Hours.map(item => item.aqi),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y'
      },
      {
        label: 'Temperature (°C)',
        data: last24Hours.map(item => item.temperature),
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
      },
      {
        label: 'Humidity (%)',
        data: last24Hours.map(item => item.humidity),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y2'
      }
    ]
  };

  const barData = {
    labels: last24Hours.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        hour12: true 
      });
    }),
    datasets: [
      {
        label: 'PM2.5 (μg/m³)',
        data: last24Hours.map(item => item.pm25 || 0),
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 1
      },
      {
        label: 'PM10 (μg/m³)',
        data: last24Hours.map(item => item.pm10 || 0),
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1
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
        text: `24-Hour Air Quality Data - ${regionName}`,
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
          text: 'Time (Last 24 Hours)',
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
        max: Math.max(...last24Hours.map(item => item.aqi)) + 20
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
        min: Math.min(...last24Hours.map(item => item.temperature)) - 5,
        max: Math.max(...last24Hours.map(item => item.temperature)) + 5
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Particulate Matter Levels',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Concentration (μg/m³)'
        }
      }
    }
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { status: 'Good', color: '#00E400', bgColor: '#E8F5E8' };
    if (aqi <= 100) return { status: 'Moderate', color: '#FFFF00', bgColor: '#FFFFF0' };
    if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: '#FF7E00', bgColor: '#FFF4E6' };
    if (aqi <= 200) return { status: 'Unhealthy', color: '#FF0000', bgColor: '#FFE6E6' };
    if (aqi <= 300) return { status: 'Very Unhealthy', color: '#8F3F97', bgColor: '#F0E6F0' };
    return { status: 'Hazardous', color: '#7E0023', bgColor: '#F0E6E6' };
  };

  const currentData = last24Hours[last24Hours.length - 1];
  const aqiStatus = getAQIStatus(currentData?.aqi);

  // Calculate averages
  const avgAQI = Math.round(last24Hours.reduce((sum, item) => sum + item.aqi, 0) / last24Hours.length);
  const avgTemp = Math.round(last24Hours.reduce((sum, item) => sum + item.temperature, 0) / last24Hours.length);
  const avgHumidity = Math.round(last24Hours.reduce((sum, item) => sum + item.humidity, 0) / last24Hours.length);

  // Create doughnut chart data for current status
  const doughnutData = {
    labels: ['Current AQI', 'Remaining'],
    datasets: [
      {
        data: [currentData?.aqi || 0, Math.max(0, 500 - (currentData?.aqi || 0))],
        backgroundColor: [
          aqiStatus.color,
          '#f0f0f0'
        ],
        borderWidth: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="daily-data-chart">
      <div className="chart-header">
        <div className="current-status" style={{ backgroundColor: aqiStatus.bgColor, borderColor: aqiStatus.color }}>
          <h3>Current Status: {aqiStatus.status}</h3>
          <div className="status-details">
            <div className="aqi-display">
              <span className="aqi-value" style={{ color: aqiStatus.color }}>
                {currentData?.aqi || 0}
              </span>
              <span className="aqi-label">AQI</span>
            </div>
            <div className="doughnut-chart">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
        
        <div className="averages-grid">
          <div className="average-card">
            <h4>24h Average AQI</h4>
            <p>{avgAQI}</p>
          </div>
          <div className="average-card">
            <h4>24h Average Temp</h4>
            <p>{avgTemp}°C</p>
          </div>
          <div className="average-card">
            <h4>24h Average Humidity</h4>
            <p>{avgHumidity}%</p>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="main-chart">
          <Line data={chartData} options={options} />
        </div>
        
        <div className="particulate-chart">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="data-summary">
        <h4>📊 Data Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Peak AQI:</span>
            <span className="value">{Math.max(...last24Hours.map(item => item.aqi))}</span>
          </div>
          <div className="summary-item">
            <span className="label">Lowest AQI:</span>
            <span className="value">{Math.min(...last24Hours.map(item => item.aqi))}</span>
          </div>
          <div className="summary-item">
            <span className="label">Max Temperature:</span>
            <span className="value">{Math.max(...last24Hours.map(item => item.temperature))}°C</span>
          </div>
          <div className="summary-item">
            <span className="label">Min Temperature:</span>
            <span className="value">{Math.min(...last24Hours.map(item => item.temperature))}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDataChart; 