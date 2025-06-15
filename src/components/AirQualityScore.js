import React, { useEffect, useState } from 'react';
import { subscribeToLiveData } from '../firebase';
import { Line } from 'react-chartjs-2';
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

const AirQualityScore = () => {
  const [liveData, setLiveData] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveData((data) => {
      setLiveData(data);
      
      // Add to history (keep last 20 readings)
      const newScore = calculateAirQualityScore(data);
      setScoreHistory(prev => {
        const updated = [...prev, { score: newScore, timestamp: new Date() }];
        return updated.slice(-20); // Keep only last 20
      });
    });

    return () => unsubscribe();
  }, []);

  // Cool formula combining temperature, humidity, and AQI
  const calculateAirQualityScore = (data) => {
    const temp = data.temperature || 25;
    const humidity = data.humidity || 50;
    const aqi = data.aqi || data.pollution_level || 50;

    // Temperature factor (ideal range: 18-25°C)
    const tempFactor = temp >= 18 && temp <= 25 ? 1.0 : 
                      temp >= 15 && temp <= 28 ? 0.8 : 0.6;

    // Humidity factor (ideal range: 40-60%)
    const humidityFactor = humidity >= 40 && humidity <= 60 ? 1.0 : 
                          humidity >= 30 && humidity <= 70 ? 0.8 : 0.6;

    // AQI factor (new thresholds: 110 safe, 110-200 moderate, >200 bad)
    const aqiFactor = aqi <= 110 ? 1.0 : 
                     aqi <= 200 ? 0.6 : 0.3;

    // Combined score (0-100 scale)
    const score = Math.round((tempFactor * 0.3 + humidityFactor * 0.3 + aqiFactor * 0.4) * 100);
    
    return Math.max(0, Math.min(100, score));
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return { status: 'Excellent', color: '#00E400', bgColor: '#E8F5E8' };
    if (score >= 60) return { status: 'Good', color: '#88FF00', bgColor: '#F0F8E8' };
    if (score >= 40) return { status: 'Moderate', color: '#FFFF00', bgColor: '#FFFFF0' };
    if (score >= 20) return { status: 'Poor', color: '#FF8800', bgColor: '#FFF4E6' };
    return { status: 'Very Poor', color: '#FF0000', bgColor: '#FFE6E6' };
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '😊';
    if (score >= 60) return '🙂';
    if (score >= 40) return '😐';
    if (score >= 20) return '😷';
    return '🤢';
  };

  if (!liveData) {
    return (
      <div className="air-quality-score">
        <div className="score-loading">
          <div className="loading-spinner"></div>
          <p>Calculating air quality score...</p>
        </div>
      </div>
    );
  }

  const currentScore = calculateAirQualityScore(liveData);
  const scoreStatus = getScoreStatus(currentScore);
  const scoreEmoji = getScoreEmoji(currentScore);

  // Chart data
  const chartData = {
    labels: scoreHistory.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Air Quality Score',
        data: scoreHistory.map(item => item.score),
        borderColor: scoreStatus.color,
        backgroundColor: scoreStatus.color + '20',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: scoreStatus.color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Air Quality Score Trend',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="air-quality-score">
      <h2>🌬️ Comprehensive Air Quality Score</h2>
      
      <div className="score-overview">
        <div className="main-score-card" style={{ borderColor: scoreStatus.color, backgroundColor: scoreStatus.bgColor }}>
          <div className="score-emoji">{scoreEmoji}</div>
          <div className="score-value" style={{ color: scoreStatus.color }}>
            {currentScore}%
          </div>
          <div className="score-status">{scoreStatus.status}</div>
          <div className="score-description">
            Based on Temperature, Humidity & AQI
          </div>
        </div>

        <div className="score-breakdown">
          <h3>Score Breakdown</h3>
          <div className="breakdown-item">
            <span>🌡️ Temperature Factor:</span>
            <span>{Math.round((liveData.temperature >= 18 && liveData.temperature <= 25 ? 1.0 : 
                              liveData.temperature >= 15 && liveData.temperature <= 28 ? 0.8 : 0.6) * 100)}%</span>
          </div>
          <div className="breakdown-item">
            <span>💧 Humidity Factor:</span>
            <span>{Math.round((liveData.humidity >= 40 && liveData.humidity <= 60 ? 1.0 : 
                              liveData.humidity >= 30 && liveData.humidity <= 70 ? 0.8 : 0.6) * 100)}%</span>
          </div>
          <div className="breakdown-item">
            <span>🌬️ AQI Factor:</span>
            <span>{Math.round((liveData.aqi <= 110 ? 1.0 : 
                              liveData.aqi <= 200 ? 0.6 : 0.3) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="score-chart">
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="score-info">
        <h3>📊 How the Score is Calculated</h3>
        <div className="formula-explanation">
          <p><strong>Formula:</strong> (Temperature Factor × 30%) + (Humidity Factor × 30%) + (AQI Factor × 40%)</p>
          <div className="factor-details">
            <div className="factor">
              <strong>Temperature Factor:</strong>
              <ul>
                <li>100% for 18-25°C (ideal)</li>
                <li>80% for 15-28°C (acceptable)</li>
                <li>60% for other ranges</li>
              </ul>
            </div>
            <div className="factor">
              <strong>Humidity Factor:</strong>
              <ul>
                <li>100% for 40-60% (ideal)</li>
                <li>80% for 30-70% (acceptable)</li>
                <li>60% for other ranges</li>
              </ul>
            </div>
            <div className="factor">
              <strong>AQI Factor:</strong>
              <ul>
                <li>100% for AQI ≤ 110 (safe)</li>
                <li>60% for AQI 110-200 (moderate)</li>
                <li>30% for AQI &gt; 200 (bad)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityScore; 