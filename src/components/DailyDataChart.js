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
  RadialLinearScale,
  BubbleController,
  PolarAreaController
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, Scatter, Bubble, PolarArea } from 'react-chartjs-2';

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
  RadialLinearScale,
  BubbleController,
  PolarAreaController
);

const DailyDataChart = ({ data, regionName }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedView, setSelectedView] = useState('overview');

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
        return data.slice(-168);
    }
  };

  const filteredData = getFilteredData();
  
  // Create time labels
  const timeLabels = filteredData.map(item => {
    const date = new Date(item.timestamp);
    if (selectedTimeRange === '7d') {
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
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

  // Bubble chart for environmental impact
  const bubbleChartData = {
    datasets: [
      {
        label: 'Environmental Impact',
        data: aqiData.map((aqi, index) => ({
          x: temperatureData[index] || 0,
          y: humidityData[index] || 0,
          r: Math.max(5, (aqi / 10) + 5)
        })),
        backgroundColor: aqiData.map(aqi => {
          if (aqi <= 50) return 'rgba(0, 228, 0, 0.6)';
          if (aqi <= 100) return 'rgba(255, 255, 0, 0.6)';
          if (aqi <= 150) return 'rgba(255, 126, 0, 0.6)';
          if (aqi <= 200) return 'rgba(255, 0, 0, 0.6)';
          return 'rgba(143, 63, 151, 0.6)';
        }),
        borderColor: aqiData.map(aqi => {
          if (aqi <= 50) return '#00E400';
          if (aqi <= 100) return '#FFFF00';
          if (aqi <= 150) return '#FF7E00';
          if (aqi <= 200) return '#FF0000';
          return '#8F3F97';
        }),
        borderWidth: 2
      }
    ]
  };

  // Polar area chart for environmental balance
  const polarAreaData = {
    labels: ['Air Quality', 'Temperature', 'Humidity', 'PM2.5', 'PM10', 'CO2', 'VOC'],
    datasets: [
      {
        label: 'Environmental Balance',
        data: [
          aqiData[aqiData.length - 1] || 0,
          temperatureData[temperatureData.length - 1] || 0,
          humidityData[humidityData.length - 1] || 0,
          pm25Data[pm25Data.length - 1] || 0,
          pm10Data[pm10Data.length - 1] || 0,
          co2Data[co2Data.length - 1] || 0,
          vocData[vocData.length - 1] || 0
        ],
        backgroundColor: [
          'rgba(255, 107, 107, 0.6)',
          'rgba(78, 205, 196, 0.6)',
          'rgba(69, 183, 209, 0.6)',
          'rgba(255, 193, 7, 0.6)',
          'rgba(156, 39, 176, 0.6)',
          'rgba(76, 175, 80, 0.6)',
          'rgba(255, 152, 0, 0.6)'
        ],
        borderColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#FFC107',
          '#9C27B0',
          '#4CAF50',
          '#FF9800'
        ],
        borderWidth: 2
      }
    ]
  };

  // Stacked area chart for cumulative impact
  const stackedAreaData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'PM2.5 Impact',
        data: pm25Data,
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.3)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'PM10 Impact',
        data: pm10Data,
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.3)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'CO2 Impact',
        data: co2Data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Horizontal bar chart for comparison
  const horizontalBarData = {
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
        backgroundColor: [
          'rgba(255, 107, 107, 0.8)',
          'rgba(78, 205, 196, 0.8)',
          'rgba(69, 183, 209, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(156, 39, 176, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(255, 152, 0, 0.8)'
        ],
        borderColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#FFC107',
          '#9C27B0',
          '#4CAF50',
          '#FF9800'
        ],
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Average Values',
        data: [
          aqiData.reduce((sum, val) => sum + val, 0) / aqiData.length,
          temperatureData.reduce((sum, val) => sum + val, 0) / temperatureData.length,
          humidityData.reduce((sum, val) => sum + val, 0) / humidityData.length,
          pm25Data.reduce((sum, val) => sum + val, 0) / pm25Data.length,
          pm10Data.reduce((sum, val) => sum + val, 0) / pm10Data.length,
          co2Data.reduce((sum, val) => sum + val, 0) / co2Data.length,
          vocData.reduce((sum, val) => sum + val, 0) / vocData.length
        ],
        backgroundColor: [
          'rgba(255, 107, 107, 0.4)',
          'rgba(78, 205, 196, 0.4)',
          'rgba(69, 183, 209, 0.4)',
          'rgba(255, 193, 7, 0.4)',
          'rgba(156, 39, 176, 0.4)',
          'rgba(76, 175, 80, 0.4)',
          'rgba(255, 152, 0, 0.4)'
        ],
        borderColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#FFC107',
          '#9C27B0',
          '#4CAF50',
          '#FF9800'
        ],
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Circular progress chart data
  const createCircularProgressData = () => {
    const currentAQI = aqiData[aqiData.length - 1] || 0;
    const maxAQI = 500;
    const percentage = (currentAQI / maxAQI) * 100;
    
    return {
      labels: ['Current AQI', 'Remaining'],
      datasets: [
        {
          data: [percentage, 100 - percentage],
          backgroundColor: [
            currentAQI <= 50 ? '#00E400' : 
            currentAQI <= 100 ? '#FFFF00' : 
            currentAQI <= 150 ? '#FF7E00' : 
            currentAQI <= 200 ? '#FF0000' : '#8F3F97',
            '#f0f0f0'
          ],
          borderWidth: 0,
          cutout: '70%'
        }
      ]
    };
  };

  // Bubble chart options
  const bubbleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' }
        }
      },
      title: {
        display: true,
        text: 'Environmental Impact Bubble Map',
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 30 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            return [
              `AQI: ${aqiData[index]}`,
              `Temperature: ${temperatureData[index]}°C`,
              `Humidity: ${humidityData[index]}%`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { size: 14, weight: 'bold' }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Humidity (%)',
          font: { size: 14, weight: 'bold' }
        }
      }
    }
  };

  // Polar area chart options
  const polarAreaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' }
        }
      },
      title: {
        display: true,
        text: 'Environmental Balance Overview',
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 30 }
      }
    }
  };

  // Stacked area chart options
  const stackedAreaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' }
        }
      },
      title: {
        display: true,
        text: 'Cumulative Environmental Impact',
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 30 }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `Time (Last ${selectedTimeRange})`,
          font: { size: 14, weight: 'bold' }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Impact Level',
          font: { size: 14, weight: 'bold' }
        }
      }
    }
  };

  // Horizontal bar chart options
  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '600' }
        }
      },
      title: {
        display: true,
        text: 'Environmental Parameters Comparison',
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 30 }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Value',
          font: { size: 14, weight: 'bold' }
        }
      }
    }
  };

  // Circular progress options
  const circularProgressOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
  const maxAQI = Math.max(...aqiData);
  const minAQI = Math.min(...aqiData);

  // Calculate environmental score
  const calculateEnvironmentalScore = () => {
    const aqiScore = Math.max(0, 100 - (currentAQI / 5));
    const tempScore = Math.max(0, 100 - Math.abs(temperatureData[temperatureData.length - 1] - 22) * 2);
    const humidityScore = Math.max(0, 100 - Math.abs(humidityData[humidityData.length - 1] - 50) * 1.5);
    return Math.round((aqiScore + tempScore + humidityScore) / 3);
  };

  const environmentalScore = calculateEnvironmentalScore();

  const renderSelectedView = () => {
    switch (selectedView) {
      case 'bubble':
        return <Bubble data={bubbleChartData} options={bubbleChartOptions} />;
      case 'polar':
        return <PolarArea data={polarAreaData} options={polarAreaOptions} />;
      case 'stacked':
        return <Line data={stackedAreaData} options={stackedAreaOptions} />;
      case 'comparison':
        return <Bar data={horizontalBarData} options={horizontalBarOptions} />;
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
        
        <div className="view-selector">
          <label>View Type:</label>
          <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
            <option value="overview">Overview</option>
            <option value="bubble">Impact Bubble Map</option>
            <option value="polar">Environmental Balance</option>
            <option value="stacked">Cumulative Impact</option>
            <option value="comparison">Parameters Comparison</option>
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
            <div className="circular-progress">
              <Doughnut data={createCircularProgressData()} options={circularProgressOptions} />
            </div>
          </div>
        </div>
        
        <div className="environmental-score">
          <div className="score-card">
            <h4>Environmental Score</h4>
            <div className="score-value" style={{ 
              color: environmentalScore >= 80 ? '#00E400' : 
                     environmentalScore >= 60 ? '#FFFF00' : 
                     environmentalScore >= 40 ? '#FF7E00' : '#FF0000' 
            }}>
              {environmentalScore}/100
            </div>
            <small>Overall environmental health</small>
          </div>
        </div>
      </div>

      {/* Main charts container */}
      <div className="charts-container">
        {selectedView === 'overview' ? (
          <div className="overview-grid">
            <div className="chart-item">
              <Bubble data={bubbleChartData} options={bubbleChartOptions} />
            </div>
            <div className="chart-item">
              <PolarArea data={polarAreaData} options={polarAreaOptions} />
            </div>
            <div className="chart-item">
              <Line data={stackedAreaData} options={stackedAreaOptions} />
            </div>
            <div className="chart-item">
              <Bar data={horizontalBarData} options={horizontalBarOptions} />
            </div>
          </div>
        ) : (
          <div className="single-chart">
            {renderSelectedView()}
          </div>
        )}
      </div>

      {/* Data summary */}
      <div className="data-summary">
        <h4>🌍 Environmental Insights</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Current AQI:</span>
            <span className="value">{currentAQI}</span>
          </div>
          <div className="summary-item">
            <span className="label">Peak AQI:</span>
            <span className="value">{maxAQI}</span>
          </div>
          <div className="summary-item">
            <span className="label">Lowest AQI:</span>
            <span className="value">{minAQI}</span>
          </div>
          <div className="summary-item">
            <span className="label">Average AQI:</span>
            <span className="value">{avgAQI}</span>
          </div>
          <div className="summary-item">
            <span className="label">Environmental Score:</span>
            <span className="value">{environmentalScore}/100</span>
          </div>
          <div className="summary-item">
            <span className="label">Data Points:</span>
            <span className="value">{filteredData.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDataChart; 