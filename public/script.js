/**
 * Runs on page load, gets the default city's current and forecast weather
 * and updates the next days section.
 */
window.onload = async () => {
  const DEFAULT_CITY = "New York";

  try {
    // Get the API key from the server
    const response = await fetch("/api/config");
    const {API_KEY} = await response.json();

    // Get the current and forecast weather for the default city
    await getCurrentWeather(DEFAULT_CITY, API_KEY);
    await getForecastWeather(DEFAULT_CITY, API_KEY);

    // Update the next days section
    updateNextDays();
  } catch (error) {
    console.error("An error occurred while fetching the weather data:", error);
  }
};

const searchInputElement = document.querySelector(".search-input");
/**
 * Adds an event listener to the search input element to capitalize the first letter.
 */
searchInputElement.addEventListener("input", () => {
  // Get the current input value
  const text = searchInputElement.value;

  // Capitalize the first letter and concatenate it with the rest of the string
  const capitalizedText = text.charAt(0).toUpperCase() + text.slice(1);

  // Update the input value with the capitalized text
  searchInputElement.value = capitalizedText;
});

/**
 * Gets the current date and time and updates the day and date elements.
 */
const currentDate = new Date();
const day = currentDate.toLocaleString('en-US', { weekday: 'long' });
const date = currentDate.toLocaleString("en-GB", {
  /**
   * Options for the date formatting.
   * @type {Object}
   * @property {string} day - The day of the month, represented as a 2-digit number.
   * @property {string} month - The month, represented as a 3-character abbreviation.
   * @property {string} year - The year, represented as a 4-digit number.
   */
  day: "2-digit",
  month: "short",
  year: "numeric"
}).replace(/\//g, " ");

/**
 * Selectors for the day and date elements.
 * @type {HTMLElement}
 */
const dayElement = document.querySelector(".day");
const dateElement = document.querySelector(".date");

/**
 * Updates the day and date elements with the current date and time.
 */
dayElement.textContent = day;
dateElement.textContent = date;

/**
 * Updates the next days elements with the names of the days
 * of the week.
 *
 * @function updateNextDays
 */
function updateNextDays() {
  /**
   * Selectors for the next days elements.
   * @type {Array<string>}
   */
  const daysSelectors = [".js-day", ".js-day1", ".js-day2", ".js-day3"];
  let tempDate = new Date(currentDate);

  /**
   * Loops through the selectors and updates the elements
   * with the names of the days of the week.
   */
  daysSelectors.forEach((selector) => {
    /**
     * Increments the date by one day.
     */
    tempDate.setDate(tempDate.getDate() + 1);
    const dayName = tempDate.toLocaleString('en-US', { weekday: 'short' });
    const dayElement = document.querySelector(selector);

    if (dayElement) {
      dayElement.textContent = dayName;
    }
  });
}

updateNextDays();

let API_KEY;
fetch("/api/config")
  .then(response => response.json())
  .then(data => {
    API_KEY = data.API_KEY;
  });

const searchBtnElement = document.querySelector(".js-search-btn");

searchBtnElement.addEventListener("click", async () => {
  const city = document.querySelector(".search-input").value;

  if (city) {
    try {
      const response = await fetch("/api/config");
      const {API_KEY} = await response.json();

      await getCurrentWeather(city, API_KEY);
      await getForecastWeather(city, API_KEY);
    } catch (error) {
      console.error("An error occurred while fetching the weather data:", error);
    }
  } else {
    alert("Please enter a city name.");
  }
});

/**
 * Fetches the current weather data for a given city from the OpenWeatherMap API.
 * 
 * @param {string} city - The name of the city to fetch the current weather data for.
 * @param {string} API_KEY - The API key to use when making the request to the OpenWeatherMap API.
 */
const getCurrentWeather = async (city, API_KEY) => {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(apiUrl);

    // If the response is not ok, throw an error.
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Display the current weather data.
    displayCurrentWeather(data);
  } catch (error) {
    console.error("Failed: ", error);
    alert("Weather data could not be fetched. Please try again.");
  }
};

/**
 * Fetches the forecast weather data for a given city from the OpenWeatherMap API.
 * 
 * @param {string} city - The name of the city to fetch the forecast weather data for.
 * @param {string} API_KEY - The API key to use when making the request to the OpenWeatherMap API.
 */
