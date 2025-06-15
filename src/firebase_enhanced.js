import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, remove, push, get, query, orderByChild, limitToLast } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyACTawCyIJ2ULCLXTJrnjGBN_LeuQqWmcw",
  authDomain: "air-quality-13c25.firebaseapp.com",
  databaseURL: "https://air-quality-13c25-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "air-quality-13c25",
  storageBucket: "air-quality-13c25.appspot.com",
  messagingSenderId: "212146084531",
  appId: "1:212146084531:web:959672c67ccaf07bb7aec6",
  measurementId: "G-CZGJHEE8S8"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Enhanced live data subscription with new fields
export const subscribeToEnhancedLiveData = (callback) => {
  const latestRef = ref(database, "latest_reading");
  
  onValue(latestRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Process and enhance the data
      const enhancedData = {
        ...data,
        // Ensure all new fields have default values if missing
        aqi: data.aqi || data.pollution_level || 0,
        co2_estimate: data.co2_estimate || 400,
        tvoc_estimate: data.tvoc_estimate || 0.1,
        pressure_estimate: data.pressure_estimate || 1013.25,
        dew_point: data.dew_point || 0,
        heat_index: data.heat_index || data.temperature || 0,
        temp_trend: data.temp_trend || 0,
        hum_trend: data.hum_trend || 0,
        aqi_trend: data.aqi_trend || 0,
        device_id: data.device_id || "ESP8266_001",
        location: data.location || "Hubli_Central",
        formatted_time: data.formatted_time || new Date(data.timestamp * 1000).toLocaleTimeString(),
        wifi_rssi: data.wifi_rssi || 0,
        wifi_ssid: data.wifi_ssid || "Unknown"
      };
      
      callback(enhancedData);
    }
  });

  return () => off(latestRef);
};

