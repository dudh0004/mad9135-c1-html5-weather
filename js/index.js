import { getForecast, createWeatherIcon } from './weather.service.js'
import { getGeolocation } from './map.service.js'

const APP = {
  data: [],
  daysInterval: null,
  hoursInterval: null,
  dailyData: null,
  hourlyData: null,
  latitude: null,
  longitude: null,
  currentCityName: null,
  init: () => {
    let timeArray = []
    for (var i = 0; i < localStorage.length; i++) {
      timeArray[i] = JSON.parse(localStorage.key(i))
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
    let finalValue = JSON.stringify(sortedArray[0])
    let data = localStorage.getItem(finalValue)
    APP.data = JSON.parse(data)

    APP.currentCityName = finalValue['city'];

    if (data) {
      APP.latitude = APP.data.lat
      APP.longitude = APP.data.lon
      APP.cityName()
      let currentWeatherData = []
      currentWeatherData.push(APP.data.current)
      APP.dailyData = APP.data.daily
      APP.hourlyData = APP.data.hourly

      APP.displayCurrentData(currentWeatherData)
    }
    document
      .getElementById('searchResult')
      .addEventListener('click', APP.searchWeather)
    document
      .getElementById('currentLocation')
      .addEventListener('click', APP.currentLocation)
    document
      .getElementById('sixDays')
      .addEventListener('click', APP.sixDaysData)
    document
      .getElementById('sixHours')
      .addEventListener('click', APP.sixHourData)
  },
  searchWeather: async function (ev) {
    ev.preventDefault()
    try {
      let searchResult = document.getElementById('search').value
      if (searchResult) {
        const coord = await getGeolocation(searchResult)
        const forecast = await getForecast({ coord })
        APP.latitude = coord.lat
        APP.longitude = coord.lon
        APP.cityName()
        APP.data = forecast
        APP.dailyData = APP.data.daily
        APP.hourlyData = APP.data.hourly
        let searchData = []
        searchData.push(forecast.current)

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
    let lat = position.coords.latitude.toFixed(2)
    let lon = position.coords.longitude.toFixed(2)

    let currentData = await getForecast({ lat, lon })
    APP.latitude = lat
    APP.longitude = lon
    APP.cityName()
    let currentTime = Date.now()
    let currentKey = {
      city: APP.currentCityName,
      time: currentTime
    }

    localStorage.setItem( JSON.stringify(currentKey), JSON.stringify(currentData))

    let myLocationData = []
    myLocationData.push(currentData.current)
  
    APP.dailyData = currentData.daily;
    APP.hourlyData = currentData.hourly;

    APP.displayCurrentData(myLocationData)
  },
  failure: async function (err) {
    console.warn(`ERROR(${err.code}): ${err.message}`)
  },
  cityName: async function () {
    const API_TOKEN = 'pk.fd65758d98075bdcf3e65b8dd02f3365'
    const BASE_URL = 'https://us1.locationiq.com/v1'

    let url = `${BASE_URL}/reverse.php?key=${API_TOKEN}&lat=${APP.latitude}&lon=${APP.longitude}&format=json`
    let response = await fetch(url)
    let data = await response.json()
    let city = data.address['city']
    let country = data.address['country']
    APP.currentCityName = city + ', ' + country

    let heading = document.querySelector('.cityName > .heading')
    heading.textContent = APP.currentCityName
  },
  sixDaysData: async function (ev) {
    clearInterval(APP.daysInterval)
    clearInterval(APP.hoursInterval)
    APP.daysInterval = setInterval(APP.sixDaysData, 600000)

    APP.displayDailyData(APP.dailyData)
  },
  sixHourData: async function (ev) {
    clearInterval(APP.hoursInterval)
    clearInterval(APP.daysInterval)
    APP.hoursInterval = setInterval(APP.sixHourData, 600000)

    APP.displayHourlyData(APP.hourlyData)
  },
  displayHourlyData: async function (data) {
    let row = document.querySelector('.container')

    row.innerHTML = APP.hourlyData
      .map((item, index) => {
        let dt = new Date(item.dt * 1000) 
        let date = new Date(dt).getHours()
        let Time
        if (date > 12) {
          Time = date - 12 + ':00 PM'
        } else {
          Time = date + ':00 AM'
        }

        if (index <= 5) {
          return `<div class="row">
        <div class="col s12 m6">
        <div class="card">
        <h5 class="card-title p-2">${dt.toDateString()}</h5>
        <p class="card-hour">${Time}</p>
          <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png"
            class="card-img-top" alt="${item.weather[0].description}" />
          <div class="card-body">
            <h3 class="card-title">${item.weather[0].description}</h3>
            <p class="card-text">Temp :   ${item.temp}&deg;C</p>
            <p class="card-text">High Feels like :   ${item.feels_like}&deg;C</p>
            <p class="card-text">Pressure :  ${item.pressure}mb</p>
            <p class="card-text">Humidity :   ${item.humidity}%</p>
            <p class="card-text">UV Index :   ${item.uvi}</p>
            <p class="card-text">Dewpoint :   ${item.dew_point}</p>
            <p class="card-text">Wind :   ${item.wind_speed}m/s, ${item.wind_deg}&deg;</p>
          </div>
        </div>
      </div>
      </div>`
        }
      })
      .join(' ')
  },
  displayDailyData: async function (data) {
    let row = document.querySelector('.container')
    row.innerHTML = APP.dailyData
      .map((item, index) => {
        let dt = new Date(item.dt * 1000)
        let sr = new Date(item.sunrise * 1000).toTimeString()
        let ss = new Date(item.sunset * 1000).toTimeString()

        if (index <= 5) {
          return `<div class="row">
        <div class="col s12 m6">
          <div class="card">
          <h5 class="card-title p-2">${dt.toDateString()}</h5>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png"
              class="card-img-top" alt="${item.weather[0].description}" />
            <div class="card-body">
              <h3 class="card-title">${item.weather[0].description}</h3>
              <p class="card-text">High : ${item.temp.max}&deg;C , Low : ${item.temp.min}&deg;C</p>
              <p class="card-text">High Feels like : ${item.feels_like.day}&deg;C</p>
              <p class="card-text">Pressure : ${item.pressure}mb</p>
              <p class="card-text">Humidity : ${item.humidity}%</p>
              <p class="card-text">UV Index : ${item.uvi}</p>
              <p class="card-text">Dewpoint : ${item.dew_point}</p>
              <p class="card-text">Wind : ${item.wind_speed}m/s, ${item.wind_deg}&deg;</p>
              <p class="card-text">Sunrise : ${sr}</p>
              <p class="card-text">Sunset : ${ss}</p>
            </div>
          </div>
        </div>
        </div>`
        }
      })
      .join(' ')
  },
  displayCurrentData: async function (data) {
    let row = document.querySelector('.container')

    let current = data.map((item, index) => {
      let dt = new Date(item.dt * 1000)
      let sr = new Date(item.sunrise * 1000).toTimeString()
      let ss = new Date(item.sunset * 1000).toTimeString()

      return `<div class="row">
      <div class="col s12 m6">
          <div class="card">
          <h5 class="card-title p-2">Current</h5>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png"
              class="card-img-top" alt="${item.weather[0].description}" />
            <div class="card-body">
              <h3 class="card-title">${item.weather[0].description}</h3>
              <p class="card-text">Temp : ${item.temp}&deg;C</p>
              <p class="card-text">High Feels like : ${item.feels_like}&deg;C</p>
              <p class="card-text">Pressure : ${item.pressure}mb</p>
              <p class="card-text">Humidity : ${item.humidity}%</p>
              <p class="card-text">UV Index : ${item.uvi}</p>
              <p class="card-text">Dewpoint : ${item.dew_point}</p>
              <p class="card-text">Wind : ${item.wind_speed}m/s, ${item.wind_deg}&deg;</p>
              <p class="card-text">Sunrise ${sr}</p>
              <p class="card-text">Sunset ${ss}</p>
            </div>
          </div>
        </div>
        </div>`
    }).join(' ') 


    let next = APP.dailyData
    .map((item, index) => {
      let dt = new Date(item.dt * 1000)
      let sr = new Date(item.sunrise * 1000).toTimeString()
      let ss = new Date(item.sunset * 1000).toTimeString()

      if (index <= 1) {
        return `<div class="row">
      <div class="col s12 m6">
        <div class="card">
        <h5 class="card-title p-2">${dt.toDateString()}</h5>
          <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png"
            class="card-img-top" alt="${item.weather[0].description}" />
          <div class="card-body">
            <h3 class="card-title">${item.weather[0].description}</h3>
            <p class="card-text">High : ${item.temp.max}&deg;C , Low : ${item.temp.min}&deg;C</p>
            <p class="card-text">High Feels like : ${item.feels_like.day}&deg;C</p>
            <p class="card-text">Pressure : ${item.pressure}mb</p>
            <p class="card-text">Humidity : ${item.humidity}%</p>
            <p class="card-text">UV Index : ${item.uvi}</p>
            <p class="card-text">Dewpoint : ${item.dew_point}</p>
            <p class="card-text">Wind : ${item.wind_speed}m/s, ${item.wind_deg}&deg;</p>
            <p class="card-text">Sunrise : ${sr}</p>
            <p class="card-text">Sunset : ${ss}</p>
          </div>
        </div>
      </div>
      </div>`
      }
    })
    .join(' ')

    current = current + next;

    row.innerHTML = current;
    
  }
}

document.addEventListener('DOMContentLoaded', APP.init)
