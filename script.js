const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent showers",
  95: "Thunderstorm",
  99: "Thunderstorm with hail",
};

const weatherIcons = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌧️",
  55: "🌧️",
  61: "🌦️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  80: "🌧️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  99: "⛈️",
};

function interpretWeatherCode(code) {
  return weatherCodes[code] || "Unknown";
}

function getWeatherIcon(code) {
  return weatherIcons[code] || "❓";
}

function getDayOfWeek(dateStr) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(dateStr).getDay()];
}

function formatDateDMY(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // month is zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function setBackgroundByWeather(code) {
  const body = document.getElementById("appBody");
  body.className = ""; // reset

  if ([0, 1].includes(code)) body.classList.add("sunny");
  else if ([2, 3].includes(code)) body.classList.add("cloudy");
  else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    body.classList.add("rainy");
  else if ([95, 96, 99].includes(code)) body.classList.add("storm");
  else if ([71, 73, 75].includes(code)) body.classList.add("snow");
  else if ([45, 48].includes(code)) body.classList.add("foggy");
  else body.style.background = "linear-gradient(to right, #8ec5fc, #e0c3fc)";
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (success) => {
      const lat = success.coords.latitude;
      const lon = success.coords.longitude;

      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          const current = data.current;
          const daily = data.daily;

          // Current weather display with icon
          const icon = getWeatherIcon(current.weather_code);
          document.getElementById(
            "temperature"
          ).textContent = `🌡 Temperature: ${current.temperature_2m}°C`;
          document.getElementById(
            "apparent"
          ).textContent = `Feels like: ${current.apparent_temperature}°C`;
          document.getElementById(
            "humidity"
          ).textContent = `💧 Humidity: ${current.relative_humidity_2m}%`;
          document.getElementById(
            "wind"
          ).textContent = `💨 Wind: ${current.wind_speed_10m} km/h`;
          document.getElementById(
            "condition"
          ).innerHTML = `${icon} ${interpretWeatherCode(current.weather_code)}`;

          setBackgroundByWeather(current.weather_code);

          // Forecast for next 5 days (starting from tomorrow)
          const forecastGrid = document.getElementById("forecast-grid");
          forecastGrid.innerHTML = ""; // clear previous if any

          for (let i = 1; i <= 4; i++) {
            const dayElement = document.createElement("div");
            dayElement.className = "forecast-day";
            const date = daily.time[i];
            const iconForecast = getWeatherIcon(daily.weather_code[i]);

            dayElement.innerHTML = `
            <h4>${getDayOfWeek(date)}</h4>
            <p>${formatDateDMY(date)}</p>
            <p>${iconForecast} Max: ${daily.temperature_2m_max[i]}°C</p>
            <p>${iconForecast} Min: ${daily.temperature_2m_min[i]}°C</p>
            <p>${interpretWeatherCode(daily.weather_code[i])}</p>
          `;
            forecastGrid.appendChild(dayElement);
          }
        });
    },
    () => {
      alert("Location access denied. Cannot fetch weather.");
    }
  );
} else {
  alert("Geolocation not supported.");
}
