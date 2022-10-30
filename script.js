"use strict";

const currentLocationButton = document.querySelector(".fa-solid");
const weatherContainer = document.querySelector(".weather__days");
const highlightContainer = document.querySelector(".highlights");
const weatherSummary = document.querySelector(".weather__summary");

const navBar = document.querySelector(".nav__container");

const searchButton = document.querySelector(".search__button");
const locationButton = document.querySelector(".fa-location-crosshairs");

const search = document.getElementById("bar");

const loader = document.querySelector(".loader");

const options = {
  hour: "numeric",
  minute: "numeric",
  day: "numeric",
  month: "short",
  year: "2-digit",
  weekday: "short",
};

class weatherAPP {
  constructor() {
    this.weatherAPI();
    this.currentLocation();

    this.todayHighlight(this.weatherAPI());
    this.daysForecast(this.weatherAPI());
    this.weatherSummary(this.weatherAPI());

    locationButton.addEventListener("click", this.userLocation.bind(this));
    this.navBar();
  }

  location() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async currentLocation() {
    const { latitude: lat, longitude: lon } = (await this.location()).coords;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=5&appid=f5909aace6fb4cb18ea6b3a31403d18b`
    );

    const res = response;

    if (res.ok === true) {
      loader.classList.add("loader-hidden");
    }

    return await response.json();
  }

  // Weather API
  async weatherAPI() {
    const response = await fetch(
      "https://api.openweathermap.org/data/2.5/forecast?q=Lagos,NGA&cnt=5&appid=f5909aace6fb4cb18ea6b3a31403d18b"
    );
    const res = response;

    if (res.ok === true) {
      loader.classList.add("loader-hidden");
    }
    return await response.json();
  }

  // Weather Summary
  async weatherSummary(apiCall) {
    const weatherArr = await apiCall;
    const weather = (await apiCall).list[0];

    const date = new Date();

    const html = `
      <div class="summary">
        <div class="icon">
          <img src=http://openweathermap.org/img/wn/${
            weather.weather[0].icon
          }@2x.png alt="" class='img--icon'>
        </div>
        <div class="degree">
          <p>${Math.round(weather.main.temp - 273)}</p>
          <sup>o</sup>
        </div>
        <p class="weather__main">${weather.weather[0].main}</p>
        <p class="description">${weather.weather[0].description}</p>

