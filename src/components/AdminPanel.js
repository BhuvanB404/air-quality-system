import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { getAllRegionsFromFirebase, addNewLocationToFirebase, deleteRegionFromFirebase, updateRegionData } from '../firebase';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker for admin
const adminMarkerIcon = L.divIcon({
  className: 'admin-marker',
  html: '<div style="background-color: #3498db; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Map click handler component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const AdminPanel = ({ onClose, onLocationAdded }) => {
  const [newLocation, setNewLocation] = useState({
    name: '',
    coordinates: null,
    description: ''
  });
  const [existingRegions, setExistingRegions] = useState([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const regions = await getAllRegionsFromFirebase();
      setExistingRegions(regions);
    } catch (error) {
      console.error('Error loading regions:', error);
      setMessage('Error loading regions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (coordinates) => {
    setNewLocation(prev => ({
      ...prev,
      coordinates: coordinates
    }));
    setIsAddingLocation(true);
  };

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.coordinates) {
      setMessage('Please provide a name and select a location on the map');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const regionId = await addNewLocationToFirebase(newLocation);
      
      const newRegion = {
        id: regionId,
        name: newLocation.name,
        coordinates: newLocation.coordinates,
        description: newLocation.description,
        createdAt: new Date().toISOString()
      };

      // Reload regions from Firebase to get the latest data
      await loadRegions();
      
      // Call the callback to update the parent component
      onLocationAdded(newRegion);
      
      setMessage('Location added successfully!');
      
      // Reset form
      setNewLocation({
        name: '',
        coordinates: null,
        description: ''
      });
      setIsAddingLocation(false);
      setSelectedLocation(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error adding location:', error);
      setMessage('Error adding location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (region) => {
    setSelectedLocation(region);
  };

  const handleDeleteLocation = async (regionId) => {
    if (window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      try {
        setLoading(true);
        const success = await deleteRegionFromFirebase(regionId);
        
        if (success) {
          // Update the existing regions list
          setExistingRegions(prev => prev.filter(region => region.id !== regionId));
          setMessage('Location deleted successfully!');
          
          if (selectedLocation && selectedLocation.id === regionId) {
            setSelectedLocation(null);
          }
        } else {
          setMessage('Error deleting location. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting location:', error);
        setMessage('Error deleting location. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddTestData = async (regionId) => {
    try {
      setLoading(true);
      const newDataPoint = {
        timestamp: new Date().toISOString(),
        aqi: Math.floor(Math.random() * 100) + 30,
        temperature: Math.floor(Math.random() * 15) + 20,
        humidity: Math.floor(Math.random() * 40) + 40,
        pm25: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 80) + 20,
        co2: Math.floor(Math.random() * 200) + 400,
        no2: Math.floor(Math.random() * 30) + 5,
        o3: Math.floor(Math.random() * 60) + 20
      };
      
      const success = await updateRegionData(regionId, newDataPoint);
      
      if (success) {
        setMessage('Test data added successfully!');
        // Reload regions to get updated data
        await loadRegions();
      } else {
        setMessage('Error adding test data. Please try again.');
      }
    } catch (error) {
      console.error('Error adding test data:', error);
      setMessage('Error adding test data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🔧 Admin Panel</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-content">
        <div className="admin-section">
          <h3>📍 Add New Location</h3>
          <div className="add-location-form">
            <input
              type="text"
              placeholder="Location Name (e.g., Downtown Mall)"
              value={newLocation.name}
              onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
              className="location-input"
            />
            <textarea
              placeholder="Description (optional)"
              value={newLocation.description}
              onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
              className="location-textarea"
            />
            
            <div className="map-instructions">
              <p>Click on the map below to select the location coordinates:</p>
            </div>

            <div className="admin-map-container">
              <MapContainer
                center={[15.3173, 75.7139]}
                zoom={13}
                style={{ height: '300px', width: '100%' }}
                className="admin-map"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapClickHandler onLocationSelect={handleMapClick} />
                
                {/* Show existing regions */}
                {existingRegions.map((region) => (
                  <Marker
                    key={region.id}
                    position={region.coordinates}
                    eventHandlers={{
                      click: () => handleLocationSelect(region)
                    }}
                  />
                ))}
                
                {/* Show new location marker */}
                {newLocation.coordinates && (
                  <Marker
                    position={newLocation.coordinates}
                    icon={adminMarkerIcon}
                  />
                )}
              </MapContainer>
            </div>

            {newLocation.coordinates && (
              <div className="coordinates-display">
                <p>Selected Coordinates: {newLocation.coordinates[0].toFixed(6)}, {newLocation.coordinates[1].toFixed(6)}</p>
              </div>
            )}

            <button 
              className="add-location-btn"
              onClick={handleAddLocation}
              disabled={!newLocation.name || !newLocation.coordinates || loading}
            >
              {loading ? '🔄 Adding...' : '➕ Add Location'}
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h3>🗂️ Manage Existing Locations ({existingRegions.length})</h3>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading locations...</p>
            </div>
          ) : (
            <div className="locations-list">
              {existingRegions.map((region) => (
                <div key={region.id} className="location-item">
                  <div className="location-info">
                    <h4>{region.name}</h4>
                    <p>Coordinates: {region.coordinates[0].toFixed(4)}, {region.coordinates[1].toFixed(4)}</p>
                    {region.description && <p>Description: {region.description}</p>}
                    {region.createdAt && <p>Created: {new Date(region.createdAt).toLocaleDateString()}</p>}
                  </div>
                  <div className="location-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleLocationSelect(region)}
                    >
                      ✏️ View
                    </button>
                    <button 
                      className="test-data-btn"
                      onClick={() => handleAddTestData(region.id)}
                      disabled={loading}
                    >
                      📊 Add Test Data
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteLocation(region.id)}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
              {existingRegions.length === 0 && (
                <div className="no-locations">
                  <p>No locations found. Add your first location above!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedLocation && (
          <div className="admin-section">
            <h3>📊 Location Data Preview</h3>
            <div className="location-preview">
              <h4>{selectedLocation.name}</h4>
              <p>Location ID: {selectedLocation.id}</p>
              <p>Coordinates: {selectedLocation.coordinates[0].toFixed(6)}, {selectedLocation.coordinates[1].toFixed(6)}</p>
              {selectedLocation.description && <p>Description: {selectedLocation.description}</p>}
              {selectedLocation.createdAt && <p>Created: {new Date(selectedLocation.createdAt).toLocaleString()}</p>}
              
              {selectedLocation.data && selectedLocation.data.length > 0 && (
                <div className="data-preview">
                  <h5>Latest Data:</h5>
                  <div className="data-grid">
                    <div className="data-item">
                      <span className="data-label">AQI:</span>
                      <span className="data-value">{selectedLocation.data[selectedLocation.data.length - 1]?.aqi}</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Temperature:</span>
                      <span className="data-value">{selectedLocation.data[selectedLocation.data.length - 1]?.temperature}°C</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Humidity:</span>
                      <span className="data-value">{selectedLocation.data[selectedLocation.data.length - 1]?.humidity}%</span>
                    </div>
                    <div className="data-item">
                      <span className="data-label">PM2.5:</span>
                      <span className="data-value">{selectedLocation.data[selectedLocation.data.length - 1]?.pm25} μg/m³</span>
                    </div>
                  </div>
                  <p className="data-timestamp">
                    Last updated: {new Date(selectedLocation.data[selectedLocation.data.length - 1]?.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 