const getForecastWeather = async (city, API_KEY) => {
  try {
    // Construct the API URL to fetch the forecast weather data.
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    // Make the request to the OpenWeatherMap API and get the response.
    const response = await fetch(apiUrl);

    // Parse the response as JSON and get the forecast data.
    const data = await response.json();
    const forecastData = data.list;

    // Create an array to store the forecast data for the next 4 days.
    const fourDayForecast = [];

    // Loop through the forecast data and add the data for every 8th item to the array.
    // This is because the forecast data is returned in 3-hour increments, so we need to
    // skip every 8 items to get the data for the next 4 days.
    for (let i = 0; i < forecastData.length; i += 8) {
      fourDayForecast.push(forecastData[i]);
    }

    // Call the displayForecastWeather function to display the forecast weather data.
    displayForecastWeather(fourDayForecast);
  } catch (error) {
    // Log any errors that occur and alert the user.
    console.error("Failed: ", error);
    alert("Forecast data could not be fetched. Please try again.");
  }
};

/**
 * Displays the forecast weather data for the next 4 days.
 * 
 * @param {Object[]} data - The forecast weather data for the next 4 days.
 */
const displayForecastWeather = (data) => {
  const temperature1 = Math.round(data[0].main.temp);
  const temperature2 = Math.round(data[1].main.temp);
  const temperature3 = Math.round(data[2].main.temp);
  const temperature4 = Math.round(data[3].main.temp);

  const weatherIcon1 = data[0].weather[0].main;
  const weatherIcon2 = data[1].weather[0].main;
  const weatherIcon3 = data[2].weather[0].main;
  const weatherIcon4 = data[3].weather[0].main;

  /**
   * Maps the weather icon codes to the correct SVG icon.
   * 
   * @type {Object}
   */
  const weatherIcon = {
    Clouds: "/assets/svg/weather-icon/cloud-icon.svg",
    Rain: "/assets/svg/weather-icon/rain-icon.svg",
    Snow: "/assets/svg/weather-icon/snow-icon.svg",
    Clear: "/assets/svg/weather-icon/white-sun-icon.svg",
    Thunderstorm: "/assets/svg/weather-icon/thunderstorm-white-icon.svg",
    Drizzle: "/assets/svg/weather-icon/drizzle-icon.svg",
    Fog: "/assets/svg/weather-icon/white-fog-icon.svg",
    Mist: "/assets/svg/weather-icon/misty-white-icon.svg"
  };

  /**
   * Maps the weather icon codes to the correct black SVG icon.
   * 
   * @type {Object}
   */
  const weatherIconBlack = {
    Clouds: "/assets/svg/weather-icon/black-cloud-icon.svg",
    Rain: "/assets/svg/weather-icon/black-rain-icon.svg",
    Snow: "/assets/svg/weather-icon/black-snow-icon.svg",
    Clear: "/assets/svg/weather-icon/black-sun-icon.svg",
    Thunderstorm: "/assets/svg/weather-icon/black-thunderstorm-icon.svg",
    Drizzle: "/assets/svg/weather-icon/black-drizzle-icon.svg",
    Fog: "/assets/svg/weather-icon/black-fog-icon.svg",
    Mist: "/assets/svg/weather-icon/misty-black-icon.svg"
  }

  document.querySelector(".day-weather-icon1").src = weatherIcon[weatherIcon1];
  document.querySelector(".day-weather-icon2").src = weatherIcon[weatherIcon2];
  document.querySelector(".day-weather-icon3").src = weatherIcon[weatherIcon3];
  document.querySelector(".day-weather-icon4").src = weatherIcon[weatherIcon4];

  document.querySelector(".js-temp1").textContent = `${temperature1} °C`;
  document.querySelector(".js-temp2").textContent = `${temperature2} °C`;
  document.querySelector(".js-temp3").textContent = `${temperature3} °C`;
  document.querySelector(".js-temp4").textContent = `${temperature4} °C`;

  /**
   * Selects all the day elements and adds event listeners to each one.
   * 
   * @type {NodeList}
   */
  const daysElements = document.querySelectorAll(".days");

  /**
   * Adds event listeners to each day element.
   * 
   * @param {HTMLElement} dayElement - The current day element.
   * @param {number} index - The index of the current day element.
   */
  daysElements.forEach((dayElement, index) => {
    const iconElement = dayElement.querySelector("img");
    const weatherIcon = iconElement.src;
    const blackIconSrc1 = weatherIconBlack[weatherIcon1];
    const blackIconSrc2 = weatherIconBlack[weatherIcon2];
    const blackIconSrc3 = weatherIconBlack[weatherIcon3];
    const blackIconSrc4 = weatherIconBlack[weatherIcon4];

    /**
     * Adds an event listener to each day element to change the icon when the user
     * hovers over it.
     * 
     * @param {MouseEvent} event - The mouseover event.
     */
    dayElement.addEventListener("mouseover", (event) => {
      iconElement.src = blackIconSrc1;
      if (index === 1) {
        iconElement.src = blackIconSrc2;
      } else if (index === 2) {
        iconElement.src = blackIconSrc3;
      } else if (index === 3) {
        iconElement.src = blackIconSrc4;
      }
    });

    /**
     * Adds an event listener to each day element to change the icon when the user
     * stops hovering over it.
     * 
     * @param {MouseEvent} event - The mouseout event.
     */
    dayElement.addEventListener("mouseout", (event) => {
      iconElement.src = weatherIcon;
    });
  });
}

