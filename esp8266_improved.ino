#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// WiFi credentials
#define WIFI_SSID "babu"
#define WIFI_PASSWORD "06238853"

// Firebase config
#define FIREBASE_HOST "air-quality-13c25-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "7NrMjBEBL5mE4oHnkGDIVuGw2t1tQLCAhHx3HzPK"

// Sensor pins
#define DHTPIN 2
#define DHTTYPE DHT11
#define MQ135_ANALOG_PIN A0
#define MQ135_DIGITAL_PIN 16

// Configuration
#define MQ135_BASELINE 70
#define SEND_INTERVAL 5000
#define MAX_RETRIES 3
#define SENSOR_LOCATION "Hubli_Central"
#define DEVICE_ID "ESP8266_001"

// Objects
DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbData;
FirebaseAuth auth;
FirebaseConfig config;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// Variables
int readingCount = 1;
unsigned long lastSensorRead = 0;
unsigned long lastTimeSync = 0;
bool timeSynced = false;
float tempHistory[10] = {0};
float humHistory[10] = {0};
float aqiHistory[10] = {0};
int historyIndex = 0;

// Enhanced air quality calculation
struct AirQualityData {
  float temperature;
  float humidity;
  int mq135_analog;
  int mq135_digital;
  int pollution_level;
  int aqi;
  String air_quality;
  bool gas_detected;
  float co2_estimate;
  float tvoc_estimate;
  float pressure_estimate;
  float dew_point;
  float heat_index;
  float temp_trend;
  float hum_trend;
  float aqi_trend;
};

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌬️ Air Quality Monitor Starting...");
  
  // Initialize sensors
  dht.begin();
  pinMode(MQ135_DIGITAL_PIN, INPUT);
  
  // Initialize NTP
  timeClient.begin();
  timeClient.setTimeOffset(19800); // IST offset (5:30 hours)
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize Firebase
  initializeFirebase();
  
  // Get the last reading number from Firebase
  getLastReadingNumber();
  
  Serial.println("✅ Setup complete!");
}

void loop() {
  // Sync time every hour
  if (millis() - lastTimeSync >= 3600000 || !timeSynced) {
    syncTime();
    lastTimeSync = millis();
  }
  
  // Read and send sensor data
  if (millis() - lastSensorRead >= SEND_INTERVAL) {
    readAndSendSensorData();
    lastSensorRead = millis();
  }
  
  // Handle WiFi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }
}

void connectToWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ WiFi connection failed!");
  }
}

void initializeFirebase() {
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Firebase.setMaxRetry(fbData, MAX_RETRIES);
  Firebase.setMaxRetry(fbData, MAX_RETRIES);
  
  Serial.println("🔥 Firebase initialized");
}

void getLastReadingNumber() {
  Serial.print("🔍 Finding last reading number...");
  
  // Try to get the latest reading first
  if (Firebase.getInt(fbData, "/latest_reading/reading_number")) {
    readingCount = fbData.intData() + 1;
    Serial.printf("✅ Found latest reading: %d, continuing from: %d\n", fbData.intData(), readingCount);
    return;
  }
  
  // If latest reading doesn't exist, try to find the highest reading number
  // Use a more efficient approach - check common ranges
  int maxReading = 0;
  
  // First, try to get the last reading number from a dedicated path
  if (Firebase.getInt(fbData, "/last_reading_number")) {
    readingCount = fbData.intData() + 1;
    Serial.printf("✅ Found last reading number: %d, continuing from: %d\n", fbData.intData(), readingCount);
    return;
  }
  
  // If that doesn't exist, check some recent reading numbers
  // Start from a reasonable high number and work backwards
  int startCheck = 100; // Adjust this based on your expected reading count
  
  for (int i = startCheck; i >= 1; i--) {
    String path = "/sensor_readings/reading_" + String(i);
    if (Firebase.getJSON(fbData, path)) {
      maxReading = i;
      break;
    }
    // Small delay to avoid overwhelming Firebase
    delay(5);
  }
  
  if (maxReading > 0) {
    readingCount = maxReading + 1;
    Serial.printf("✅ Found highest reading: %d, continuing from: %d\n", maxReading, readingCount);
  } else {
    readingCount = 1;
    Serial.println("✅ No existing readings found, starting from: 1");
  }
}

void syncTime() {
  Serial.print("🕒 Syncing time...");
  timeClient.update();
  if (timeClient.isTimeSet()) {
    timeSynced = true;
    Serial.println("✅ Time synced: " + timeClient.getFormattedTime());
  } else {
    Serial.println("❌ Time sync failed");
  }
}

void readAndSendSensorData() {
  AirQualityData data = readSensorData();
  
  if (data.temperature == -999) {
    Serial.println("❌ Failed to read sensor data!");
    return;
  }
  
  // Update history arrays
  updateHistory(data);
  
  // Calculate trends
  data.temp_trend = calculateTrend(tempHistory);
  data.hum_trend = calculateTrend(humHistory);
  data.aqi_trend = calculateTrend(aqiHistory);
  
  // Send to Firebase
  sendToFirebase(data);
  
  // Print to serial
  printSensorData(data);
}

