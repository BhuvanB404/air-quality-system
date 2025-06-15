import React, { useState, useEffect } from 'react';
import './App.css';
import InteractiveMap from './components/InteractiveMap';
import AirQualityChart from './components/AirQualityChart';
import DailyDataChart from './components/DailyDataChart';
import LiveDataCards from './components/LiveDataCards';
import AirQualityScore from './components/AirQualityScore';
import AdminPanel from './components/AdminPanel';
import { getRegionData, getAllRegionsFromFirebase } from './firebase';

function App() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionData, setRegionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'trend'
  const [regions, setRegions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load regions from Firebase on component mount
  useEffect(() => {
    loadRegionsFromFirebase();
  }, []);

  const loadRegionsFromFirebase = async () => {
    try {
      const regionsData = await getAllRegionsFromFirebase();
      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const handleRegionSelect = async (region) => {
    setSelectedRegion(region);
    setLoading(true);
    
    try {
      const data = await getRegionData(region.id);
      setRegionData(data);
    } catch (error) {
      console.error('Error loading region data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationAdded = async (newRegion) => {
    // Reload all regions from Firebase to get the latest data
    await loadRegionsFromFirebase();
    
    // Close admin panel
    setShowAdmin(false);
    
    // Trigger map refresh
    setRefreshTrigger(prev => prev + 1);
    
    console.log('Location added successfully, map should refresh');
  };

  const toggleAdmin = () => {
    setShowAdmin(!showAdmin);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌬️ Air Quality Dashboard</h1>
        <p>Interactive air quality monitoring with real-time data</p>
        <button className="admin-toggle-btn" onClick={toggleAdmin}>
          {showAdmin ? '🔒 Close Admin' : '🔧 Admin Panel'}
        </button>
      </header>

      {showAdmin && (
        <div className="admin-overlay">
          <AdminPanel 
            onClose={() => setShowAdmin(false)}
            onLocationAdded={handleLocationAdded}
          />
        </div>
      )}

      <main className="App-main">
        <section className="live-data-section">
          <LiveDataCards />
        </section>

        <section className="air-quality-score-section">
          <AirQualityScore />
        </section>

        <section className="map-section">
          <h2>Select a Region to View Air Quality Data</h2>
          <InteractiveMap 
            onRegionSelect={handleRegionSelect}
            selectedRegion={selectedRegion}
            refreshTrigger={refreshTrigger}
            regions={regions}
          />
        </section>

        {selectedRegion && (
          <section className="chart-section">
            <div className="selected-region-info">
              <h2>Air Quality Data for {selectedRegion.name}</h2>
              <p>Click on different regions on the map to view their air quality trends</p>
              
              <div className="view-controls">
                <button 
                  className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
                  onClick={() => setViewMode('daily')}
                >
                  📊 Daily View (24h)
                </button>
                <button 
                  className={`view-btn ${viewMode === 'trend' ? 'active' : ''}`}
                  onClick={() => setViewMode('trend')}
                >
                  📈 Trend View
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading air quality data...</p>
              </div>
            ) : regionData ? (
              <div className="chart-container">
                {viewMode === 'daily' ? (
                  <DailyDataChart 
                    data={regionData.data} 
                    regionName={regionData.name}
                  />
                ) : (
                  <AirQualityChart 
                    data={regionData.data} 
                    regionName={regionData.name}
                  />
                )}
              </div>
            ) : (
              <div className="error-container">
                <p>No data available for this region</p>
              </div>
            )}
          </section>
        )}

        {!selectedRegion && (
          <section className="instructions-section">
            <div className="instructions-card">
              <h3>How to Use</h3>
              <ol>
                <li>View the live sensor data at the top of the page</li>
                <li>Click on any colored region on the map to select it</li>
                <li>View detailed air quality charts for the selected region</li>
                <li>Switch between Daily View (24h) and Trend View</li>
                <li>Use the Admin Panel to add new locations</li>
                <li>Different colors indicate different air quality levels</li>
                <li>Hover over chart points to see detailed information</li>
              </ol>
            </div>
          </section>
        )}
      </main>

      {/* <footer className="App-footer">
        <p>&copy; 2024 Air Quality Dashboard. Real-time environmental monitoring.</p>
      </footer> */}
    </div>
  );
}

export default App; 