/**
 * Displays the current weather data on the webpage.
 * 
 * @param {Object} data - The current weather data from the API.
 */
const displayCurrentWeather = (data) => {
  // Extract necessary weather data
  const temperature = Math.round(data.main.temp);
  const city = `${data.name}, ${data.sys.country}`;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const weather = data.weather[0].main;
  const weatherDescription = data.weather[0].description.toUpperCase();

  // Select necessary DOM elements
  const weatherInfoElement = document.querySelector(".location");
  const weatherInfoIconElement = document.querySelector(".weather-icon");
  const weatherRowElement = document.querySelector(".row-2");
  const daysElementImgs = document.querySelectorAll(".days img");

  // Check for null elements and handle error
  if (!weatherInfoElement || !weatherInfoIconElement || !weatherRowElement || !daysElementImgs) {
    console.error("Error: Null pointer exception");
    return;
  }

  // Add animations to elements
  daysElementImgs.forEach((img, index) => {
    img.classList.add("animate-right");
    img.style.animationDelay = `${index * 0.099}s`;
  });
  weatherRowElement.classList.add("animate-right");
  weatherInfoElement.classList.add("animateUpFirst");
  weatherInfoIconElement.classList.add("animateUpSecond");

  // Remove animations after 500ms
  setTimeout(() => {
    try {
      weatherInfoIconElement.classList.remove("animateUpSecond");
      weatherInfoElement.classList.remove("animateUpFirst");
      daysElementImgs.forEach(img => {
        img.classList.remove("animate-right");
      });
      weatherRowElement.classList.remove("animate-right");
    } catch (error) {
      console.error(error.message);
    }
  }, 500);

  // Map weather conditions to icons and background images
  const weatherIconMap = {
    Sun: "/assets/svg/weather-icon/white-sun-icon.svg",
    Clouds: "/assets/svg/weather-icon/cloud-icon.svg",
    Rain: "/assets/svg/weather-icon/rain-icon.svg",
    Snow: "/assets/svg/weather-icon/snow-icon.svg",
    Clear: "/assets/svg/weather-icon/white-sun-icon.svg",
    Thunderstorm: "/assets/svg/weather-icon/thunderstorm-white-icon.svg",
    Drizzle: "/assets/svg/weather-icon/drizzle-icon.svg",
    Fog: "/assets/svg/weather-icon/white-fog-icon.svg",
    Mist: "/assets/svg/weather-icon/misty-white-icon.svg"
  };

  const weatherBackImage = {
    Sun: "/assets/images/weather-image/sunny-beach-image.webp",
    Clouds: "/assets/images/weather-image/cloud-image.webp",
    Rain: "/assets/images/weather-image/rain-image.webp",
    Snow: "/assets/images/weather-image/snow-image.webp",
    Clear: "/assets/images/weather-image/clear-image.webp",
    Thunderstorm: "/assets/images/weather-image/thunderstorm-image.webp",
    Drizzle: "/assets/images/weather-image/rain-image.webp",
    Fog: "/assets/images/weather-image/fog-image.webp",
    Mist: "/assets/images/weather-image/mist-image.webp"
  };

  // Update DOM elements with current weather data
  document.querySelector(".weather-info").style.backgroundImage = `url(${weatherBackImage[weather]})`;
  document.querySelector(".js-weather-icon").src = weatherIconMap[weather];
  document.querySelector(".city").textContent = city;
  document.querySelector(".js-main-temp").textContent = `${temperature} °C`;
  document.querySelector(".humidity").textContent = `${humidity} %`;
  document.querySelector(".wind").textContent = `${windSpeed} km/h`;
  document.querySelector(".precipitation").textContent = weatherDescription;
  document.querySelector(".sky").textContent = weather;
};