AirQualityData readSensorData() {
  AirQualityData data;
  
  // Read DHT sensor
  data.humidity = dht.readHumidity();
  data.temperature = dht.readTemperature();
  
  // Check for valid readings
  if (isnan(data.humidity) || isnan(data.temperature)) {
    data.temperature = -999; // Error indicator
    return data;
  }
  
  // Read MQ135 sensor
  data.mq135_analog = analogRead(MQ135_ANALOG_PIN);
  data.mq135_digital = digitalRead(MQ135_DIGITAL_PIN);
  
  // Calculate pollution level
  data.pollution_level = max(0, data.mq135_analog - MQ135_BASELINE);
  
  // Enhanced AQI calculation
  data.aqi = calculateAQI(data.pollution_level, data.temperature, data.humidity);
  
  // Air quality status
  data.air_quality = getAirQualityStatus(data.aqi);
  data.gas_detected = data.pollution_level > 100;
  
  // Additional calculations
  data.co2_estimate = estimateCO2(data.mq135_analog, data.temperature, data.humidity);
  data.tvoc_estimate = estimateTVOC(data.mq135_analog);
  data.pressure_estimate = estimatePressure(data.temperature, data.humidity);
  data.dew_point = calculateDewPoint(data.temperature, data.humidity);
  data.heat_index = calculateHeatIndex(data.temperature, data.humidity);
  
  return data;
}

int calculateAQI(int pollution, float temp, float humidity) {
  // Enhanced AQI calculation considering temperature and humidity
  float tempFactor = 1.0;
  float humFactor = 1.0;
  
  // Temperature correction (higher temp = higher pollution impact)
  if (temp > 30) tempFactor = 1.2;
  else if (temp > 25) tempFactor = 1.1;
  else if (temp < 15) tempFactor = 0.9;
  
  // Humidity correction (higher humidity = higher pollution impact)
  if (humidity > 80) humFactor = 1.3;
  else if (humidity > 60) humFactor = 1.1;
  else if (humidity < 30) humFactor = 0.9;
  
  int adjustedPollution = pollution * tempFactor * humFactor;
  
  // Convert to AQI scale (0-500)
  if (adjustedPollution <= 50) return adjustedPollution;
  else if (adjustedPollution <= 100) return 50 + (adjustedPollution - 50) * 1.0;
  else if (adjustedPollution <= 150) return 100 + (adjustedPollution - 100) * 1.0;
  else if (adjustedPollution <= 200) return 150 + (adjustedPollution - 150) * 1.0;
  else if (adjustedPollution <= 300) return 200 + (adjustedPollution - 200) * 1.0;
  else return 300 + min(adjustedPollution - 300, 200) * 1.0;
}

String getAirQualityStatus(int aqi) {
  if (aqi <= 50) return "Good";
  else if (aqi <= 100) return "Moderate";
  else if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  else if (aqi <= 200) return "Unhealthy";
  else if (aqi <= 300) return "Very Unhealthy";
  else return "Hazardous";
}

float estimateCO2(int mq135Value, float temp, float humidity) {
  // Rough CO2 estimation based on MQ135 readings
  // This is an approximation and should be calibrated
  float baseCO2 = 400; // Normal atmospheric CO2
  float sensorRatio = (float)mq135Value / MQ135_BASELINE;
  
  if (sensorRatio > 1.5) {
    return baseCO2 + (sensorRatio - 1.5) * 200;
  }
  return baseCO2;
}

float estimateTVOC(int mq135Value) {
  // Rough TVOC estimation
  float baseTVOC = 0.1; // ppb
  float sensorRatio = (float)mq135Value / MQ135_BASELINE;
  
  if (sensorRatio > 1.2) {
    return baseTVOC + (sensorRatio - 1.2) * 10;
  }
  return baseTVOC;
}

float estimatePressure(float temp, float humidity) {
  // Rough atmospheric pressure estimation
  // This is a simplified calculation
  float basePressure = 1013.25; // hPa at sea level
  float tempCorrection = (temp - 20) * 0.12;
  float humCorrection = (humidity - 50) * 0.01;
  
  return basePressure - tempCorrection + humCorrection;
}

float calculateDewPoint(float temp, float humidity) {
  // Magnus formula for dew point calculation
  float a = 17.27;
  float b = 237.7;
  float alpha = ((a * temp) / (b + temp)) + log(humidity / 100.0);
  return (b * alpha) / (a - alpha);
}

