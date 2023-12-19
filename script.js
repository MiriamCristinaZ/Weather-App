// API Key for OpenWeatherMap API
const apiKey = "552dce5a145d7f84e6d75ea58324f38b";

// Function to fetch coordinates from the city name
function fetchCoordinates(city) {
  const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.length) {
        fetchWeatherData(city, data[0].lat, data[0].lon);
      } else {
        alert("City not found");
      }
    })
    .catch((error) => console.error("Error fetching coordinates:", error));
}

// Function to fetch weather data using coordinates
function fetchWeatherData(city, lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(weatherUrl)
    .then((response) => response.json())
    .then((data) => updateUI(city, data))
    .catch((error) => console.error("Error fetching weather data:", error));
}

// Function to update the UI with the fetched weather data
function updateUI(city, weatherData) {
  const currentDate = new Date().toLocaleDateString();
  const currentWeather = weatherData.list[0];

  // Update current weather
  document.querySelector("#today").innerHTML = `
    <div class="current-weather">
      <h2>${city} (${currentDate})</h2>
      <img src="http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png" alt="Weather Icon" />
      <p>Temp: ${currentWeather.main.temp} °C</p>
      <p>Wind: ${currentWeather.wind.speed} KPH</p>
      <p>Humidity: ${currentWeather.main.humidity}%</p>
    </div>
  `;

  // Update 5-day forecast
  const forecast = document.querySelector("#forecast");
  forecast.innerHTML = "<h2>5-Day Forecast:</h2>";
  for (let i = 0; i < 5; i++) {
    const dailyWeather = weatherData.list[i * 8]; // 8 data points per day
    const date = new Date(dailyWeather.dt_txt).toLocaleDateString();

    forecast.innerHTML += `
      <div class="forecast-day">
        <h3>${date}</h3>
        <img src="http://openweathermap.org/img/wn/${dailyWeather.weather[0].icon}.png" alt="Weather Icon" />
        <p>Temp: ${dailyWeather.main.temp} °C</p>
        <p>Wind: ${dailyWeather.wind.speed} KPH</p>
        <p>Humidity: ${dailyWeather.main.humidity}%</p>
      </div>
    `;
  }
}

// Event listener for search button
document.querySelector("#search-button").addEventListener("click", function () {
  const city = document.querySelector("#search-input").value;
  if (city.trim() !== "") {
    fetchCoordinates(city);
    updateSearchHistory(city);
  }
});

// Function to update the search history
function updateSearchHistory(city) {
  if (city.trim() === "") {
    // If the input is empty or only whitespace, do not add it to the history
    return;
  }

  // Check if city already exists in search history to avoid duplicates
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city); // Add city to the beginning of the array
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }

  // Update search history in the UI
  displaySearchHistory();
}

// Function to display the search history
function displaySearchHistory() {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const historyList = document.querySelector(".history-list");
  historyList.innerHTML = ""; // Clear existing list

  searchHistory.forEach((city) => {
    historyList.innerHTML += `<li class="history-item" onclick="fetchCoordinates('${city}')">${city}</li>`;
  });
}

// On load, display the search history
window.onload = displaySearchHistory;
