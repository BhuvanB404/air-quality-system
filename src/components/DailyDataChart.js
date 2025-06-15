import React, { useState, useEffect } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getHistoricalData, getDashboardStats } from '../firebase_enhanced';

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

const DailyDataChart = ({ regionName }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('aqi');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const limit = timeRange === '6h' ? 6 : 
                   timeRange === '12h' ? 12 : 
                   timeRange === '24h' ? 24 : 
                   timeRange === '48h' ? 48 : 168;
      
      const data = await getHistoricalData(limit);
      const stats = await getDashboardStats();
      
      setHistoricalData(data);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="daily-data-chart">
        <div className="loading">
          <h3>Loading air quality data...</h3>
          <p>Fetching the latest sensor readings from Firebase</p>
        </div>
      </div>
    );
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="daily-data-chart">
        <div className="no-data">
          <h3>No sensor data available</h3>
          <p>Please check if the ESP8266 sensor is connected and sending data to Firebase.</p>
          <button onClick={loadData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  // Process real Firebase data
  const processedData = historicalData.map(reading => ({
    timestamp: reading.timestamp * 1000, // Convert to milliseconds
    time: new Date(reading.timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    aqi: reading.aqi || reading.pollution_level || 0,
    temperature: reading.temperature || 0,
    humidity: reading.humidity || 0,
    co2: reading.co2_estimate || 400,
    tvoc: reading.tvoc_estimate || 0.1,
    pressure: reading.pressure_estimate || 1013.25,
    dewPoint: reading.dew_point || 0,
    heatIndex: reading.heat_index || reading.temperature || 0,
    tempTrend: reading.temp_trend || 0,
    humTrend: reading.hum_trend || 0,
    aqiTrend: reading.aqi_trend || 0,
    gasDetected: reading.gas_detected || false,
    deviceId: reading.device_id || 'Unknown',
    location: reading.location || 'Unknown',
    wifiRssi: reading.wifi_rssi || 0
  }));

  // Get current values
  const currentReading = processedData[processedData.length - 1];
  const currentAQI = currentReading?.aqi || 0;
  const currentTemp = currentReading?.temperature || 0;
  const currentHumidity = currentReading?.humidity || 0;

  // Calculate AQI status
  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { status: 'Good', color: '#00E400', bgColor: '#E8F5E8', description: 'Air quality is satisfactory' };
    if (aqi <= 100) return { status: 'Moderate', color: '#FFFF00', bgColor: '#FFFFF0', description: 'Some pollutants may be a concern' };
    if (aqi <= 150) return { status: 'Unhealthy for Sensitive Groups', color: '#FF7E00', bgColor: '#FFF4E6', description: 'May cause health effects' };
    if (aqi <= 200) return { status: 'Unhealthy', color: '#FF0000', bgColor: '#FFE6E6', description: 'Everyone may experience health effects' };
    if (aqi <= 300) return { status: 'Very Unhealthy', color: '#8F3F97', bgColor: '#F0E6F0', description: 'Health warnings of emergency conditions' };
    return { status: 'Hazardous', color: '#7E0023', bgColor: '#F0E6E6', description: 'Health alert: everyone may experience serious effects' };
  };

  const aqiStatus = getAQIStatus(currentAQI);

  // Calculate statistics
  const aqiValues = processedData.map(d => d.aqi);
  const tempValues = processedData.map(d => d.temperature);
  const humidityValues = processedData.map(d => d.humidity);
  const co2Values = processedData.map(d => d.co2);

  const avgAQI = Math.round(aqiValues.reduce((sum, val) => sum + val, 0) / aqiValues.length);
  const maxAQI = Math.max(...aqiValues);
  const minAQI = Math.min(...aqiValues);
  const avgTemp = Math.round((tempValues.reduce((sum, val) => sum + val, 0) / tempValues.length) * 10) / 10;
  const avgHumidity = Math.round((humidityValues.reduce((sum, val) => sum + val, 0) / humidityValues.length) * 10) / 10;
  const avgCO2 = Math.round((co2Values.reduce((sum, val) => sum + val, 0) / co2Values.length) * 10) / 10;

  // Calculate trends
  const getTrend = (values) => {
    if (values.length < 2) return 'stable';
    const recent = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const earlier = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const change = ((recent - earlier) / earlier) * 100;
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const aqiTrend = getTrend(aqiValues);
  const tempTrend = getTrend(tempValues);
  const humidityTrend = getTrend(humidityValues);

  // Main time series chart
  const timeSeriesData = {
    labels: processedData.map(d => d.time),
    datasets: [
      {
        label: 'Air Quality Index (AQI)',
        data: aqiValues,
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FF6B6B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y'
      },
      {
        label: 'Temperature (°C)',
        data: tempValues,
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#4ECDC4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y1'
      },
      {
        label: 'Humidity (%)',
        data: humidityValues,
        borderColor: '#45B7D1',
        backgroundColor: 'rgba(69, 183, 209, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#45B7D1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y2'
      }
    ]
  };

  // CO2 levels chart
  const co2Data = {
    labels: processedData.map(d => d.time),
    datasets: [
      {
        label: 'CO2 Estimate (ppm)',
        data: co2Values,
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: '#4CAF50',
        borderWidth: 2,
        borderRadius: 4,
        fill: true
      }
    ]
  };

  // Health impact assessment
  const healthImpactData = {
    labels: ['Good', 'Moderate', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
    datasets: [
      {
        data: [
          aqiValues.filter(aqi => aqi <= 50).length,
          aqiValues.filter(aqi => aqi > 50 && aqi <= 100).length,
          aqiValues.filter(aqi => aqi > 100 && aqi <= 200).length,
          aqiValues.filter(aqi => aqi > 200 && aqi <= 300).length,
          aqiValues.filter(aqi => aqi > 300).length
        ],
        backgroundColor: [
          '#00E400',
          '#FFFF00',
          '#FF7E00',
          '#FF0000',
          '#8F3F97'
        ],
        borderWidth: 0
      }
    ]
  };

  // Chart options
  const timeSeriesOptions = {
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
        text: `Real-time Air Quality Data - ${currentReading?.location || regionName}`,
        font: { size: 18, weight: 'bold' },
        padding: { top: 10, bottom: 30 }
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
        callbacks: {
          afterBody: function(context) {
            const index = context[0].dataIndex;
            const reading = processedData[index];
            return [
              `Device: ${reading.deviceId}`,
              `WiFi Signal: ${reading.wifiRssi} dBm`,
              `Gas Detected: ${reading.gasDetected ? 'Yes' : 'No'}`,
              `Dew Point: ${reading.dewPoint}°C`,
              `Heat Index: ${reading.heatIndex}°C`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `Time (Last ${timeRange})`,
          font: { size: 14, weight: 'bold' }
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'AQI',
          font: { size: 14, weight: 'bold' }
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        min: 0,
        max: Math.max(...aqiValues) + 20
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { size: 14, weight: 'bold' }
        },
        grid: { drawOnChartArea: false },
        min: Math.min(...tempValues) - 5,
        max: Math.max(...tempValues) + 5
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
          font: { size: 14, weight: 'bold' }
        },
        grid: { drawOnChartArea: false },
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

  const co2Options = {
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
        text: 'CO2 Levels Over Time',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'CO2 (ppm)',
          font: { size: 14, weight: 'bold' }
        }
      }
    }
  };

  const healthImpactOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Health Impact Distribution',
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  // AQI progress chart
  const aqiProgressData = {
    labels: ['Current AQI', 'Remaining'],
    datasets: [
      {
        data: [currentAQI, Math.max(0, 500 - currentAQI)],
        backgroundColor: [aqiStatus.color, '#f0f0f0'],
        borderWidth: 0,
        cutout: '70%'
      }
    ]
  };

  const aqiProgressOptions = {
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
      {/* Controls */}
      <div className="chart-controls">
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="6h">Last 6 Hours</option>
            <option value="12h">Last 12 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="48h">Last 48 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
        
        <div className="refresh-control">
          <button onClick={loadData} className="refresh-btn">
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="current-status-section">
        <div className="status-card" style={{ backgroundColor: aqiStatus.bgColor, borderColor: aqiStatus.color }}>
          <h3>Current Air Quality: {aqiStatus.status}</h3>
          <p>{aqiStatus.description}</p>
          <div className="status-details">
            <div className="aqi-display">
              <span className="aqi-value" style={{ color: aqiStatus.color }}>
                {currentAQI}
              </span>
              <span className="aqi-label">AQI</span>
            </div>
            <div className="aqi-progress">
              <Doughnut data={aqiProgressData} options={aqiProgressOptions} />
            </div>
          </div>
          <div className="trend-indicator">
            <span className={`trend ${aqiTrend}`}>
              {aqiTrend === 'increasing' ? '↗' : aqiTrend === 'decreasing' ? '↘' : '→'} {aqiTrend}
            </span>
          </div>
        </div>
        
        <div className="current-metrics">
          <div className="metric-card">
            <h4>Temperature</h4>
            <p>{currentTemp}°C</p>
            <small>Trend: {tempTrend}</small>
          </div>
          <div className="metric-card">
            <h4>Humidity</h4>
            <p>{currentHumidity}%</p>
            <small>Trend: {humidityTrend}</small>
          </div>
          <div className="metric-card">
            <h4>CO2 Level</h4>
            <p>{currentReading?.co2 || 400} ppm</p>
            <small>Estimated</small>
          </div>
          <div className="metric-card">
            <h4>Gas Detected</h4>
            <p>{currentReading?.gasDetected ? 'Yes' : 'No'}</p>
            <small>MQ135 Sensor</small>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="charts-container">
        <div className="main-chart">
          <Line data={timeSeriesData} options={timeSeriesOptions} />
        </div>
        
        <div className="secondary-charts">
          <div className="co2-chart">
            <Bar data={co2Data} options={co2Options} />
          </div>
          
          <div className="health-impact-chart">
            <Doughnut data={healthImpactData} options={healthImpactOptions} />
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="data-summary">
        <h4>📊 Sensor Data Summary</h4>
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
            <span className="label">Average Temperature:</span>
            <span className="value">{avgTemp}°C</span>
          </div>
          <div className="summary-item">
            <span className="label">Average Humidity:</span>
            <span className="value">{avgHumidity}%</span>
          </div>
          <div className="summary-item">
            <span className="label">Average CO2:</span>
            <span className="value">{avgCO2} ppm</span>
          </div>
          <div className="summary-item">
            <span className="label">Data Points:</span>
            <span className="value">{processedData.length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Device ID:</span>
            <span className="value">{currentReading?.deviceId}</span>
          </div>
          <div className="summary-item">
            <span className="label">Location:</span>
            <span className="value">{currentReading?.location}</span>
          </div>
          <div className="summary-item">
            <span className="label">WiFi Signal:</span>
            <span className="value">{currentReading?.wifiRssi} dBm</span>
          </div>
          <div className="summary-item">
            <span className="label">Last Updated:</span>
            <span className="value">{new Date(currentReading?.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyDataChart; 