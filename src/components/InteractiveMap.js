import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const InteractiveMap = ({ onRegionSelect, selectedRegion, refreshTrigger, regions = [] }) => {
  const [loading, setLoading] = useState(false);

  // Update loading state when regions are being fetched
  useEffect(() => {
    if (regions.length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [regions]);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00E400';
    if (aqi <= 100) return '#FFFF00';
    if (aqi <= 150) return '#FF7E00';
    if (aqi <= 200) return '#FF0000';
    if (aqi <= 300) return '#8F3F97';
    return '#7E0023';
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[15.3173, 75.7139]}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        className="interactive-map"
        key={refreshTrigger} // Force re-render when refreshTrigger changes
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {regions.map((region) => {
          const currentAQI = region.data && region.data.length > 0 ? region.data[region.data.length - 1]?.aqi || 0 : 0;
          const aqiColor = getAQIColor(currentAQI);
          const aqiStatus = getAQIStatus(currentAQI);
          const isSelected = selectedRegion?.id === region.id;

          return (
            <div key={region.id}>
              {/* Circle overlay for region area */}
              <Circle
                center={region.coordinates}
                radius={800}
                pathOptions={{
                  color: aqiColor,
                  fillColor: aqiColor,
                  fillOpacity: 0.3,
                  weight: isSelected ? 4 : 2
                }}
                eventHandlers={{
                  click: () => onRegionSelect(region)
                }}
              />
              
              {/* Marker for region center */}
              <Marker
                position={region.coordinates}
                eventHandlers={{
                  click: () => onRegionSelect(region)
                }}
              >
                <Popup>
                  <div className="region-popup">
                    <h3>{region.name}</h3>
                    <div className="aqi-info">
                      <p><strong>Current AQI:</strong> {currentAQI}</p>
                      <p><strong>Status:</strong> {aqiStatus}</p>
                      {region.data && region.data.length > 0 && (
                        <>
                          <p><strong>Temperature:</strong> {region.data[region.data.length - 1]?.temperature}°C</p>
                          <p><strong>Humidity:</strong> {region.data[region.data.length - 1]?.humidity}%</p>
                        </>
                      )}
                      {region.description && (
                        <p><strong>Description:</strong> {region.description}</p>
                      )}
                    </div>
                    <button 
                      className="select-region-btn"
                      onClick={() => onRegionSelect(region)}
                    >
                      View Detailed Data
                    </button>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
      
      <div className="map-legend">
        <h4>AQI Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#00E400' }}></div>
            <span>Good (0-50)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFFF00' }}></div>
            <span>Moderate (51-100)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF7E00' }}></div>
            <span>Unhealthy for Sensitive Groups (101-150)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF0000' }}></div>
            <span>Unhealthy (151-200)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8F3F97' }}></div>
            <span>Very Unhealthy (201-300)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#7E0023' }}></div>
            <span>Hazardous (301+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap; 