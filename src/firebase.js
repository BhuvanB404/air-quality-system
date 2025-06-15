import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, set, remove, push, get } from 'firebase/database';

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

// Enhanced mock data with more metrics
const generateEnhancedMockData = (regionName) => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
    const baseAQI = regionName.includes('Industrial') ? 80 : regionName.includes('Residential') ? 45 : 65;
    const variation = Math.floor(Math.random() * 40) - 20;
    
    data.push({
      timestamp: time.toISOString(),
      aqi: Math.max(0, baseAQI + variation),
      temperature: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
      pm25: Math.floor(Math.random() * 50) + 10,
      pm10: Math.floor(Math.random() * 80) + 20,
      co2: Math.floor(Math.random() * 200) + 400,
      no2: Math.floor(Math.random() * 30) + 5,
      o3: Math.floor(Math.random() * 60) + 20
    });
  }
  
  return data;
};

// Initial mock data for different regions
let mockRegionData = {
  'region1': {
    name: 'Downtown Hubli',
    coordinates: [15.3173, 75.7139],
    description: 'Central business district with high traffic',
    data: generateEnhancedMockData('Downtown Hubli')
  },
  'region2': {
    name: 'Industrial Area',
    coordinates: [15.3273, 75.7239],
    description: 'Manufacturing zone with factories',
    data: generateEnhancedMockData('Industrial Area')
  },
  'region3': {
    name: 'Residential Zone',
    coordinates: [15.3073, 75.7039],
    description: 'Quiet residential neighborhood',
    data: generateEnhancedMockData('Residential Zone')
  }
};

// Store regions in localStorage for persistence during development
const STORAGE_KEY = 'air_quality_regions';

// Load regions from localStorage
const loadRegionsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading regions from storage:', error);
  }
  return mockRegionData;
};

// Save regions to localStorage
const saveRegionsToStorage = (regions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
  } catch (error) {
    console.error('Error saving regions to storage:', error);
  }
};

// Initialize regions from storage
mockRegionData = loadRegionsFromStorage();

export const getRegionData = (regionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRegionData[regionId] || null);
    }, 500);
  });
};

export const getAllRegions = () => {
  return Object.keys(mockRegionData).map(id => ({
    id,
    ...mockRegionData[id]
  }));
};

export const addRegion = (region) => {
  const regionId = `region${Date.now()}`;
  mockRegionData[regionId] = {
    ...region,
    data: generateEnhancedMockData(region.name)
  };
  saveRegionsToStorage(mockRegionData);
  return regionId;
};

export const updateRegion = (regionId, updates) => {
  if (mockRegionData[regionId]) {
    mockRegionData[regionId] = {
      ...mockRegionData[regionId],
      ...updates
    };
    saveRegionsToStorage(mockRegionData);
    return true;
  }
  return false;
};

export const deleteRegion = (regionId) => {
  if (mockRegionData[regionId]) {
    delete mockRegionData[regionId];
    saveRegionsToStorage(mockRegionData);
    return true;
  }
  return false;
};

export const subscribeToLiveData = (callback) => {
  const readingsRef = ref(database, "sensor_readings");
  
  onValue(readingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const sortedKeys = Object.keys(data).sort((a, b) =>
        data[a].reading_number - data[b].reading_number
      );
      const latest = data[sortedKeys[sortedKeys.length - 1]];
      callback(latest);
    }
  });

  return () => off(readingsRef);
};

// Enhanced Firebase functions for production
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

// New functions for enhanced admin functionality
export const addNewLocationToFirebase = async (locationData) => {
  try {
    const regionsRef = ref(database, 'regions');
    const newRegionRef = push(regionsRef);
    const regionId = newRegionRef.key;
    
    const region = {
      id: regionId,
      name: locationData.name,
      coordinates: locationData.coordinates,
      description: locationData.description || '',
      createdAt: new Date().toISOString(),
      data: generateEnhancedMockData(locationData.name)
    };
    
    await set(newRegionRef, region);
    
    // Also save to local storage for immediate access
    mockRegionData[regionId] = region;
    saveRegionsToStorage(mockRegionData);
    
    return regionId;
  } catch (error) {
    console.error('Error adding new location to Firebase:', error);
    throw error;
  }
};

export const getAllRegionsFromFirebase = async () => {
  try {
    const regionsRef = ref(database, 'regions');
    const snapshot = await get(regionsRef);
    
    if (snapshot.exists()) {
      const regions = [];
      snapshot.forEach((childSnapshot) => {
        regions.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return regions;
    }
    return [];
  } catch (error) {
    console.error('Error fetching regions from Firebase:', error);
    return [];
  }
};

export const subscribeToRegionData = (regionId, callback) => {
  const regionRef = ref(database, `regions/${regionId}`);
  
  onValue(regionRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });

  return () => off(regionRef);
};

export const updateRegionData = async (regionId, newDataPoint) => {
  try {
    const regionRef = ref(database, `regions/${regionId}`);
    const snapshot = await get(regionRef);
    
    if (snapshot.exists()) {
      const region = snapshot.val();
      const updatedData = [...(region.data || []), newDataPoint];
      
      // Keep only the last 24 data points
      if (updatedData.length > 24) {
        updatedData.splice(0, updatedData.length - 24);
      }
      
      await set(ref(database, `regions/${regionId}/data`), updatedData);
      
      // Update local storage
      if (mockRegionData[regionId]) {
        mockRegionData[regionId].data = updatedData;
        saveRegionsToStorage(mockRegionData);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating region data:', error);
    return false;
  }
};