
import { useCallback, useEffect, useState } from "react";
import {
  Search, MapPin, Droplets, Wind, Eye, Gauge, Sunrise, Sunset,
  Thermometer, CalendarDays, RefreshCw, CloudSun, Cloud, CloudRain,
  CloudSnow, Sun, Moon, CloudLightning, CloudFog, Navigation, Clock3
} from "lucide-react";
import "./App.css";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_API = "https://geocoding-api.open-meteo.com/v1/search";

const CONDITIONS = {
  0: ["Clear sky", "sun"],
  1: ["Mainly clear", "sun"],
  2: ["Partly cloudy", "partly"],
  3: ["Overcast", "cloud"],
  45: ["Foggy", "fog"],
  48: ["Rime fog", "fog"],
  51: ["Light drizzle", "rain"],
  53: ["Drizzle", "rain"],
  55: ["Heavy drizzle", "rain"],
  56: ["Freezing drizzle", "rain"],
  57: ["Freezing drizzle", "rain"],
  61: ["Light rain", "rain"],
  63: ["Moderate rain", "rain"],
  65: ["Heavy rain", "rain"],
  66: ["Freezing rain", "rain"],
  67: ["Freezing rain", "rain"],
  71: ["Light snow", "snow"],
  73: ["Snowfall", "snow"],
  75: ["Heavy snowfall", "snow"],
  77: ["Snow grains", "snow"],
  80: ["Rain showers", "rain"],
  81: ["Rain showers", "rain"],
  82: ["Heavy showers", "rain"],
  85: ["Snow showers", "snow"],
  86: ["Heavy snow showers", "snow"],
  95: ["Thunderstorm", "storm"],
  96: ["Thunderstorm with hail", "storm"],
  99: ["Severe thunderstorm", "storm"],
};

const getCondition = (code) =>
  CONDITIONS[code] || ["Changing conditions", "cloud"];

const getIcon = (code) => {
  const kind = getCondition(code)[1];
  if (kind === "sun") return Sun;
  if (kind === "partly") return CloudSun;
  if (kind === "rain") return CloudRain;
  if (kind === "snow") return CloudSnow;
  if (kind === "storm") return CloudLightning;
  if (kind === "fog") return CloudFog;
  return Cloud;
};

function WeatherIcon({ code, size = 24 }) {
  const Icon = getIcon(code);
  return <Icon size={size} strokeWidth={1.5} />;
}

function formatHour(value) {
  return new Date(value).toLocaleTimeString("en", {
    hour: "numeric",
    hour12: true,
  });
}

function formatClock(value) {
  return new Date(value).toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDay(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en", {
    weekday: "short",
  });
}

function formatSunTime(value) {
  if (!value) return "--:--";
  return formatClock(value);
}

function WeatherScene({ code, isDay }) {
  const kind = getCondition(code)[1];
  const showCloud = kind !== "sun";

  return (
    <div
      className={`weather-scene ${isDay ? "scene-day" : "scene-night"} scene-${kind}`}
      role="img"
      aria-label={`${getCondition(code)[0]}, ${isDay ? "daytime" : "nighttime"}`}
    >
      <div className="scene-sky-glow" />
      <div className="scene-stars">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            style={{
              "--x": `${(i * 43 + 7) % 100}%`,
              "--y": `${(i * 29 + 5) % 75}%`,
              "--delay": `${(i % 8) * -0.6}s`,
            }}
          />
        ))}
      </div>

      <div className="celestial">
        <div className="celestial-core" />
        <div className="celestial-glint" />
      </div>

      {isDay && (kind === "sun" || kind === "partly") && (
        <div className="sun-ray-ring">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ "--i": i }} />
          ))}
        </div>
      )}

      {!isDay && (kind === "sun" || kind === "partly") && (
        <div className="moon-crater crater-one" />
      )}
      {!isDay && (kind === "sun" || kind === "partly") && (
        <div className="moon-crater crater-two" />
      )}

      {showCloud && (
        <>
          <div className="glass-cloud cloud-distant">
            <span className="puff puff-a" />
            <span className="puff puff-b" />
            <span className="puff puff-c" />
          </div>
          <div className="glass-cloud cloud-main">
            <span className="puff puff-a" />
            <span className="puff puff-b" />
            <span className="puff puff-c" />
            <span className="puff puff-d" />
          </div>
        </>
      )}

      {(kind === "rain" || kind === "storm") && (
        <div className="rain-layer">
          {Array.from({ length: 38 }, (_, i) => (
            <span
              key={i}
              style={{
                "--x": `${(i * 37 + 4) % 100}%`,
                "--delay": `${(i % 11) * -0.19}s`,
                "--duration": `${0.65 + (i % 5) * 0.13}s`,
                "--length": `${13 + (i % 4) * 5}px`,
              }}
            />
          ))}
        </div>
      )}

      {kind === "snow" && (
        <div className="snow-layer">
          {Array.from({ length: 32 }, (_, i) => (
            <span
              key={i}
              style={{
                "--x": `${(i * 31 + 6) % 100}%`,
                "--delay": `${(i % 9) * -0.7}s`,
                "--duration": `${3 + (i % 5)}s`,
              }}
            />
          ))}
        </div>
      )}

      {kind === "fog" && (
        <div className="fog-layer">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      {kind === "storm" && <div className="lightning-layer" />}

      <div className="glass-rain-pool">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>

      <div className="scene-label">
        <span className="live-dot" />
        {isDay ? "DAYTIME ATMOSPHERE" : "NIGHT ATMOSPHERE"}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, unit = "" }) {
  return (
    <article className="metric glass">
      <div className="metric-icon"><Icon size={17} /></div>
      <div className="metric-text">
        <span>{label}</span>
        <strong>{value ?? "--"}<small>{unit}</small></strong>
      </div>
    </article>
  );
}