float calculateHeatIndex(float temp, float humidity) {
  // Simplified heat index calculation
  if (temp < 27) return temp;
  
  float hi = 0.5 * (temp + 61.0 + ((temp - 68.0) * 1.2) + (humidity * 0.094));
  
  if (hi > 80) {
    hi = -42.379 + 2.04901523 * temp + 10.14333127 * humidity - 0.22475541 * temp * humidity - 6.83783 * pow(10, -3) * temp * temp - 5.481717 * pow(10, -2) * humidity * humidity + 1.22874 * pow(10, -3) * temp * temp * humidity + 8.5282 * pow(10, -4) * temp * humidity * humidity - 1.99 * pow(10, -6) * temp * temp * humidity * humidity;
  }
  
  return hi;
}

void updateHistory(AirQualityData data) {
  tempHistory[historyIndex] = data.temperature;
  humHistory[historyIndex] = data.humidity;
  aqiHistory[historyIndex] = (float)data.aqi;  // Cast int to float
  
  historyIndex = (historyIndex + 1) % 10;
}

float calculateTrend(float* history) {
  if (historyIndex < 2) return 0;
  
  float sum = 0;
  int count = 0;
  
  for (int i = 0; i < 10; i++) {
    if (history[i] != 0) {
      sum += history[i];
      count++;
    }
  }
  
  if (count < 2) return 0;
  
  float avg = sum / count;
  float recent = history[(historyIndex - 1 + 10) % 10];
  
  return recent - avg;
}

void sendToFirebase(AirQualityData data) {
  // Create JSON object
  FirebaseJson json;
  
  // Basic sensor data
  json.set("temperature", data.temperature);
  json.set("humidity", data.humidity);
  json.set("mq135_analog", data.mq135_analog);
  json.set("mq135_digital", data.mq135_digital);
  json.set("pollution_level", data.pollution_level);
  json.set("aqi", data.aqi);
  json.set("air_quality", data.air_quality);
  json.set("gas_detected", data.gas_detected);
  
  // Enhanced metrics
  json.set("co2_estimate", data.co2_estimate);
  json.set("tvoc_estimate", data.tvoc_estimate);
  json.set("pressure_estimate", data.pressure_estimate);
  json.set("dew_point", data.dew_point);
  json.set("heat_index", data.heat_index);
  
  // Trends
  json.set("temp_trend", data.temp_trend);
  json.set("hum_trend", data.hum_trend);
  json.set("aqi_trend", (int)data.aqi_trend);  // Cast float to int for Firebase
  
  // Metadata
  json.set("reading_number", readingCount);
  json.set("device_id", DEVICE_ID);
  json.set("location", SENSOR_LOCATION);
  json.set("baseline", MQ135_BASELINE);
  json.set("timestamp", timeClient.getEpochTime());
  json.set("formatted_time", timeClient.getFormattedTime());
  json.set("wifi_rssi", WiFi.RSSI());
  json.set("wifi_ssid", WIFI_SSID);
  
  // Send to Firebase
  String path = "/sensor_readings/reading_" + String(readingCount);
  
  if (Firebase.setJSON(fbData, path, json)) {
    Serial.println("✅ Data uploaded: " + path);
    
    // Also update latest reading
    String latestPath = "/latest_reading";
    if (Firebase.setJSON(fbData, latestPath, json)) {
      Serial.println("✅ Latest reading updated");
    }
    
    // Store the current reading number for future lookups
    Firebase.setInt(fbData, "/last_reading_number", readingCount);
    
    readingCount++;
  } else {
    Serial.println("❌ Firebase Error: " + fbData.errorReason());
  }
}

void printSensorData(AirQualityData data) {
  Serial.println("\n📊 Sensor Data Summary:");
  Serial.printf("🌡️  Temperature: %.1f°C (Trend: %.1f)\n", data.temperature, data.temp_trend);
  Serial.printf("💧 Humidity: %.1f%% (Trend: %.1f)\n", data.humidity, data.hum_trend);
  Serial.printf("☁️  MQ135 Analog: %d\n", data.mq135_analog);
  Serial.printf("⚠️  MQ135 Digital: %d\n", data.mq135_digital);
  Serial.printf("🌬️  Pollution Level: %d\n", data.pollution_level);
  Serial.printf("📈 AQI: %d (Trend: %.1f)\n", data.aqi, data.aqi_trend);
  Serial.printf("🏷️  Air Quality: %s\n", data.air_quality.c_str());
  Serial.printf("🚨 Gas Detected: %s\n", data.gas_detected ? "YES" : "NO");
  Serial.printf("🌿 CO2 Estimate: %.1f ppm\n", data.co2_estimate);
  Serial.printf("💨 TVOC Estimate: %.1f ppb\n", data.tvoc_estimate);
  Serial.printf("🌪️  Pressure Estimate: %.1f hPa\n", data.pressure_estimate);
  Serial.printf("💧 Dew Point: %.1f°C\n", data.dew_point);
  Serial.printf("🔥 Heat Index: %.1f°C\n", data.heat_index);
  Serial.printf("🕒 Time: %s\n", timeClient.getFormattedTime().c_str());
  Serial.printf("📶 WiFi RSSI: %d dBm\n", WiFi.RSSI());
  Serial.println("─────────────────────────────────────");
} 