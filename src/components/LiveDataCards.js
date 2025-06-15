import React, { useEffect, useState } from 'react';
import { subscribeToLiveData } from '../firebase';

const LiveDataCards = () => {
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToLiveData((data) => {
      setLiveData(data);
    });

    return () => unsubscribe();
  }, []);

  const getAQIStatus = (aqi) => {
    if (aqi <= 110) return { status: 'Safe', color: '#00E400', bgColor: '#E8F5E8' };
    if (aqi <= 200) return { status: 'Moderate', color: '#FFFF00', bgColor: '#FFFFF0' };
    return { status: 'Bad', color: '#FF0000', bgColor: '#FFE6E6' };
  };

  const getGasStatus = (gasDetected) => {
    return gasDetected 
      ? { status: 'Detected', color: '#FF0000', bgColor: '#FFE6E6' }
      : { status: 'Safe', color: '#00E400', bgColor: '#E8F5E8' };
  };

  if (!liveData) {
    return (
      <div className="live-data-cards">
        <div className="cards-grid">
          <div className="data-card loading">
            <div className="card-content">
              <h3>Loading...</h3>
              <p>Connecting to sensors...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const aqiStatus = getAQIStatus(liveData.pollution_level || liveData.aqi);
  const gasStatus = getGasStatus(liveData.gas_detected);

  return (
    <div className="live-data-cards">
      <h2>Live Sensor Data</h2>
      <div className="cards-grid">
        <div className="data-card temperature">
          <div className="card-icon">🌡️</div>
          <div className="card-content">
            <h3>Temperature</h3>
            <p className="card-value">{liveData.temperature}°C</p>
            <p className="card-description">Current ambient temperature</p>
          </div>
        </div>

        <div className="data-card humidity">
          <div className="card-icon">💧</div>
          <div className="card-content">
            <h3>Humidity</h3>
            <p className="card-value">{liveData.humidity}%</p>
            <p className="card-description">Relative humidity level</p>
          </div>
        </div>

        <div className="data-card air-quality" style={{ borderColor: aqiStatus.color, backgroundColor: aqiStatus.bgColor }}>
          <div className="card-icon">🌬️</div>
          <div className="card-content">
            <h3>Air Quality Index</h3>
            <p className="card-value" style={{ color: aqiStatus.color }}>
              {liveData.pollution_level || liveData.aqi}
            </p>
            <p className="card-description">{aqiStatus.status}</p>
          </div>
        </div>

        <div className="data-card pollution">
          <div className="card-icon">☁️</div>
          <div className="card-content">
            <h3>Pollution Level</h3>
            <p className="card-value">{liveData.pollution_level}</p>
            <p className="card-description">Particulate matter concentration</p>
          </div>
        </div>

        <div className="data-card gas" style={{ borderColor: gasStatus.color, backgroundColor: gasStatus.bgColor }}>
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>Gas Detection</h3>
            <p className="card-value" style={{ color: gasStatus.color }}>
              {gasStatus.status}
            </p>
            <p className="card-description">
              {liveData.gas_detected ? 'Harmful gases detected' : 'Air quality safe'}
            </p>
          </div>
        </div>

        <div className="data-card timestamp">
          <div className="card-icon">🕒</div>
          <div className="card-content">
            <h3>Last Updated</h3>
            <p className="card-value">
              {new Date().toLocaleTimeString()}
            </p>
            <p className="card-description">Real-time data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDataCards; 