        <div class="current__date">
          <p class="today">Today • ${new Intl.DateTimeFormat(
            "en-US",
            options
          ).format(date)}</p>
        </div>
        <div class="current__location">
          <i class="fa-solid fa-location-dot"></i>
          <p>${weatherArr.city.name}, ${weatherArr.city.country}</p>
        </div>
      </div>
    `;

    weatherSummary.insertAdjacentHTML("beforeend", html);
  }

  //Next 5 days forecast
  async daysForecast(apiCall) {
    const weatherArr = (await apiCall).list;
    weatherArr.map((weather) => {
      // Date Formatting
      const date = new Date(weather.dt_txt);

      const html = `
      <div class="day">
        <p class="date">${new Intl.DateTimeFormat("en-US", options).format(
          date
        )}</p>
        <img src=http://openweathermap.org/img/wn/${
          weather.weather[0].icon
        }@2x.png alt="" class='weather__img'>
        <div class="min_max">
          <p class="min">${Math.round(
            weather.main.temp_min - 273
          )}<sup>o</sup></p>
          <p class="max">${Math.round(
            weather.main.temp_max - 273
          )}<sup>o</sup></p>
        </div>
      </div>
    `;
      weatherContainer.insertAdjacentHTML("beforeend", html);
    });
  }

  //Today's Highlight
  async todayHighlight(apiCall) {
    const weather = (await apiCall).list[0];
    const deg = this.windDirection(weather.wind.deg);

    const html = `
          <div class="wind__status">
            <p id="p">Wind Status</p>
            <h3>${weather.wind.speed}<span>mps</span></h3>
            <p class="direction">${deg}</p>
          </div>

          <div class="hum">
            <p id="p">Humidity</p>
            <div class="humidity">
              <p>${weather.main.humidity}<span>%</span></p>
                <progress id="progress" value="${
                  weather.main.humidity
                }" max="100"></progress>
            </div>
          </div>

          <div class="visibility">
            <p>Visibility</p>
            <h3>${Math.round(weather.visibility / 1000).toFixed(
              1
            )}<span>KM</span></h3>
          </div>

          <div class="air__pressure">
            <p>Air Pressure</p>
            <h3 class="pressure">${weather.main.pressure}<span>hPa</span></h3>
          </div>`;

    highlightContainer.insertAdjacentHTML("beforeend", html);
  }

  // CurrentLocation
  async userLocation() {
    loader.classList.remove("loader-hidden");
    document.querySelector(".summary").remove();
    document.querySelector(".highlights").innerHTML = "";

    const weatherArr = (await this.currentLocation()).list;
    weatherArr.map(() => {
      document.querySelector(".day").remove();
    });

    this.daysForecast(this.currentLocation());
    this.todayHighlight(this.currentLocation());
    this.weatherSummary(this.currentLocation());
  }

  // Search weather based on location
  // Navigation Bar -- toggle on/off
  async navBar() {
    const html = `
        <div class="location--search hidden">
          <div class="x"><i class="fa-solid fa-xmark"></i></div>

          <div class="search--bar">
            <input type="text" id="fname" name="fname">
            <div id="bar"><p class="bar">Search</p></div>
          </div>

          <div class="cities">
            <p class="london city">London</p>
            <p class="nyc city">New York</p>
            <p class="tokyo city">Tokyo</p>
            <p class="amsterdam city">Amsterdam</p>
            <p class="rome city">Rome</p>
          </div>
        </div>
      `;

    navBar.insertAdjacentHTML("beforeend", html);

    // Toggle Switch ON
    searchButton.addEventListener("click", () => {
      document.querySelector(".weather__summary").classList.add("hidden");
      document.querySelector(".location--search").classList.remove("hidden");
      this.searchBar();
      this.searchLocation();
    });

    // Toggle Switch OFF
    const sideBar = document.querySelector(".fa-xmark");
    sideBar.addEventListener("click", () => {
      document.querySelector(".location--search").classList.add("hidden");
      document.querySelector(".weather__summary").classList.remove("hidden");
    });
  }

  // Seach Bar Location [london, New York, Tokyo, Amsterdam, Rome]
  async searchBar() {
    // search based on city
    const cities = document.querySelectorAll(".city");

    for (let i = 0; i < cities.length; i++) {
      cities[i].addEventListener("click", async () => {
        const city = cities[i].textContent.toLowerCase();

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=5&appid=f5909aace6fb4cb18ea6b3a31403d18b`
        );

        this.helper(response);
      });
    }
  }

  // Search various location based on city
  async searchLocation() {
    bar.addEventListener("click", async () => {
      const input = document.getElementById("fname");
      const city = input.value.toLowerCase();

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=5&appid=f5909aace6fb4cb18ea6b3a31403d18b`
      );

      this.helper(response);
      input.value = "";
    });
  }

  // Calculate Wind Direction
  windDirection(deg) {
    if (deg >= 11.25 && deg <= 33.75) {
      return "NNE";
    } else if (deg >= 33.75 && deg <= 56.25) {
      return "NE";
    } else if (deg >= 56.25 && deg <= 78.75) {
      return "ENE";
    } else if (deg >= 78.75 && deg <= 101.25) {
      return "E";
    } else if (deg >= 101.25 && deg <= 123.75) {
      return "ESE";
    } else if (deg >= 123.75 && deg <= 146.25) {
      return "SE";
    } else if (deg >= 146.25 && deg <= 168.75) {
      return "SSE";
    } else if (deg >= 168.75 && deg <= 191.25) {
      return "S";
    } else if (deg >= 191.25 && deg <= 213.75) {
      return "SSW";
    } else if (213.75 && deg <= 236.25) {
      return "SW";
    } else if (deg >= 236.25 && deg <= 258.75) {
      return "WSW";
    } else if (deg >= 258.75 && deg <= 281.25) {
      return "W";
    } else if (281.25 && deg <= 303.75) {
      return "WNW";
    } else if (deg >= 303.75 && deg <= 326.25) {
      return "NW";
    } else if (deg >= 326.25 && deg <= 348.75) {
      return "NNW";
    } else if (deg >= 348.75 && deg <= 11.75) {
      return "N";
    } else {
      console.log(`Error getting wind degree`);
    }
  }

  async helper(resp) {
    loader.classList.remove("loader-hidden");
    document.querySelector(".summary").remove();
    document.querySelector(".highlights").innerHTML = "";

    const weatherArr = (await this.currentLocation()).list;
    weatherArr.map(() => {
      document.querySelector(".day").remove();
    });

    const res = await resp.json();
    this.daysForecast(res);
    this.todayHighlight(res);
    this.weatherSummary(res);

    // close nav bar
    document.querySelector(".location--search").classList.add("hidden");
    document.querySelector(".weather__summary").classList.remove("hidden");
  }
}

const app = new weatherAPP();
