import { getForecast, createWeatherIcon } from './weather.service.js'
import { getGeolocation } from './map.service.js'

const APP = {
  data: [],
  daysInterval: null,
  hoursInterval: null,
  latitude: null,
  longitude: null,
  currentCityName: null,
  init: () => {
    let timeArray = []
    for (var i = 0; i < localStorage.length; i++) {
      timeArray[i] = JSON.parse(localStorage.key(i))
      console.log(timeArray[i])
    }
    let sortedArray = timeArray.sort((a, b) => {
      if (a.time < b.time) {
        return 1
      }
      if (a.time > b.time) {
        return -1
      } else {
        return 0
      }
    })
    console.log(JSON.stringify(sortedArray))
    let finalValue = JSON.stringify(sortedArray[0])
    console.log(finalValue)
    let data = localStorage.getItem(finalValue)
    APP.data = JSON.parse(data)
console.log(APP.data);
APP.latitude = APP.data.lat;
APP.longitude = APP.data.lon;
APP.cityName();

    let currentWeatherData = []
    currentWeatherData.push(APP.data.current)
    // APP.displayData(APP.data);
    APP.displayCurrentData(currentWeatherData)
    document
      .getElementById('searchResult')
      .addEventListener('click', APP.searchWeather)
    document
      .getElementById('currentLocation')
      .addEventListener('click', APP.currentLocation)
    document
      .getElementById('sixDays')
      .addEventListener('click', APP.sixDaysData)
      console.log("click days")


    document
      .getElementById('sixHours')
      .addEventListener('click', APP.sixHourData)
      console.log("click hours")

  },
  searchWeather: async function (ev) {
    ev.preventDefault()
    try {
      let searchResult = document.getElementById('search').value
      console.log(searchResult)
      if (searchResult) {
        const coord = await getGeolocation(searchResult)
        const forecast = await getForecast({ coord })
console.log(coord)
APP.latitude = coord.lat;
APP.longitude = coord.lon;
APP.cityName();
        APP.data = forecast
        console.log(forecast)

        let searchData = []
        searchData.push(forecast.current)
        console.log(searchData)

        APP.displayCurrentData(searchData)

        let timeStamp = Date.now()
        let key = {
          city: searchResult,
          time: timeStamp
        }
        localStorage.setItem(JSON.stringify(key), JSON.stringify(forecast))
      }
    } catch (error) {
      console.log(error.message)
    }
  },
  currentLocation: async function (ev) {
    let coords = {
      latitude: null,
      longitude: null,
      timestamp: null
    }
    let options = {
      enableHighAccuracy: true,
      maximumAge: 1000 * 60 * 5,
      timeout: 20000
    }
    navigator.geolocation.getCurrentPosition(APP.success, APP.failure, options)
  },
  success: async function (position) {
    console.log('Success')
    let lat = position.coords.latitude.toFixed(2)
    let lon = position.coords.longitude.toFixed(2)

    let currentData = await getForecast({ lat, lon })
    // let currentData = await getForecast({ coords })
    APP.latitude = lat;
    APP.longitude = lon;
    APP.cityName();

    let currentTime = Date.now()
    let currentKey = {
      city: 'Current Location',
      time: currentTime
    }

    localStorage.setItem(
      JSON.stringify(currentKey),
      JSON.stringify(currentData)
    )

    console.log(currentData)

    let myLocationData = []
    myLocationData.push(currentData.current)
    console.log(myLocationData)

    APP.displayCurrentData(myLocationData)
  },
  failure: async function (err) {
    console.warn(`ERROR(${err.code}): ${err.message}`)
  },
  cityName: async function () {
    const API_TOKEN = 'pk.fd65758d98075bdcf3e65b8dd02f3365';
const BASE_URL = 'https://us1.locationiq.com/v1';

    // let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${APP.latitude},${APP.longitude}&key=AIzaSyAfO4e7zFsX3uZ4NiN49vKfAJhpbIjPfAo`
    let url = `${BASE_URL}/reverse.php?key=${API_TOKEN}&lat=${APP.latitude}&lon=${APP.longitude}&format=json`;
    let response = await fetch(url)
    let data = await response.json()
    let city = data.address['city'];
    let country = data.address['country'];
    APP.currentCityName = city + ", "+ country; 
    console.log(APP.currentCityName);

    let a = document.querySelector('.cityName > .heading');
    a.textContent = APP.currentCityName;
  },
  sixDaysData: async function (ev) {
    console.log('run day int.', APP.daysInterval);

    clearInterval(APP.daysInterval)
    clearInterval(APP.hoursInterval)
    APP.daysInterval = setInterval(APP.sixDaysData, 600000)

    // APP.searchWeather();
    let dailyData = []
    console.log(APP.data)
    dailyData = APP.data.daily
    console.log(dailyData)
    // dailyData.splice(6)
    APP.displayDailyData(dailyData)
    // let refresh = setInterval(APP.displayDailyData, 4000)
   

  },
  sixHourData: async function (ev) {
    console.log('run hour int.', APP.hoursInterval);

    clearInterval(APP.hoursInterval)
    clearInterval(APP.daysInterval)
    APP.hoursInterval = setInterval(APP.sixHourData, 600000)

    let hourlyData = []
    hourlyData = APP.data.hourly
    console.log(hourlyData)
    console.log("hourly data");
    // hourlyData.splice(6)
    APP.displayHourlyData(hourlyData)
  },
  displayHourlyData: async function (data) {
    let row = document.querySelector('.container')

    console.log(data)


    row.innerHTML = data.map((item, index) => {
      let dt = new Date(item.dt * 1000) //timestamp * 1000

      // let currentTime = new Date(date).toTimeString()
      // let hour = new Date().getHours()
      // let minutes = new Date().getMinutes();
      // let seconds
      let date = new Date(dt).getHours()
      let Time;
      if(date > 12){
        Time = date - 12 + ":00 PM"
      }
      else {
        Time = date + ":00 AM"
      }
console.log(Time);

      // console.log(Time)

      if (index <= 5) {
        return `<div class="row">
        <div class="col s12 m6">
        <div class="card">
        <h5 class="card-title p-2">${dt.toDateString()}</h5>
        <p class="card-hour">${Time}</p>
          <img src="http://openweathermap.org/img/wn/${
            item.weather[0].icon
          }@4x.png"
            class="card-img-top" alt="${item.weather[0].description}" />
          <div class="card-body">
            <h3 class="card-title">${item.weather[0].main}</h3>
            <p class="card-text">Temp ${item.temp}</p>
            <p class="card-text">High Feels like ${item.feels_like.day ||
              item.feels_like}&deg;C</p>
            <p class="card-text">Pressure ${item.pressure}mb</p>
            <p class="card-text">Humidity ${item.humidity}%</p>
            <p class="card-text">UV Index ${item.uvi}</p>
            <p class="card-text">Dewpoint ${item.dew_point}</p>
            <p class="card-text">Wind ${item.wind_speed}m/s, ${item.wind_deg}&deg;</p>
          </div>
        </div>
      </div>
      </div>`;
      }
    }).join(' ');
  },
  displayDailyData: async function (data) {
    console.log("function called")
    let row = document.querySelector('.container')

    console.log(data)

    row.innerHTML = data.map((item, index) => {
      let dt = new Date(item.dt * 1000) //timestamp * 1000
      let sr = new Date(item.sunrise * 1000).toTimeString()
      let ss = new Date(item.sunset * 1000).toTimeString()

      if (index <= 5) {
        return `<div class="row">
        <div class="col s12 m6">
          <div class="card">
          <h5 class="card-title p-2">${dt.toDateString()}</h5>
            <img src="http://openweathermap.org/img/wn/${
              item.weather[0].icon
            }@4x.png"
              class="card-img-top" alt="${item.weather[0].description}" />
            <div class="card-body">
              <h3 class="card-title">${item.weather[0].main}</h3>
              <p class="card-text">High ${item.temp.max}&deg;C Low ${
          item.temp.min
        }&deg;C</p>
              <p class="card-text">High Feels like ${item.feels_like.day ||
                item.feels_like}&deg;C</p>
              <p class="card-text">Pressure ${item.pressure}mb</p>
              <p class="card-text">Humidity ${item.humidity}%</p>
              <p class="card-text">UV Index ${item.uvi}</p>
              <p class="card-text">Dewpoint ${item.dew_point}</p>
              <p class="card-text">Wind ${item.wind_speed}m/s, ${item.wind_deg}&deg;</p>
              <p class="card-text">Sunrise ${sr}</p>
              <p class="card-text">Sunset ${ss}</p>
            </div>
          </div>
        </div>
        </div>`;
      }
    }).join(' ');
  },
  displayCurrentData: async function (data) {
    let row = document.querySelector('.container')

    console.log(data)

    row.innerHTML = data.map((item, index) => {
      let dt = new Date(item.dt * 1000) //timestamp * 1000
      let sr = new Date(item.sunrise * 1000).toTimeString()
      let ss = new Date(item.sunset * 1000).toTimeString()

      return `<div class="row">
      <div class="col s12 m6">
          <div class="card">
          <h5 class="card-title p-2">${dt.toDateString()}</h5>
            <img src="http://openweathermap.org/img/wn/${
              item.weather[0].icon
            }@4x.png"
              class="card-img-top" alt="${item.weather[0].description}" />
            <div class="card-body">
              <h3 class="card-title">${item.weather[0].main}</h3>
              <p class="card-text">Temp ${item.temp}&deg;C</p>
              <p class="card-text">High Feels like ${item.feels_like.day ||
                item.feels_like}&deg;C</p>
              <p class="card-text">Pressure ${item.pressure}mb</p>
              <p class="card-text">Humidity ${item.humidity}%</p>
              <p class="card-text">UV Index ${item.uvi}</p>
              <p class="card-text">Dewpoint ${item.dew_point}</p>
              <p class="card-text">Wind ${item.wind_speed}m/s, ${
        item.wind_deg
      }&deg;</p>
              <p class="card-text">Sunrise ${sr}</p>
              <p class="card-text">Sunset ${ss}</p>
            </div>
          </div>
        </div>
        </div>`;
    
    })
  },

};

document.addEventListener('DOMContentLoaded', APP.init)