export default function App() {
  const [previewMode, setPreviewMode] = useState("auto");
  const [weatherPreview, setWeatherPreview] = useState("auto");
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("celsius");
  const [weather, setWeather] = useState(null);
  const [place, setPlace] = useState({
    name: "Coimbatore",
    country: "India",
    latitude: 11.0168,
    longitude: 76.9558,
    timezone: "Asia/Kolkata",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [clock, setClock] = useState(Date.now());

  const loadWeather = useCallback(async (location, nextUnit = unit) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "weather_code",
          "wind_speed_10m",
          "wind_direction_10m",
          "surface_pressure",
          "visibility",
        ].join(","),
        hourly: [
          "temperature_2m",
          "weather_code",
          "precipitation_probability",
          "relative_humidity_2m",
          "wind_speed_10m",
        ].join(","),
        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "sunrise",
          "sunset",
          "uv_index_max",
          "precipitation_probability_max",
        ].join(","),
        temperature_unit: nextUnit,
        wind_speed_unit: "kmh",
        precipitation_unit: "mm",
        timezone: "auto",
        forecast_days: "7",
      });

      const response = await fetch(`${WEATHER_API}?${params}`);
      if (!response.ok) throw new Error("Weather service is unavailable.");

      const data = await response.json();
      if (!data.current || !data.hourly || !data.daily) {
        throw new Error("The weather service returned incomplete data.");
      }

      const updatedPlace = {
        ...location,
        timezone: data.timezone || location.timezone || "auto",
      };

      setWeather(data);
      setPlace(updatedPlace);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Could not load weather. Try again.");
    } finally {
      setLoading(false);
    }
  }, [unit]);

  useEffect(() => {
    loadWeather({
      name: "Coimbatore",
      country: "India",
      latitude: 11.0168,
      longitude: 76.9558,
      timezone: "Asia/Kolkata",
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!weather) return;

    const timer = window.setInterval(() => {
      loadWeather(place);
    }, 15 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [weather, place, loadWeather]);

  async function searchCity(event) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${GEOCODE_API}?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`
      );
      if (!response.ok) throw new Error("City search failed.");

      const data = await response.json();
      const found = data.results?.[0];
      if (!found) throw new Error("City not found. Try another city name.");

      const location = {
        name: found.name,
        country: found.country || "",
        admin1: found.admin1 || "",
        latitude: found.latitude,
        longitude: found.longitude,
        timezone: found.timezone || "auto",
      };

      setQuery("");
      await loadWeather(location);
    } catch (err) {
      setError(err.message || "Unable to search for that city.");
      setLoading(false);
    }
  }

  function toggleUnit() {
    const next = unit === "celsius" ? "fahrenheit" : "celsius";
    setUnit(next);
    if (weather) loadWeather(place, next);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        loadWeather({
          name: "My location",
          country: "",
          latitude: coords.latitude,
          longitude: coords.longitude,
          timezone: "auto",
        });
      },
      () => {
        setLoading(false);
        setError("Location permission was denied. Search for a city instead.");
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }

  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;
  // const code = current?.weather_code ?? 2;
  // const isDay = current ? current.is_day === 1 : true;
const actualCode = current?.weather_code ?? 0;

const code =
  weatherPreview === "sunny"
    ? 0
    : weatherPreview === "cloudy"
      ? 3
      : weatherPreview === "rainy"
        ? 61
        : weatherPreview === "snowy"
          ? 71
          : actualCode;

  const isDay =
  previewMode === "day"
    ? true
    : previewMode === "night"
      ? false
      : current
        ? current.is_day === 1
        : true;
  const kind = getCondition(code)[1];

  const hours = (() => {
    if (!hourly || !current) return [];
    const currentHour = current.time.slice(0, 13);
    let start = hourly.time.findIndex((time) => time.slice(0, 13) === currentHour);
    if (start < 0) start = 0;
    return Array.from({ length: 6 }, (_, i) => start + i).filter(
      (i) => i < hourly.time.length
    );
  })();

  const direction = current
    ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
        Math.round(current.wind_direction_10m / 45) % 8
      ]
    : "--";

  const localTime = (() => {
    try {
      return new Intl.DateTimeFormat("en", {
        timeZone: place.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(clock));
    } catch {
      return "--:--";
    }
  })();

  const currentDate = (() => {
    try {
      return new Intl.DateTimeFormat("en", {
        timeZone: place.timezone,
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date(clock));
    } catch {
      return "";
    }
  })();

  const minTemp = daily ? Math.min(...daily.temperature_2m_min) : 0;
  const maxTemp = daily ? Math.max(...daily.temperature_2m_max) : 1;
  const tempSpan = Math.max(1, maxTemp - minTemp);

  return (
    <main
      className={`weather-app ${isDay ? "day-mode" : "night-mode"} weather-${kind}`}
      id="home"
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grain" />

      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark"><CloudSun size={22} /></span>
          <span><small>YOUR SKY, YOUR STORY</small></span>
        </a>

        <div className="topbar-status">
          <span className="live-dot" /> LIVE FORECAST
        </div>

        <button
          className="icon-button"
          onClick={() => loadWeather(place)}
          title="Refresh weather"
          aria-label="Refresh weather"
        >
          <RefreshCw size={17} className={loading ? "spin" : ""} />
        </button>
      </header>

      <section className="search-row">
        <form className="search-box glass" onSubmit={searchCity}>
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search any city..."
            aria-label="Search city"
          />
          <button type="submit" disabled={loading}>
            Explore
          </button>
        </form>

        <button className="location-button glass" onClick={useMyLocation}>
          <Navigation size={16} /> My location
        </button>
      </section>

      
<div className="weather-test-controls glass">
  <span className="eyebrow">WEATHER CONDITION</span>

  <div className="weather-test-buttons">
    {[
      ["auto", "Live weather"],
      ["sunny", "☀️ Sunny"],
      ["cloudy", "☁️ Cloudy"],
      ["rainy", "🌧️ Rainy"],
      ["snowy", "❄️ Snowy"],
    ].map(([value, label]) => (
      <button
        key={value}
        type="button"
        className={weatherPreview === value ? "active" : ""}
        onClick={() => setWeatherPreview(value)}
      >
        {label}
      </button>
    ))}
  </div>
</div>


      
<div className="preview-controls glass">
  <div className="preview-copy">
    <span className="eyebrow">ATMOSPHERE PREVIEW</span>
    <span>Test your weather scenes</span>
  </div>

  <div className="preview-switch" aria-label="Choose weather scene preview">
    <button
      type="button"
      className={previewMode === "auto" ? "active" : ""}
      onClick={() => setPreviewMode("auto")}
    >
      <CloudSun size={15} />
      Auto
    </button>

    <button
      type="button"
      className={previewMode === "day" ? "active" : ""}
      onClick={() => setPreviewMode("day")}
    >
      <Sun size={15} />
      Day
    </button>

    <button
      type="button"
      className={previewMode === "night" ? "active" : ""}
      onClick={() => setPreviewMode("night")}
    >
      <Moon size={15} />
      Night
    </button>
  </div>
</div>


      {error && (
        <div className="error-message" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">×</button>
        </div>
      )}

      <section className="hero-grid">
        <article className="hero-main glass">
          <div className="hero-heading">
            <div>
              <div className="eyebrow"><span className="live-dot" /> CURRENT CONDITIONS</div>
              <h1>{place.name}</h1>
              <p className="location-line">
                <MapPin size={14} />
                {[place.admin1, place.country].filter(Boolean).join(", ") ||
                  (place.name === "My location" ? "Your current location" : "Selected location")}
              </p>
            </div>

            <button className="unit-toggle" onClick={toggleUnit} aria-label="Change temperature units">
              <span className={unit === "celsius" ? "selected" : ""}>°C</span>
              <span className={unit === "fahrenheit" ? "selected" : ""}>°F</span>
            </button>
          </div>

          {!weather && loading ? (
            <div className="loading-state">
              <div className="loading-orb" />
              <p>Reading the atmosphere...</p>
            </div>
          ) : (
            <>
              <div className="hero-weather">
                <div className="temperature-block">
                  <div className="temperature">
                    {current ? Math.round(current.temperature_2m) : "--"}<sup>°</sup>
                  </div>
                  <p className="condition">{getCondition(code)[0]}</p>
                  <p className="feels-like">
                    Feels like {current ? Math.round(current.apparent_temperature) : "--"}°
                  </p>
                </div>

                <div className="scene-wrap">
                  <WeatherScene code={code} isDay={isDay} />
                </div>
              </div>

              <div className="hero-bottom">
                <div>
                  <span className="muted-label">TODAY'S RANGE</span>
                  <strong>
                    {daily ? Math.round(daily.temperature_2m_min[0]) : "--"}°
                    <span className="range-divider"> / </span>
                    {daily ? Math.round(daily.temperature_2m_max[0]) : "--"}°
                  </strong>
                </div>
                <div className="sun-times">
                  <span><Sunrise size={15} /> {formatSunTime(daily?.sunrise?.[0])}</span>
                  <span><Sunset size={15} /> {formatSunTime(daily?.sunset?.[0])}</span>
                </div>
              </div>
            </>
          )}

          {loading && weather && <div className="refresh-indicator">Updating forecast…</div>}
        </article>

        <aside className="hero-side">
          <article className="side-clock glass">
            <div className="eyebrow"><Clock3 size={13} /> LOCAL TIME</div>
            <strong>{localTime}</strong>
            <span>{currentDate || place.timezone}</span>
            <div className="clock-orbit"><span /></div>
          </article>

          <div className="metrics-grid">
            <Metric icon={Droplets} label="Humidity" value={current?.relative_humidity_2m} unit="%" />
            <Metric icon={Wind} label="Wind speed" value={current ? Math.round(current.wind_speed_10m) : "--"} unit=" km/h" />
            <Metric icon={Thermometer} label="Feels like" value={current ? Math.round(current.apparent_temperature) : "--"} unit="°" />
            <Metric icon={Gauge} label="Pressure" value={current ? Math.round(current.surface_pressure) : "--"} unit=" hPa" />
            <Metric
              icon={Eye}
              label="Visibility"
              value={current ? (current.visibility / 1000).toFixed(1) : "--"}
              unit=" km"
            />
            <Metric icon={Navigation} label="Wind direction" value={direction} />
          </div>
        </aside>
      </section>

      <section className="forecast-section glass">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><Clock3 size={13} /> THE NEXT HOURS</div>
            <h2>Hourly forecast</h2>
          </div>
          <span className="section-note">Next 6 hours</span>
        </div>

        <div className="hourly-list">
          {hours.map((index) => (
            <article className="hour-card" key={hourly.time[index]}>
              <span className="hour-time">
                {index === hours[0] ? "NOW" : formatHour(hourly.time[index])}
              </span>
              <div className={`mini-weather ${getCondition(hourly.weather_code[index])[1]}`}>
                <WeatherIcon code={hourly.weather_code[index]} size={27} />
              </div>
              <strong>{Math.round(hourly.temperature_2m[index])}°</strong>
              <span className="hour-rain">
                <Droplets size={12} />
                {hourly.precipitation_probability[index] ?? 0}%
              </span>
            </article>
          ))}
          {!weather && <p className="empty-state">Hourly forecast will appear here.</p>}
        </div>
      </section>

      <section className="forecast-section weekly-section glass">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><CalendarDays size={13} /> PLAN AHEAD</div>
            <h2>7-day forecast</h2>
          </div>
          <span className="section-note">Daily outlook</span>
        </div>

        <div className="weekly-list">
          {daily?.time.map((date, index) => (
            <article className="day-row" key={date}>
              <div className="day-name">
                <strong>{index === 0 ? "Today" : formatDay(date)}</strong>
                <span>{date.slice(5).replace("-", "/")}</span>
              </div>

              <div className={`day-icon ${getCondition(daily.weather_code[index])[1]}`}>
                <WeatherIcon code={daily.weather_code[index]} size={23} />
              </div>

              <div className="day-condition">
                {getCondition(daily.weather_code[index])[0]}
              </div>

              <div className="day-rain">
                <Droplets size={13} />
                {daily.precipitation_probability_max[index] ?? 0}%
              </div>

              <div className="temperature-range">
                <span>{Math.round(daily.temperature_2m_min[index])}°</span>
                <div className="range-track">
                  <div
                    className="range-fill"
                    style={{
                      left: `${((daily.temperature_2m_min[index] - minTemp) / tempSpan) * 100}%`,
                      width: `${Math.max(5, ((daily.temperature_2m_max[index] - daily.temperature_2m_min[index]) / tempSpan) * 100)}%`,
                    }}
                  />
                </div>
                <strong>{Math.round(daily.temperature_2m_max[index])}°</strong>
              </div>
            </article>
          ))}
          {!weather && <p className="empty-state">Your weekly forecast will appear here.</p>}
        </div>
      </section>

      <footer className="footer">
        <a className="footer-brand" href="#home"><CloudSun size={17} /> AS WEATHER </a>
        <span>Made for the love of the atmosphere.</span>
        <span>
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Connecting to live weather"}
        </span>
      </footer>
    </main>
  );
}
