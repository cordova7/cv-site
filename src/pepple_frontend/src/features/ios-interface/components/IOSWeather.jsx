import React, { useState, useEffect } from 'react';

const IOSWeather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('New York');
  const [units, setUnits] = useState('metric'); // metric or imperial
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // Weather conditions map to icons
  const weatherIcons = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️',
    'unknown': '❓'
  };
  
  // Background colors based on weather and time
  const getBackgroundColor = (conditionCode, isDay) => {
    if (!conditionCode) return 'linear-gradient(to bottom, #4B91F7, #367BE2)'; // Default blue sky
    
    const code = conditionCode.substring(0, 2);
    const timeOfDay = isDay ? 'd' : 'n';
    
    switch (code) {
      case '01': // Clear sky
        return timeOfDay === 'd' 
          ? 'linear-gradient(to bottom, #4B91F7, #367BE2)' // Sunny day
          : 'linear-gradient(to bottom, #172941, #1F3A5F)'; // Clear night
      case '02': // Few clouds
      case '03': // Scattered clouds
        return timeOfDay === 'd'
          ? 'linear-gradient(to bottom, #6FB1FC, #4B91F7)' // Partly cloudy day
          : 'linear-gradient(to bottom, #233A5C, #355990)'; // Partly cloudy night
      case '04': // Broken/overcast clouds
        return 'linear-gradient(to bottom, #7D9DC0, #A8BDD3)'; // Cloudy
      case '09': // Shower rain
      case '10': // Rain
        return 'linear-gradient(to bottom, #5D7290, #7D9AB6)'; // Rainy
      case '11': // Thunderstorm
        return 'linear-gradient(to bottom, #2A3A4F, #435367)'; // Stormy
      case '13': // Snow
        return 'linear-gradient(to bottom, #B1D8F5, #CDEBFC)'; // Snowy
      case '50': // Mist/fog
        return 'linear-gradient(to bottom, #A3B5C7, #C7D5E3)'; // Foggy
      default:
        return 'linear-gradient(to bottom, #4B91F7, #367BE2)'; // Default blue sky
    }
  };

  // Simulated weather data (in a real app, fetch from an API)
  const getSimulatedWeatherData = (city) => {
    const cities = {
      'new york': {
        name: 'New York',
        country: 'US',
        temp: 18,
        feels_like: 17,
        humidity: 65,
        wind_speed: 5.2,
        wind_direction: 'NE',
        pressure: 1015,
        condition: 'Clear sky',
        condition_code: '01d',
        time: 'day',
      },
      'london': {
        name: 'London',
        country: 'UK',
        temp: 12,
        feels_like: 10,
        humidity: 75,
        wind_speed: 4.5,
        wind_direction: 'SW',
        pressure: 1012,
        condition: 'Light rain',
        condition_code: '10d',
        time: 'day',
      },
      'tokyo': {
        name: 'Tokyo',
        country: 'JP',
        temp: 22,
        feels_like: 23,
        humidity: 60,
        wind_speed: 3.1,
        wind_direction: 'SE',
        pressure: 1018,
        condition: 'Partly cloudy',
        condition_code: '02d',
        time: 'day',
      },
      'sydney': {
        name: 'Sydney',
        country: 'AU',
        temp: 25,
        feels_like: 26,
        humidity: 58,
        wind_speed: 6.7,
        wind_direction: 'E',
        pressure: 1016,
        condition: 'Sunny',
        condition_code: '01d',
        time: 'day',
      },
      'paris': {
        name: 'Paris',
        country: 'FR',
        temp: 15,
        feels_like: 14,
        humidity: 70,
        wind_speed: 3.8,
        wind_direction: 'NW',
        pressure: 1014,
        condition: 'Overcast',
        condition_code: '04d',
        time: 'day',
      }
    };
    
    const normalizedCity = city.toLowerCase();
    const cityData = cities[normalizedCity] || cities['new york']; // Default to New York
    
    // Generate 7 day forecast
    const forecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i) % 7;
      const dayTemp = cityData.temp + Math.round((Math.random() * 10) - 5); // Random variation
      const conditionCodes = ['01d', '02d', '03d', '04d', '09d', '10d', '13d'];
      const randomCondition = conditionCodes[Math.floor(Math.random() * conditionCodes.length)];
      
      forecast.push({
        day: days[dayIndex],
        high: dayTemp + Math.floor(Math.random() * 5),
        low: dayTemp - Math.floor(Math.random() * 8),
        condition_code: randomCondition
      });
    }
    
    return { current: cityData, forecast };
  };
  
  // Load weather data on component mount or location change
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, you would fetch from a weather API like:
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&appid=YOUR_API_KEY`);
        // const data = await response.json();
        
        // For this demo, use simulated data
        setTimeout(() => {
          const data = getSimulatedWeatherData(location);
          setWeather(data.current);
          setForecast(data.forecast);
          setIsLoading(false);
        }, 800); // Simulate network delay
      } catch (err) {
        setError('Could not fetch weather data. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchWeather();
  }, [location, units]);
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setLocation(searchValue);
      setShowSearch(false);
      setSearchValue('');
    }
  };
  
  // Toggle between Celsius and Fahrenheit
  const toggleUnits = () => {
    setUnits(units === 'metric' ? 'imperial' : 'metric');
  };
  
  // Convert temperature based on unit
  const formatTemp = (temp) => {
    if (units === 'imperial') {
      // Convert to Fahrenheit if using imperial
      temp = (temp * 9/5) + 32;
    }
    return `${Math.round(temp)}°${units === 'metric' ? 'C' : 'F'}`;
  };
  
  // Format wind speed
  const formatWindSpeed = (speed) => {
    if (units === 'imperial') {
      // Convert to mph if using imperial
      speed = speed * 2.237;
      return `${speed.toFixed(1)} mph`;
    }
    return `${speed.toFixed(1)} m/s`;
  };
  
  return (
    <div 
      className="ios-app-container weather-container"
      style={{ 
        background: weather ? getBackgroundColor(weather.condition_code, weather.time === 'day') : 'linear-gradient(to bottom, #4B91F7, #367BE2)'
      }}
    >
      {/* Search overlay */}
      {showSearch && (
        <div className="weather-search-overlay">
          <form onSubmit={handleSearchSubmit}>
            <div className="weather-search-input-container">
              <input
                type="text"
                className="weather-search-input"
                placeholder="Search for a city..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
              />
              <button type="button" className="weather-search-cancel" onClick={() => setShowSearch(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Header with location and search */}
      <div className="weather-header">
        <button className="weather-search-button" onClick={() => setShowSearch(true)}>
          🔍
        </button>
        <h1 className="weather-location">
          {isLoading ? 'Loading...' : (weather ? `${weather.name}, ${weather.country}` : 'Location not found')}
        </h1>
        <button className="weather-units-button" onClick={toggleUnits}>
          {units === 'metric' ? '°F' : '°C'}
        </button>
      </div>
      
      {error && (
        <div className="weather-error">
          <p>{error}</p>
          <button onClick={() => setLocation('New York')}>Try default location</button>
        </div>
      )}
      
      {/* Main weather data */}
      {!isLoading && weather && (
        <div className="weather-main">
          <div className="weather-current">
            <div className="weather-condition-icon">
              {weatherIcons[weather.condition_code] || weatherIcons.unknown}
            </div>
            <div className="weather-temp">{formatTemp(weather.temp)}</div>
            <div className="weather-condition">{weather.condition}</div>
            <div className="weather-feels-like">Feels like {formatTemp(weather.feels_like)}</div>
          </div>
          
          {/* Weather details */}
          <div className="weather-details">
            <div className="weather-detail-item">
              <span className="weather-detail-label">Humidity</span>
              <span className="weather-detail-value">{weather.humidity}%</span>
            </div>
            <div className="weather-detail-item">
              <span className="weather-detail-label">Wind</span>
              <span className="weather-detail-value">
                {formatWindSpeed(weather.wind_speed)} {weather.wind_direction}
              </span>
            </div>
            <div className="weather-detail-item">
              <span className="weather-detail-label">Pressure</span>
              <span className="weather-detail-value">{weather.pressure} hPa</span>
            </div>
          </div>
          
          {/* Forecast */}
          <div className="weather-forecast">
            <h2 className="weather-forecast-title">7-Day Forecast</h2>
            <div className="weather-forecast-list">
              {forecast.map((day, index) => (
                <div key={index} className="weather-forecast-item">
                  <span className="weather-forecast-day">{day.day}</span>
                  <span className="weather-forecast-icon">
                    {weatherIcons[day.condition_code] || weatherIcons.unknown}
                  </span>
                  <span className="weather-forecast-high">{formatTemp(day.high)}</span>
                  <span className="weather-forecast-low">{formatTemp(day.low)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IOSWeather; 