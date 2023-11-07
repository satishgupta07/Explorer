import React from "react";

const WeatherData = (props) => {
  const getTime = (timeStamp) => {
    return `${new Date(timeStamp * 1000).getHours()} : ${new Date(
      timeStamp * 1000
    ).getMinutes()}`;
  };

  return (
    <div className="weatherData">
      <div className="currtemp">
        <div className="tempAndLogo">
          <div className="flex justify-around mt-4">
            <img src={props.imageUrl} width={100} alt="icon" />
            <div className="mt-4">
              <p className="text-4xl">
                {Math.round(props.weatherData.temp)}&deg;C
              </p>
              <p className="text-xl mt-1">{props.weather.description}</p>
            </div>
          </div>
          <div className="windData flex justify-around mt-4 p-2 border-indigo-100 rounded-lg shadow">
            <div className="text-xl text-center">
              <p>Min Temp:{" "}</p>
              <p>{Math.round(props.weatherData.temp_min)}&deg;C</p>
            </div>
            <div className="text-xl text-center">
              <p>Max Temp:{" "}</p>
              <p>{Math.round(props.weatherData.temp_max)}&deg;C</p>
            </div>
          </div>
        </div>
      </div>
      <div id="scrolledItem" className="forcastdata mt-4">
        <div className="flex justify-around mt-4">
          <div className="text-center p-6 border-indigo-100 rounded-lg shadow">
            <p>Sunrise</p>
            <img
              src={
                "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/sunrise.svg"
              }
              width={50}
              alt="icon"
            />
            <p>{getTime(props.city.sunrise)}</p>
          </div>
          <div className="text-center p-6 border-indigo-100 rounded-lg shadow">
            <p>Humidity</p>
            <img
              src={
                "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/humidity.svg"
              }
              width={50}
              alt="icon"
            />
            <p>{props.weatherData.humidity}&nbsp;mm</p>
          </div>
        </div>
        <div className="flex justify-around mt-4">
          <div className="text-center p-6 border-indigo-100 rounded-lg shadow">
            <p>Wind</p>
            <img
              src={
                "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/wind.svg"
              }
              width={50}
              alt="icon"
            />
            <p>{props.windData.speed}&nbsp;mph</p>
          </div>
          <div className="text-center p-6 border-indigo-100 rounded-lg shadow">
            <p>Presure</p>
            <img
              src={
                "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/pressure-low.svg"
              }
              width={50}
              alt="icon"
            />
            <p>{props.weatherData.pressure}&nbsp;mb</p>
          </div>
        </div>
        <div className="flex justify-around mt-4">
          <div className="text-center p-6 border-indigo-100 rounded-lg shadow">
            <p>Sunset</p>
            <img
              src={
                "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/sunset.svg"
              }
              width={50}
              alt="icon"
            />
            <p>{getTime(props.city.sunset)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherData;
