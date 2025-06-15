# 🌬️ Air Quality Dashboard

An interactive air quality monitoring dashboard with real-time data visualization, ESP8266 sensor integration, and admin management capabilities.

## ✨ Features

### 🗺️ Interactive Map
- Click on colored regions to view detailed air quality data
- Real-time AQI visualization with color-coded regions
- Popup information with current air quality metrics
- Responsive design for all devices

### 📊 Data Visualization
- **Daily View**: 24-hour air quality trends with detailed metrics
- **Trend View**: Long-term air quality patterns
- Real-time sensor data cards
- Multiple air quality indicators (AQI, PM2.5, PM10, CO2, etc.)

### 🔧 Admin Panel
- **Add New Locations**: Click on map to set coordinates and add new monitoring points
- **Manage Existing Locations**: View, edit, and delete monitoring locations
- **Real-time Data Management**: Add test data to any location
- **Firebase Integration**: All data is stored in Firebase Realtime Database
- **Location Preview**: View detailed information and latest data for each location

### 🌐 Firebase Integration
- Real-time data synchronization
- Automatic data persistence
- Scalable cloud storage
- Real-time updates across all connected devices

### 📱 ESP8266 Integration
- Enhanced sensor data collection
- Automatic reading number continuation
- Trend analysis and environmental calculations
- WiFi reconnection and error handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup
- ESP8266 with DHT11 and MQ135 sensors

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/air-quality-dashboard.git
   cd air-quality-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Realtime Database
   - Update the Firebase configuration in `src/firebase.js`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deployment

### GitHub + Netlify (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select this repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Click "Deploy site"

3. **Automatic Deployments**
   - Every push to `main` branch will trigger a new deployment
   - Pull requests will create preview deployments
   - Netlify will automatically build and deploy your changes

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the build/ folder to your hosting service
```

## 📱 How to Use

### For Users
1. **View Live Data**: Check the sensor data cards at the top
2. **Select a Region**: Click on any colored region on the map
3. **View Charts**: Switch between Daily and Trend views
4. **Explore Data**: Hover over chart points for detailed information

### For Administrators
1. **Access Admin Panel**: Click the "🔧 Admin Panel" button in the header
2. **Add New Location**:
   - Enter location name and description
   - Click on the map to set coordinates
   - Click "Add Location" to save
3. **Manage Locations**:
   - View all existing locations
   - Add test data to any location
   - Delete locations as needed
4. **Monitor Data**: View real-time data updates for all locations

### For ESP8266 Setup
1. **Upload Code**: Use `esp8266_improved.ino` or `esp8266_simple.ino`
2. **Configure WiFi**: Update SSID and password in the code
3. **Connect Sensors**: DHT11 to pin 2, MQ135 to A0 and pin 16
4. **Monitor**: Check serial output for sensor data and Firebase uploads

## 🏗️ Architecture

### Frontend
- **React**: Modern UI framework
- **Leaflet**: Interactive mapping
- **Chart.js**: Data visualization
- **Firebase SDK**: Real-time database integration

### Backend
- **Firebase Realtime Database**: Cloud data storage
- **Real-time synchronization**: Automatic data updates
- **Scalable infrastructure**: Handles multiple users and locations

### Hardware
- **ESP8266**: WiFi-enabled microcontroller
- **DHT11**: Temperature and humidity sensor
- **MQ135**: Air quality sensor
- **Real-time data**: Continuous monitoring and upload

### Data Structure
```javascript
{
  "regions": {
    "regionId": {
      "id": "unique_id",
      "name": "Location Name",
      "coordinates": [latitude, longitude],
      "description": "Location description",
      "createdAt": "timestamp",
      "data": [
        {
          "timestamp": "ISO string",
          "aqi": 45,
          "temperature": 25,
          "humidity": 60,
          "pollution_level": 15,
          "co2_estimate": 420,
          "air_quality": "Good"
        }
      ]
    }
  },
  "sensor_readings": {
    "reading_X": {
      "temperature": 26.6,
      "humidity": 74,
      "aqi": 45,
      "air_quality": "Good",
      "device_id": "ESP8266_001",
      "location": "Hubli_Central",
      "timestamp": 1703123456
    }
  }
}
```

## 🎨 Customization

### Styling
- Modify `src/App.css` for visual customization
- Update color schemes and layouts
- Add custom animations and transitions

### Data Sources
- Integrate with real air quality sensors
- Connect to external APIs (OpenWeatherMap, AirVisual, etc.)
- Add custom data processing logic

### Features
- Add user authentication
- Implement data export functionality
- Add notification systems
- Create mobile app versions

## 🔧 Development

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run test suite
- `npm eject`: Eject from Create React App

### Project Structure
```
src/
├── components/          # React components
│   ├── AdminPanel.js    # Admin management interface
│   ├── InteractiveMap.js # Interactive map component
│   ├── AirQualityChart.js # Chart visualizations
│   ├── DailyDataChart.js  # Daily data view
│   └── LiveDataCards.js   # Real-time data cards
├── firebase.js         # Firebase configuration and functions
├── firebase_enhanced.js # Enhanced Firebase integration
├── App.js             # Main application component
└── App.css            # Main stylesheet

ESP8266/
├── esp8266_improved.ino # Full-featured ESP8266 code
├── esp8266_simple.ino   # Simplified ESP8266 code
└── platformio.ini      # PlatformIO configuration
```

## 🌟 Recent Updates

### Version 3.0 - GitHub + Netlify Integration
- ✅ GitHub repository setup
- ✅ Netlify automatic deployments
- ✅ Fixed map update issues
- ✅ Enhanced ESP8266 code with reading continuation
- ✅ Improved Firebase integration
- ✅ Better error handling and reliability

### Version 2.0 - Enhanced Admin Features
- ✅ Firebase Realtime Database integration
- ✅ Add new monitoring locations via map interface
- ✅ Real-time data management and updates
- ✅ Enhanced admin panel with location preview
- ✅ Test data generation for new locations
- ✅ Improved UI/UX with loading states and feedback
- ✅ Automatic map refresh when locations are added

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔗 Links

- **Live Demo**: [Your Netlify URL]
- **GitHub Repository**: [Your GitHub URL]
- **Firebase Console**: [Your Firebase Project]
- **ESP8266 Documentation**: [ESP8266_IMPROVEMENTS.md](ESP8266_IMPROVEMENTS.md)

---

**Built with ❤️ for environmental monitoring and public health awareness.** 