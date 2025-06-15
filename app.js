// Firebase config
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Setup temperature chart
const tempCtx = document.getElementById("tempChart").getContext("2d");
const tempChart = new Chart(tempCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperature (°C)',
      data: [],
      borderColor: 'red',
      fill: false
    }]
  }
});

// Live data from Firebase
function startLiveUpdates() {
  const ref = db.ref("liveData");

  ref.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    document.getElementById('tempCard').innerText = `Temperature: ${data.temperature}°C`;
    document.getElementById('humidityCard').innerText = `Humidity: ${data.humidity}%`;
    document.getElementById('aqiCard').innerText = `AQI: ${data.aqi}`;
    document.getElementById('gasCard').innerText = `Gas: ${data.gas} ppm`;

    const now = new Date().toLocaleTimeString();
    tempChart.data.labels.push(now);
    tempChart.data.datasets[0].data.push(data.temperature);
    if (tempChart.data.labels.length > 10) {
      tempChart.data.labels.shift();
      tempChart.data.datasets[0].data.shift();
    }
    tempChart.update();
  });
}

startLiveUpdates();

// Leaflet Map
const map = L.map('map').setView([15.3173, 75.7139], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);
L.circle([15.3173, 75.7139], { radius: 500, color: 'red' }).addTo(map).bindPopup("High AQI zone");

// Prediction Chart
const trendCtx = document.getElementById("trendChart").getContext("2d");
new Chart(trendCtx, {
  type: 'line',
  data: {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{
      label: 'Predicted AQI',
      data: [90, 110, 130, 150, 120, 100],
      borderColor: 'blue',
      fill: false
    }]
  }
});
