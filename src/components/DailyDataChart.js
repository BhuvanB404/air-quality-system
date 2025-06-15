import React, { useState } from 'react';
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
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2';

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
  ArcElement,
  RadialLinearScale
);

const DailyDataChart = ({ data, regionName }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedChart, setSelectedChart] = useState('all');

  // Ensure data exists and is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="daily-data-chart">
        <div className="no-data">
          <h3>No data available for {regionName}</h3>
          <p>Please check if the sensor is active and sending data.</p>
        </div>
      </div>
    );
  }

  // Process data based on selected time range
  const getFilteredData = () => {
    switch (selectedTimeRange) {
      case '6h':
        return data.slice(-6);
      case '12h':
        return data.slice(-12);
      case '24h':
      default:
        return data.slice(-24);
      case '48h':
        return data.slice(-48);
      case '7d':
        return data.slice(-168); // 7 days * 24 hours
    }
  };

  const filteredData = getFilteredData();
  
  // Create time labels
  const timeLabels = filteredData.map(item => {
    const date = new Date(item.timestamp);
    if (selectedTimeRange === '7d') {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        hour12: true 
      });
    }
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  });

  // Extract data series
  const aqiData = filteredData.map(item => item.aqi || item.pollution_level || 0);
  const temperatureData = filteredData.map(item => item.temperature || 0);
  const humidityData = filteredData.map(item => item.humidity || 0);
  const pm25Data = filteredData.map(item => item.pm25 || 0);
  const pm10Data = filteredData.map(item => item.pm10 || 0);
  const co2Data = filteredData.map(item => item.co2 || 0);
  const vocData = filteredData.map(item => item.voc || 0);

  // Main line chart configuration
  const lineChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Air Quality Index',
        data: aqiData,
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FF6B6B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        yAxisID: 'y'
      },
      {
        label: 'Temperature (°C)',
        data: temperatureData,
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#4ECDC4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1'
      },
      {
        label: 'Humidity (%)',
        data: humidityData,
        borderColor: '#45B7D1',
        backgroundColor: 'rgba(69, 183, 209, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#45B7D1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y2'
      }
    ]
  };

  // Bar chart for particulate matter
  const barChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'PM2.5 (μg/m³)',
        data: pm25Data,
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: '#FFC107',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'PM10 (μg/m³)',
        data: pm10Data,
        backgroundColor: 'rgba(156, 39, 176, 0.8)',
        borderColor: '#9C27B0',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Radar chart for environmental overview
  const radarChartData = {
    labels: ['AQI', 'Temperature', 'Humidity', 'PM2.5', 'PM10', 'CO2', 'VOC'],
    datasets: [
      {
        label: 'Current Values',
        data: [
          aqiData[aqiData.length - 1] || 0,
          temperatureData[temperatureData.length - 1] || 0,
          humidityData[humidityData.length - 1] || 0,
          pm25Data[pm25Data.length - 1] || 0,
          pm10Data[pm10Data.length - 1] || 0,
          co2Data[co2Data.length - 1] || 0,
          vocData[vocData.length - 1] || 0
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }
    ]
  };

  // Scatter plot for correlation analysis
  const scatterChartData = {
    datasets: [
      {
        label: 'AQI vs Temperature',
        data: aqiData.map((aqi, index) => ({
          x: temperatureData[index] || 0,
          y: aqi || 0
        })),
        backgroundColor: 'rgba(255, 107, 107, 0.6)',
        borderColor: '#FF6B6B',
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'AQI vs Humidity',
        data: aqiData.map((aqi, index) => ({
          x: humidityData[index] || 0,
          y: aqi || 0
        })),
        backgroundColor: 'rgba(69, 183, 209, 0.6)',
        borderColor: '#45B7D1',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  // Heatmap-style data for hourly patterns
  const createHourlyHeatmapData = () => {
    const hourlyData = {};
    filteredData.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(item.aqi || item.pollution_level || 0);
    });

    const heatmapLabels = Object.keys(hourlyData).sort((a, b) => parseInt(a) - parseInt(b));
    const heatmapData = heatmapLabels.map(hour => {
      const values = hourlyData[hour];
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return {
      labels: heatmapLabels.map(hour => `${hour}:00`),
      datasets: [{
        label: 'Average AQI by Hour',
        data: heatmapData,
        backgroundColor: heatmapData.map(aqi => {
          if (aqi <= 50) return 'rgba(0, 228, 0, 0.8)';
          if (aqi <= 100) return 'rgba(255, 255, 0, 0.8)';
          if (aqi <= 150) return 'rgba(255, 126, 0, 0.8)';
          if (aqi <= 200) return 'rgba(255, 0, 0, 0.8)';
          return 'rgba(143, 63, 151, 0.8)';
        }),
        borderColor: heatmapData.map(aqi => {
          if (aqi <= 50) return '#00E400';
          if (aqi <= 100) return '#FFFF00';
          if (aqi <= 150) return '#FF7E00';
          if (aqi <= 200) return '#FF0000';
          return '#8F3F97';
        }),
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  const heatmapData = createHourlyHeatmapData();

  // Line chart options
  const lineChartOptions = {
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
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: `Environmental Data - ${regionName}`,
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
        borderColor: '#FF6B6B',
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
          text: `Time (Last ${selectedTimeRange})`,
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
        max: Math.max(...aqiData) + 20
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
        min: Math.min(...temperatureData) - 5,
        max: Math.max(...temperatureData) + 5
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

  // Bar chart options
  const barChartOptions = {
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
            weight: '600'
          }
        }
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
          text: 'Concentration (μg/m³)',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  // Radar chart options
  const radarChartOptions = {
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
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Environmental Overview',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  // Scatter chart options
  const scatterChartOptions = {
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
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Correlation Analysis',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Temperature (°C) / Humidity (%)',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'AQI',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  // Heatmap chart options
  const heatmapChartOptions = {
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
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Hourly AQI Patterns',
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
          text: 'Average AQI',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  // AQI status function
  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { status: 'Good', color: '#00E400', bgColor: '#E8F5E8' };
    if (aqi <= 100) return { status: 'Moderate', color: '#FFFF00', bgColor: '#FFFFF0' };
    if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: '#FF7E00', bgColor: '#FFF4E6' };
    if (aqi <= 200) return { status: 'Unhealthy', color: '#FF0000', bgColor: '#FFE6E6' };
    if (aqi <= 300) return { status: 'Very Unhealthy', color: '#8F3F97', bgColor: '#F0E6F0' };
    return { status: 'Hazardous', color: '#7E0023', bgColor: '#F0E6E6' };
  };

  const currentData = filteredData[filteredData.length - 1];
  const currentAQI = currentData?.aqi || currentData?.pollution_level || 0;
  const aqiStatus = getAQIStatus(currentAQI);

  // Calculate statistics
  const avgAQI = Math.round(aqiData.reduce((sum, val) => sum + val, 0) / aqiData.length);
  const avgTemp = Math.round(temperatureData.reduce((sum, val) => sum + val, 0) / temperatureData.length);
  const avgHumidity = Math.round(humidityData.reduce((sum, val) => sum + val, 0) / humidityData.length);
  const maxAQI = Math.max(...aqiData);
  const minAQI = Math.min(...aqiData);
  const maxTemp = Math.max(...temperatureData);
  const minTemp = Math.min(...temperatureData);

  // Calculate trends
  const calculateTrend = (data) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const earlier = data.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const change = ((recent - earlier) / earlier) * 100;
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const aqiTrend = calculateTrend(aqiData);
  const tempTrend = calculateTrend(temperatureData);

  // Doughnut chart for current AQI
  const doughnutData = {
    labels: ['Current AQI', 'Remaining'],
    datasets: [
      {
        data: [currentAQI, Math.max(0, 500 - currentAQI)],
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

  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'line':
        return <Line data={lineChartData} options={lineChartOptions} />;
      case 'bar':
        return <Bar data={barChartData} options={barChartOptions} />;
      case 'radar':
        return <Radar data={radarChartData} options={radarChartOptions} />;
      case 'scatter':
        return <Scatter data={scatterChartData} options={scatterChartOptions} />;
      case 'heatmap':
        return <Bar data={heatmapData} options={heatmapChartOptions} />;
      default:
        return null;
    }
  };

  return (
    <div className="daily-data-chart">
      {/* Controls */}
      <div className="chart-controls">
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)}>
            <option value="6h">Last 6 Hours</option>
            <option value="12h">Last 12 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="48h">Last 48 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
        
        <div className="chart-selector">
          <label>Chart Type:</label>
          <select value={selectedChart} onChange={(e) => setSelectedChart(e.target.value)}>
            <option value="all">All Charts</option>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="radar">Radar Chart</option>
            <option value="scatter">Correlation Analysis</option>
            <option value="heatmap">Hourly Patterns</option>
          </select>
        </div>
      </div>

      {/* Header with current status */}
      <div className="chart-header">
        <div className="current-status" style={{ backgroundColor: aqiStatus.bgColor, borderColor: aqiStatus.color }}>
          <h3>Current Status: {aqiStatus.status}</h3>
          <div className="status-details">
            <div className="aqi-display">
              <span className="aqi-value" style={{ color: aqiStatus.color }}>
                {currentAQI}
              </span>
              <span className="aqi-label">AQI</span>
            </div>
            <div className="doughnut-chart">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
          <div className="trend-indicator">
            <span className={`trend ${aqiTrend}`}>
              {aqiTrend === 'increasing' ? '↗' : aqiTrend === 'decreasing' ? '↘' : '→'} {aqiTrend}
            </span>
          </div>
        </div>
        
        <div className="averages-grid">
          <div className="average-card">
            <h4>Average AQI</h4>
            <p>{avgAQI}</p>
            <small>{selectedTimeRange} average</small>
          </div>
          <div className="average-card">
            <h4>Average Temp</h4>
            <p>{avgTemp}°C</p>
            <small>{selectedTimeRange} average</small>
          </div>
          <div className="average-card">
            <h4>Average Humidity</h4>
            <p>{avgHumidity}%</p>
            <small>{selectedTimeRange} average</small>
          </div>
        </div>
      </div>

      {/* Main charts container */}
      <div className="charts-container">
        {selectedChart === 'all' ? (
          <>
            <div className="main-chart">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
            
            <div className="secondary-charts">
              <div className="particulate-chart">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
              
              <div className="radar-chart">
                <Radar data={radarChartData} options={radarChartOptions} />
              </div>
              
              <div className="correlation-chart">
                <Scatter data={scatterChartData} options={scatterChartOptions} />
              </div>
              
              <div className="heatmap-chart">
                <Bar data={heatmapData} options={heatmapChartOptions} />
              </div>
            </div>
          </>
        ) : (
          <div className="single-chart">
            {renderSelectedChart()}
          </div>
        )}
      </div>

      {/* Data summary */}
      <div className="data-summary">
        <h4>📊 Data Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Peak AQI:</span>
            <span className="value">{maxAQI}</span>
          </div>
          <div className="summary-item">
            <span className="label">Lowest AQI:</span>
            <span className="value">{minAQI}</span>
          </div>
          <div className="summary-item">
            <span className="label">Max Temperature:</span>
            <span className="value">{maxTemp}°C</span>
          </div>
          <div className="summary-item">
            <span className="label">Min Temperature:</span>
            <span className="value">{minTemp}°C</span>
          </div>
          <div className="summary-item">
            <span className="label">Data Points:</span>
            <span className="value">{filteredData.length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Time Range:</span>
            <span className="value">{selectedTimeRange}</span>
          </div>
          <div className="summary-item">
            <span className="label">AQI Trend:</span>
            <span className={`value trend ${aqiTrend}`}>
              {aqiTrend === 'increasing' ? '↗' : aqiTrend === 'decreasing' ? '↘' : '→'} {aqiTrend}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Temperature Trend:</span>
            <span className={`value trend ${tempTrend}`}>
              {tempTrend === 'increasing' ? '↗' : tempTrend === 'decreasing' ? '↘' : '→'} {tempTrend}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDataChart; 