// Get historical data for charts
export const getHistoricalData = async (limit = 24) => {
  try {
    const readingsRef = ref(database, "sensor_readings");
    const recentReadingsQuery = query(readingsRef, orderByChild("timestamp"), limitToLast(limit));
    
    const snapshot = await get(recentReadingsQuery);
    const data = snapshot.val();
    
    if (data) {
      // Convert to array and sort by timestamp
      const readings = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
      
      // Process each reading to ensure all fields exist
      return readings.map(reading => ({
        ...reading,
        aqi: reading.aqi || reading.pollution_level || 0,
        co2_estimate: reading.co2_estimate || 400,
        tvoc_estimate: reading.tvoc_estimate || 0.1,
        pressure_estimate: reading.pressure_estimate || 1013.25,
        dew_point: reading.dew_point || 0,
        heat_index: reading.heat_index || reading.temperature || 0,
        temp_trend: reading.temp_trend || 0,
        hum_trend: reading.hum_trend || 0,
        aqi_trend: reading.aqi_trend || 0,
        device_id: reading.device_id || "ESP8266_001",
        location: reading.location || "Hubli_Central",
        formatted_time: reading.formatted_time || new Date(reading.timestamp * 1000).toLocaleTimeString(),
        wifi_rssi: reading.wifi_rssi || 0,
        wifi_ssid: reading.wifi_ssid || "Unknown"
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
};

// Get data for specific time range
export const getDataForTimeRange = async (startTime, endTime) => {
  try {
    const readingsRef = ref(database, "sensor_readings");
    const snapshot = await get(readingsRef);
    const data = snapshot.val();
    
    if (data) {
      const readings = Object.values(data)
        .filter(reading => reading.timestamp >= startTime && reading.timestamp <= endTime)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      return readings.map(reading => ({
        ...reading,
        aqi: reading.aqi || reading.pollution_level || 0,
        co2_estimate: reading.co2_estimate || 400,
        tvoc_estimate: reading.tvoc_estimate || 0.1,
        pressure_estimate: reading.pressure_estimate || 1013.25,
        dew_point: reading.dew_point || 0,
        heat_index: reading.heat_index || reading.temperature || 0,
        temp_trend: reading.temp_trend || 0,
        hum_trend: reading.hum_trend || 0,
        aqi_trend: reading.aqi_trend || 0,
        device_id: reading.device_id || "ESP8266_001",
        location: reading.location || "Hubli_Central",
        formatted_time: reading.formatted_time || new Date(reading.timestamp * 1000).toLocaleTimeString(),
        wifi_rssi: reading.wifi_rssi || 0,
        wifi_ssid: reading.wifi_ssid || "Unknown"
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching time range data:', error);
    return [];
  }
};

// Get statistics for dashboard
export const getDashboardStats = async () => {
  try {
    const latestRef = ref(database, "latest_reading");
    const snapshot = await get(latestRef);
    const latestData = snapshot.val();
    
    if (!latestData) return null;
    
    // Get last 24 hours of data for statistics
    const historicalData = await getHistoricalData(24);
    
    const stats = {
      current: {
        temperature: latestData.temperature || 0,
        humidity: latestData.humidity || 0,
        aqi: latestData.aqi || latestData.pollution_level || 0,
        air_quality: latestData.air_quality || "Unknown",
        gas_detected: latestData.gas_detected || false,
        co2_estimate: latestData.co2_estimate || 400,
        tvoc_estimate: latestData.tvoc_estimate || 0.1,
        pressure_estimate: latestData.pressure_estimate || 1013.25,
        dew_point: latestData.dew_point || 0,
        heat_index: latestData.heat_index || latestData.temperature || 0,
        temp_trend: latestData.temp_trend || 0,
        hum_trend: latestData.hum_trend || 0,
        aqi_trend: latestData.aqi_trend || 0,
        device_id: latestData.device_id || "ESP8266_001",
        location: latestData.location || "Hubli_Central",
        formatted_time: latestData.formatted_time || new Date(latestData.timestamp * 1000).toLocaleTimeString(),
        wifi_rssi: latestData.wifi_rssi || 0,
        wifi_ssid: latestData.wifi_ssid || "Unknown"
      },
      trends: {
        temperature: latestData.temp_trend || 0,
        humidity: latestData.hum_trend || 0,
        aqi: latestData.aqi_trend || 0
      },
      averages: calculateAverages(historicalData),
      extremes: calculateExtremes(historicalData),
      connection: {
        wifi_rssi: latestData.wifi_rssi || 0,
        wifi_ssid: latestData.wifi_ssid || "Unknown",
        device_id: latestData.device_id || "ESP8266_001",
        location: latestData.location || "Hubli_Central"
      }
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
};

// Calculate averages from historical data
const calculateAverages = (data) => {
  if (data.length === 0) return {};
  
  const sums = data.reduce((acc, reading) => ({
    temperature: acc.temperature + (reading.temperature || 0),
    humidity: acc.humidity + (reading.humidity || 0),
    aqi: acc.aqi + (reading.aqi || reading.pollution_level || 0),
    co2: acc.co2 + (reading.co2_estimate || 400),
    tvoc: acc.tvoc + (reading.tvoc_estimate || 0.1),
    pressure: acc.pressure + (reading.pressure_estimate || 1013.25)
  }), {
    temperature: 0,
    humidity: 0,
    aqi: 0,
    co2: 0,
    tvoc: 0,
    pressure: 0
  });
  
  const count = data.length;
  
  return {
    temperature: Math.round((sums.temperature / count) * 10) / 10,
    humidity: Math.round((sums.humidity / count) * 10) / 10,
    aqi: Math.round(sums.aqi / count),
    co2: Math.round((sums.co2 / count) * 10) / 10,
    tvoc: Math.round((sums.tvoc / count) * 100) / 100,
    pressure: Math.round((sums.pressure / count) * 10) / 10
  };
};

// Calculate extremes from historical data
const calculateExtremes = (data) => {
  if (data.length === 0) return {};
  
  const extremes = data.reduce((acc, reading) => ({
    min_temp: Math.min(acc.min_temp, reading.temperature || 999),
    max_temp: Math.max(acc.max_temp, reading.temperature || -999),
    min_humidity: Math.min(acc.min_humidity, reading.humidity || 999),
    max_humidity: Math.max(acc.max_humidity, reading.humidity || -999),
    min_aqi: Math.min(acc.min_aqi, reading.aqi || reading.pollution_level || 999),
    max_aqi: Math.max(acc.max_aqi, reading.aqi || reading.pollution_level || -999),
    min_co2: Math.min(acc.min_co2, reading.co2_estimate || 999),
    max_co2: Math.max(acc.max_co2, reading.co2_estimate || -999)
  }), {
    min_temp: 999,
    max_temp: -999,
    min_humidity: 999,
    max_humidity: -999,
    min_aqi: 999,
    max_aqi: -999,
    min_co2: 999,
    max_co2: -999
  });
  
  return {
    temperature: { min: extremes.min_temp, max: extremes.max_temp },
    humidity: { min: extremes.min_humidity, max: extremes.max_humidity },
    aqi: { min: extremes.min_aqi, max: extremes.max_aqi },
    co2: { min: extremes.min_co2, max: extremes.max_co2 }
  };
};

// Enhanced AQI status calculation
export const getAQIStatus = (aqi) => {
  if (aqi <= 50) return { 
    status: 'Good', 
    color: '#00E400', 
    bgColor: '#E8F5E8',
    description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    healthEffects: 'None for the general population.'
  };
  if (aqi <= 100) return { 
    status: 'Moderate', 
    color: '#FFFF00', 
    bgColor: '#FFFFF0',
    description: 'Air quality is acceptable; however, some pollutants may be a concern for a small number of people.',
    healthEffects: 'Unusually sensitive people should consider reducing prolonged or heavy exertion.'
  };
  if (aqi <= 150) return { 
    status: 'Unhealthy for Sensitive Groups', 
    color: '#FF7E00', 
    bgColor: '#FFF4E6',
    description: 'Members of sensitive groups may experience health effects.',
    healthEffects: 'Children, elderly, and people with heart or lung disease should reduce prolonged or heavy exertion.'
  };
  if (aqi <= 200) return { 
    status: 'Unhealthy', 
    color: '#FF0000', 
    bgColor: '#FFE6E6',
    description: 'Everyone may begin to experience health effects.',
    healthEffects: 'Children, elderly, and people with heart or lung disease should avoid prolonged or heavy exertion.'
  };
  if (aqi <= 300) return { 
    status: 'Very Unhealthy', 
    color: '#8F3F97', 
    bgColor: '#F0E6F0',
    description: 'Health warnings of emergency conditions.',
    healthEffects: 'Everyone should avoid all outdoor exertion.'
  };
  return { 
    status: 'Hazardous', 
    color: '#7E0023', 
    bgColor: '#F0E6E6',
    description: 'Health alert: everyone may experience more serious health effects.',
    healthEffects: 'Everyone should avoid all outdoor activities.'
  };
};

// Trend analysis helper
export const getTrendStatus = (trend, type) => {
  const thresholds = {
    temperature: { significant: 2, moderate: 1 },
    humidity: { significant: 10, moderate: 5 },
    aqi: { significant: 20, moderate: 10 }
  };
  
  const threshold = thresholds[type] || thresholds.aqi;
  
  if (Math.abs(trend) >= threshold.significant) {
    return {
      direction: trend > 0 ? 'increasing' : 'decreasing',
      intensity: 'significant',
      icon: trend > 0 ? '↗️' : '↘️',
      color: trend > 0 ? '#FF4444' : '#44FF44'
    };
  } else if (Math.abs(trend) >= threshold.moderate) {
    return {
      direction: trend > 0 ? 'increasing' : 'decreasing',
      intensity: 'moderate',
      icon: trend > 0 ? '↗️' : '↘️',
      color: trend > 0 ? '#FF8844' : '#44FF88'
    };
  } else {
    return {
      direction: 'stable',
      intensity: 'minimal',
      icon: '→',
      color: '#888888'
    };
  }
};

// Connection quality assessment
export const getConnectionQuality = (rssi) => {
  if (rssi >= -50) return { quality: 'Excellent', color: '#00FF00', strength: 5 };
  if (rssi >= -60) return { quality: 'Good', color: '#88FF00', strength: 4 };
  if (rssi >= -70) return { quality: 'Fair', color: '#FFFF00', strength: 3 };
  if (rssi >= -80) return { quality: 'Poor', color: '#FF8800', strength: 2 };
  return { quality: 'Very Poor', color: '#FF0000', strength: 1 };
};

// Export the original functions for backward compatibility
export const subscribeToLiveData = subscribeToEnhancedLiveData;
export const getRegionData = getHistoricalData;
export const getAllRegionsFromFirebase = async () => {
  // This function is kept for backward compatibility
  // In the enhanced version, we focus on sensor data rather than regions
  return [];
};

export const addNewLocationToFirebase = async (location) => {
  try {
    const regionsRef = ref(database, `regions/${location.id || Date.now()}`);
    await set(regionsRef, location);
    return regionsRef.key;
  } catch (error) {
    console.error('Error adding location to Firebase:', error);
    throw error;
  }
};

export const saveRegionToFirebase = async (region) => {
  try {
    const regionsRef = ref(database, `regions/${region.id}`);
    await set(regionsRef, region);
    return true;
  } catch (error) {
    console.error('Error saving region to Firebase:', error);
    return false;
  }
};

export const deleteRegionFromFirebase = async (regionId) => {
  try {
    const regionRef = ref(database, `regions/${regionId}`);
    await remove(regionRef);
    return true;
  } catch (error) {
    console.error('Error deleting region from Firebase:', error);
    return false;
  }
}; 