/**
 * Selects the dropdown icon and close button elements from the DOM.
 */
const dropdownIcon = document.getElementById("dropdown-icon");
const dropdownCloseButton = document.querySelector(".open-dropdown_close_btn");

/**
 * Checks if the dropdown icon or close button elements are null.
 * Logs an error message to the console if any of the elements are not found.
 */
if (dropdownIcon === null || dropdownCloseButton === null) {
  console.error("Error: Could not find the dropdown icon or the close button.");
}

/**
 * Toggles the visibility of the dropdown menu.
 * 
 * This function targets the dropdown menu element and toggles its visibility
 * by adding or removing the "show" class. If the dropdown menu is not found,
 * an error is logged to the console.
 */
const toggleDropdown = () => {
  // Select the dropdown menu element
  const dropdownMenu = document.querySelector(".open-dropdown");

  // Check if the dropdown menu element exists
  if (dropdownMenu === null) {
    console.error("Error: Could not find the dropdown menu.");
    return;
  }

  // Toggle the "show" class on the dropdown menu
  dropdownMenu.classList.toggle("show");

  // Set the visibility style based on the presence of the "show" class
  dropdownMenu.style.visibility = dropdownMenu.classList.contains("show") ? "visible" : "hidden";
};

// Check if the dropdown icon is present and add a click event listener to toggle the dropdown
if (dropdownIcon !== null) {
  dropdownIcon.addEventListener("click", toggleDropdown);
}

// Try to add a click event listener to the dropdown close button to toggle the dropdown
try {
  if (dropdownCloseButton === null) {
    // Throw an error if the close button is not found
    throw new Error("Error: Could not find the close button.");
  }
  dropdownCloseButton.addEventListener("click", toggleDropdown);
} catch (error) {
  // Log the error message to the console
  console.error(error.message);
}

// Select all anchor links in the navbar
const navbarLinks = document.querySelectorAll('.navbar a');

// Select all anchor links in the open dropdown menu
const dropdownLinks = document.querySelectorAll('.open-dropdown a');

// Select all anchor links in the footer column with class 'footer-col-md'
const footerLinks = document.querySelectorAll('.footer-col-md a');

/**
 * Adds smooth scrolling behavior to a collection of links.
 *
 * This function iterates over each link in the provided collection
 * and attaches a click event listener. When a link is clicked, the
 * default click action is prevented, and the page smoothly scrolls
 * to the target section specified by the link's href attribute.
 *
 * @param {NodeList} links - A collection of anchor elements to which smooth scrolling will be added.
 */
const addSmoothScroll = (links) => {
  if (links === null) {
    console.error("Error: Could not find the links.");
    return;
  }

  links.forEach(link => {
    if (link === null) {
      console.error("Error: Could not find a link.");
      return;
    }

    // Attach a click event listener to each link
    link.addEventListener('click', event => {
      // Prevent the default anchor click behavior
      event.preventDefault();

      // Get the target element's offset from the top of the page
      const href = link.getAttribute('href');
      if (href === null) {
        console.error("Error: Could not find the href attribute.");
        return;
      }

      const targetElement = document.querySelector(href);
      if (targetElement === null) {
        console.error(`Error: Could not find the element with the selector '${href}'.`);
        return;
      }

      // Scroll to the target element with smooth behavior
      try {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });
      } catch (error) {
        console.error(`Error: Could not scroll to the element with the selector '${href}'.`);
      }
    });
  });
};
/**
 * This function takes a collection of links as an argument and adds smooth
 * scrolling behavior to them. When a link is clicked, the page will smoothly
 * scroll to the target section specified by the link's href attribute.
 */
addSmoothScroll(navbarLinks);
addSmoothScroll(dropdownLinks);
addSmoothScroll(footerLinks);