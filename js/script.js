/* =========================================================
   BOOKING AIR
   Main JavaScript
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     ELEMENTS
     ======================================================= */

  const serviceTabs = document.querySelectorAll(".service-tab");

  const flightForm = document.getElementById("flightForm");
  const hotelForm = document.getElementById("hotelForm");
  const carForm = document.getElementById("carForm");

  const tripTabs = document.querySelectorAll(".trip-tab");

  const returnField = document.getElementById("returnField");
  const returnInput = document.getElementById("return-0");

  const fromInput = document.getElementById("from-0");
  const toInput = document.getElementById("to-0");

  const swapBtn = document.getElementById("swapBtn");

  const departInput = document.getElementById("depart-0");

  const paxTrigger = document.getElementById("paxTrigger");
  const paxPanel = document.getElementById("paxPanel");
  const paxDone = document.getElementById("paxDone");
  const paxLabel = document.getElementById("paxLabel");

  const cabinButtons = document.querySelectorAll(".cabin");
  const stepperRows = document.querySelectorAll(".stepper-row");

  const formError = document.getElementById("formError");

  const resultsSection = document.getElementById("resultsSection");

  const clearRecent = document.getElementById("clearRecent");
  const recentList = document.getElementById("recentList");

  const routeCards = document.querySelectorAll(".route-card");

  const toastWrap = document.getElementById("toastWrap");


  /* =======================================================
     STATE
     ======================================================= */

  let currentService = "flights";
  let currentTrip = "round";
  let currentCabin = "Economy";

  let passengers = {
    adults: 1,
    children: 0,
    infants: 0
  };


  /* =======================================================
     AIRPORT DATA
     ======================================================= */

  const airportCodes = {
    "New York": "JFK",
    "London": "LHR",
    "Los Angeles": "LAX",
    "Paris": "CDG",
    "San Francisco": "SFO",
    "Tokyo": "HND",
    "Madrid": "MAD",
    "Dubai": "DXB",
    "Chicago": "ORD",
    "Toronto": "YYZ",
    "Singapore": "SIN",
    "Sydney": "SYD",
    "Frankfurt": "FRA",
    "Amsterdam": "AMS",
    "Rome": "FCO",
    "Miami": "MIA",
    "Boston": "BOS",
    "Dallas": "DFW",
    "Seattle": "SEA",
    "Istanbul": "IST"
  };


  /* =======================================================
     DEFAULT DATES
     ======================================================= */

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  function setDefaultDates() {

    const today = new Date();

    const depart = new Date(today);
    depart.setDate(today.getDate() + 14);

    const returnDate = new Date(today);
    returnDate.setDate(today.getDate() + 21);

    if (departInput && !departInput.value) {
      departInput.value = formatDateForInput(depart);
    }

    if (returnInput && !returnInput.value) {
      returnInput.value = formatDateForInput(returnDate);
    }

    const hotelCheckin = document.getElementById("hotel-checkin");
    const hotelCheckout = document.getElementById("hotel-checkout");

    if (hotelCheckin && !hotelCheckin.value) {
      hotelCheckin.value = formatDateForInput(depart);
    }

    if (hotelCheckout && !hotelCheckout.value) {
      hotelCheckout.value = formatDateForInput(returnDate);
    }

    const carPickdate = document.getElementById("car-pickdate");
    const carDropdate = document.getElementById("car-dropdate");

    if (carPickdate && !carPickdate.value) {
      carPickdate.value = formatDateForInput(depart);
    }

    if (carDropdate && !carDropdate.value) {
      carDropdate.value = formatDateForInput(returnDate);
    }
  }


  setDefaultDates();


  /* =======================================================
     AIRPORT CODE UPDATES
     ======================================================= */

  function getAirportCode(city) {

    const cleanCity = city.trim();

    if (airportCodes[cleanCity]) {
      return airportCodes[cleanCity];
    }

    const match = Object.keys(airportCodes).find(
      key => key.toLowerCase() === cleanCity.toLowerCase()
    );

    if (match) {
      return airportCodes[match];
    }

    return cleanCity
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 3)
      .toUpperCase();
  }


  function updateAirportCode(input) {

    if (!input) return;

    const airportInput = input.closest(".airport-input");

    if (!airportInput) return;

    const codeElement = airportInput.querySelector(".ap-code");

    if (!codeElement) return;

    codeElement.textContent = getAirportCode(input.value);
  }


  if (fromInput) {
    fromInput.addEventListener("input", () => {
      updateAirportCode(fromInput);
    });

    fromInput.addEventListener("blur", () => {
      updateAirportCode(fromInput);
    });
  }


  if (toInput) {
    toInput.addEventListener("input", () => {
      updateAirportCode(toInput);
    });

    toInput.addEventListener("blur", () => {
      updateAirportCode(toInput);
    });
  }


  /* =======================================================
     SERVICE TABS
     ======================================================= */

  serviceTabs.forEach(tab => {

    tab.addEventListener("click", () => {

      const service = tab.dataset.service;

      currentService = service;

      serviceTabs.forEach(item => {

        const active = item === tab;

        item.classList.toggle("active", active);
        item.setAttribute(
          "aria-selected",
          active ? "true" : "false"
        );

      });


      if (flightForm) {
        flightForm.hidden = service !== "flights";
      }

      if (hotelForm) {
        hotelForm.hidden = service !== "hotels";
      }

      if (carForm) {
        carForm.hidden = service !== "cars";
      }


      clearError();

      if (resultsSection) {
        resultsSection.hidden = true;
        resultsSection.innerHTML = "";
      }

    });

  });


  /* =======================================================
     TRIP TYPE
     ======================================================= */

  tripTabs.forEach(tab => {

    tab.addEventListener("click", () => {

      currentTrip = tab.dataset.trip;

      tripTabs.forEach(item => {

        const active = item === tab;

        item.classList.toggle("active", active);

        item.setAttribute(
          "aria-selected",
          active ? "true" : "false"
        );

      });


      if (returnField) {
        returnField.hidden = currentTrip === "oneway";
      }

      if (returnInput) {
        returnInput.required = currentTrip === "round";
      }

    });

  });


  /* =======================================================
     SWAP AIRPORTS
     ======================================================= */

  if (swapBtn) {

    swapBtn.addEventListener("click", () => {

      if (!fromInput || !toInput) return;

      const oldFrom = fromInput.value;
      const oldTo = toInput.value;

      fromInput.value = oldTo;
      toInput.value = oldFrom;

      updateAirportCode(fromInput);
      updateAirportCode(toInput);

      showToast("Origin and destination swapped.");

    });

  }


  /* =======================================================
     PASSENGER PANEL
     ======================================================= */

  function updatePassengerLabel() {

    const total =
      passengers.adults +
      passengers.children +
      passengers.infants;

    const passengerText =
      total === 1 ? "passenger" : "passengers";

    if (paxLabel) {

      paxLabel.textContent =
        `${total} ${passengerText} · ${currentCabin}`;

    }

  }


  if (paxTrigger && paxPanel) {

    paxTrigger.addEventListener("click", () => {

      const isOpen = !paxPanel.hidden;

      paxPanel.hidden = isOpen;

      paxTrigger.setAttribute(
        "aria-expanded",
        isOpen ? "false" : "true"
      );

    });

  }


  if (paxDone && paxPanel) {

    paxDone.addEventListener("click", () => {

      paxPanel.hidden = true;

      if (paxTrigger) {
        paxTrigger.setAttribute(
          "aria-expanded",
          "false"
        );
      }

      updatePassengerLabel();

    });

  }


  /* =======================================================
     STEPPERS
     ======================================================= */

  stepperRows.forEach(row => {

    const type = row.dataset.type;

    const minus = row.querySelector(".minus");
    const plus = row.querySelector(".plus");
    const output = row.querySelector(".step-val");

    if (!minus || !plus || !output) return;


    minus.addEventListener("click", () => {

      const minimum = type === "adults" ? 1 : 0;

      passengers[type] = Math.max(
        minimum,
        passengers[type] - 1
      );

      output.textContent = passengers[type];

      updatePassengerLabel();

    });


    plus.addEventListener("click", () => {

      const maximum =
        type === "adults" ? 9 :
        type === "children" ? 8 :
        4;

      if (passengers[type] >= maximum) {
        showToast(`Maximum ${type} limit reached.`);
        return;
      }

      passengers[type]++;

      output.textContent = passengers[type];

      updatePassengerLabel();

    });

  });


  /* =======================================================
     CABIN
     ======================================================= */

  cabinButtons.forEach(button => {

    button.addEventListener("click", () => {

      currentCabin = button.dataset.cabin;

      cabinButtons.forEach(item => {

        const active = item === button;

        item.classList.toggle("active", active);

        item.setAttribute(
          "aria-checked",
          active ? "true" : "false"
        );

      });

      updatePassengerLabel();

    });

  });


  /* =======================================================
     ERROR HANDLING
     ======================================================= */

  function showError(message) {

    if (!formError) return;

    formError.textContent = message;
    formError.hidden = false;

  }


  function clearError() {

    if (!formError) return;

    formError.textContent = "";
    formError.hidden = true;

  }


  /* =======================================================
     DATE VALIDATION
     ======================================================= */

  function validateDates(depart, returnDate) {

    if (!depart) {
      return "Please select a departure date.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const departure = new Date(`${depart}T00:00:00`);

    if (departure < today) {
      return "Departure date cannot be in the past.";
    }

    if (currentTrip === "round") {

      if (!returnDate) {
        return "Please select a return date.";
      }

      const returning = new Date(`${returnDate}T00:00:00`);

      if (returning < departure) {
        return "Return date must be after departure date.";
      }

    }

    return null;

  }


  /* =======================================================
     FLIGHT FORM
     ======================================================= */

  if (flightForm) {

    flightForm.addEventListener("submit", event => {

      event.preventDefault();

      clearError();

      const from = fromInput?.value.trim();
      const to = toInput?.value.trim();

      const depart = departInput?.value;
      const returnDate = returnInput?.value;


      if (!from || !to) {
        showError("Please enter both departure and destination.");
        return;
      }


      if (from.toLowerCase() === to.toLowerCase()) {
        showError("Departure and destination cannot be the same.");
        return;
      }


      const dateError = validateDates(
        depart,
        returnDate
      );

      if (dateError) {
        showError(dateError);
        return;
      }


      const fromCode = getAirportCode(from);
      const toCode = getAirportCode(to);


      showToast("Searching available flights...");


      setTimeout(() => {

        displayFlightResults({
          from,
          to,
          fromCode,
          toCode,
          depart,
          returnDate
        });

        saveRecentSearch({
          from,
          to,
          fromCode,
          toCode,
          depart,
          returnDate
        });

      }, 500);

    });

  }


  /* =======================================================
     HOTEL FORM
     ======================================================= */

  if (hotelForm) {

    hotelForm.addEventListener("submit", event => {

      event.preventDefault();

      clearError();

      const destination =
        document.getElementById("hotel-destination")?.value.trim();

      const checkin =
        document.getElementById("hotel-checkin")?.value;

      const checkout =
        document.getElementById("hotel-checkout")?.value;

      const guests =
        document.getElementById("hotel-guests")?.value;


      if (!destination) {
        showError("Please enter a hotel destination.");
        return;
      }


      if (!checkin || !checkout) {
        showError("Please select check-in and check-out dates.");
        return;
      }


      if (new Date(checkout) < new Date(checkin)) {
        showError("Check-out date must be after check-in date.");
        return;
      }


      showToast("Searching hotels...");


      setTimeout(() => {

        displayHotelResults({
          destination,
          checkin,
          checkout,
          guests
        });

      }, 500);

    });

  }


  /* =======================================================
     CAR FORM
     ======================================================= */

  if (carForm) {

    carForm.addEventListener("submit", event => {

      event.preventDefault();

      clearError();

      const pickup =
        document.getElementById("car-pickup")?.value.trim();

      const dropoff =
        document.getElementById("car-dropoff")?.value.trim();

      const pickdate =
        document.getElementById("car-pickdate")?.value;

      const dropdate =
        document.getElementById("car-dropdate")?.value;


      if (!pickup || !dropoff) {
        showError("Please enter pick-up and drop-off locations.");
        return;
      }


      if (!pickdate || !dropdate) {
        showError("Please select your rental dates.");
        return;
      }


      if (new Date(dropdate) < new Date(pickdate)) {
        showError("Drop-off date must be after pick-up date.");
        return;
      }


      showToast("Searching rental cars...");


      setTimeout(() => {

        displayCarResults({
          pickup,
          dropoff,
          pickdate,
          dropdate
        });

      }, 500);

    });

  }


  /* =======================================================
     FLIGHT RESULTS
     ======================================================= */

  function displayFlightResults(data) {

    if (!resultsSection) return;

    const departureDate =
      formatDisplayDate(data.depart);

    const returnDisplay =
      data.returnDate
        ? formatDisplayDate(data.returnDate)
        : null;


    const flights = [
      {
        airline: "Booking Air",
        number: "BA 204",
        departTime: "08:15",
        arriveTime: "20:35",
        duration: "7h 20m",
        stops: "Nonstop",
        price: "$489"
      },
      {
        airline: "Booking Air",
        number: "BA 318",
        departTime: "12:40",
        arriveTime: "00:55",
        duration: "7h 15m",
        stops: "Nonstop",
        price: "$526"
      },
      {
        airline: "Booking Air",
        number: "BA 441",
        departTime: "18:25",
        arriveTime: "06:50",
        duration: "7h 25m",
        stops: "Nonstop",
        price: "$612"
      }
    ];


    resultsSection.innerHTML = `

      <div class="results-header">

        <div>
          <h2>
            Flight results
          </h2>

          <p class="result-sub">
            ${escapeHTML(data.from)}
            (${escapeHTML(data.fromCode)})
            →
            ${escapeHTML(data.to)}
            (${escapeHTML(data.toCode)})
          </p>

          <p class="result-sub">
            ${departureDate}
            ${returnDisplay ? ` · Return ${returnDisplay}` : ""}
            · ${currentCabin}
          </p>
        </div>

        <strong>
          ${passengers.adults +
            passengers.children +
            passengers.infants}
          passenger${(
            passengers.adults +
            passengers.children +
            passengers.infants
          ) !== 1 ? "s" : ""}
        </strong>

      </div>


      <ul class="results-list">

        ${flights.map(flight => `

          <li class="result-card">

            <div class="result-main">

              <div class="result-time">
                ${flight.departTime}
                →
                ${flight.arriveTime}
              </div>

              <div class="result-meta">
                ${escapeHTML(data.fromCode)}
                →
                ${escapeHTML(data.toCode)}
                · ${flight.duration}
                · ${flight.stops}
              </div>

              <div class="result-sub">
                ${flight.airline}
                · ${flight.number}
              </div>

            </div>


            <div>

              <div class="result-price">
                ${flight.price}
                <small> / person</small>
              </div>

              <button
                type="button"
                class="search-btn choose-flight"
                data-price="${flight.price}"
              >
                Select
              </button>

            </div>

          </li>

        `).join("")}

      </ul>
    `;


    resultsSection.hidden = false;

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


    document
      .querySelectorAll(".choose-flight")
      .forEach(button => {

        button.addEventListener("click", () => {

          showToast(
            `Flight selected — ${button.dataset.price}`
          );

        });

      });

  }


  /* =======================================================
     HOTEL RESULTS
     ======================================================= */

  function displayHotelResults(data) {

    if (!resultsSection) return;


    const hotels = [
      {
        name: "Booking Air Grand Hotel",
        location: data.destination,
        rating: "4.8",
        price: "$189"
      },
      {
        name: "City Center Hotel",
        location: data.destination,
        rating: "4.6",
        price: "$214"
      },
      {
        name: "Airport View Hotel",
        location: data.destination,
        rating: "4.5",
        price: "$156"
      }
    ];


    resultsSection.innerHTML = `

      <div class="results-header">

        <div>

          <h2>
            Hotel results
          </h2>

          <p class="result-sub">
            ${escapeHTML(data.destination)}
            · ${escapeHTML(data.guests)}
          </p>

        </div>

      </div>


      <ul class="results-list">

        ${hotels.map(hotel => `

          <li class="result-card">

            <div class="result-main">

              <div class="result-time">
                ${escapeHTML(hotel.name)}
              </div>

              <div class="result-meta">
                ${escapeHTML(hotel.location)}
              </div>

              <div class="result-sub">
                ★ ${hotel.rating} rating
              </div>

            </div>


            <div>

              <div class="result-price">
                ${hotel.price}
                <small> / night</small>
              </div>

              <button
                type="button"
                class="search-btn choose-hotel"
              >
                Select
              </button>

            </div>

          </li>

        `).join("")}

      </ul>
    `;


    resultsSection.hidden = false;

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


    document
      .querySelectorAll(".choose-hotel")
      .forEach(button => {

        button.addEventListener("click", () => {
          showToast("Hotel selected.");
        });

      });

  }


  /* =======================================================
     CAR RESULTS
     ======================================================= */

  function displayCarResults(data) {

    if (!resultsSection) return;


    const cars = [
      {
        name: "Economy Sedan",
        seats: 5,
        bags: 2,
        price: "$42"
      },
      {
        name: "Compact SUV",
        seats: 5,
        bags: 3,
        price: "$58"
      },
      {
        name: "Premium SUV",
        seats: 7,
        bags: 4,
        price: "$89"
      }
    ];


    resultsSection.innerHTML = `

      <div class="results-header">

        <div>

          <h2>
            Rental car results
          </h2>

          <p class="result-sub">
            ${escapeHTML(data.pickup)}
            →
            ${escapeHTML(data.dropoff)}
          </p>

        </div>

      </div>


      <ul class="results-list">

        ${cars.map(car => `

          <li class="result-card">

            <div class="result-main">

              <div class="result-time">
                🚗 ${escapeHTML(car.name)}
              </div>

              <div class="result-meta">
                ${car.seats} seats
                · ${car.bags} bags
              </div>

              <div class="result-sub">
                Automatic · Unlimited mileage
              </div>

            </div>


            <div>

              <div class="result-price">
                ${car.price}
                <small> / day</small>
              </div>

              <button
                type="button"
                class="search-btn choose-car"
              >
                Select
              </button>

            </div>

          </li>

        `).join("")}

      </ul>
    `;


    resultsSection.hidden = false;

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


    document
      .querySelectorAll(".choose-car")
      .forEach(button => {

        button.addEventListener("click", () => {
          showToast("Rental car selected.");
        });

      });

  }


  /* =======================================================
     RECENT SEARCHES
     ======================================================= */

  function saveRecentSearch(data) {

    if (!recentList) return;


    const item = document.createElement("li");

    item.className = "recent-item";

    item.dataset.from = data.fromCode;
    item.dataset.to = data.toCode;


    item.innerHTML = `

      <span class="ri-route">

        <b>${escapeHTML(data.fromCode)}</b>

        <span>→</span>

        <b>${escapeHTML(data.toCode)}</b>

      </span>


      <span class="ri-meta">

        ${escapeHTML(data.from)}
        ·
        ${escapeHTML(data.to)}

      </span>


      <span class="ri-date">

        ${formatDisplayDate(data.depart)}
        ${
          data.returnDate
            ? ` – ${formatDisplayDate(data.returnDate)}`
            : ""
        }

      </span>

    `;


    recentList.prepend(item);


    while (recentList.children.length > 5) {
      recentList.lastElementChild.remove();
    }

  }


  if (clearRecent) {

    clearRecent.addEventListener("click", () => {

      if (!recentList) return;

      recentList.innerHTML = "";

      showToast("Recent searches cleared.");

    });

  }


  /* =======================================================
     RECENT SEARCH CLICK
     ======================================================= */

  if (recentList) {

    recentList.addEventListener("click", event => {

      const item =
        event.target.closest(".recent-item");

      if (!item) return;

      const fromCode = item.dataset.from;
      const toCode = item.dataset.to;


      if (fromCode && toCode) {

        fromInput.value = fromCode;
        toInput.value = toCode;

        updateAirportCode(fromInput);
        updateAirportCode(toInput);

        showToast(
          `${fromCode} → ${toCode} loaded.`
        );

      }

    });

  }


  /* =======================================================
     POPULAR ROUTES
     ======================================================= */

  routeCards.forEach(card => {

    card.addEventListener("click", () => {

      const from = card.dataset.fc;
      const to = card.dataset.tc;


      if (fromInput) {
        fromInput.value = from;
      }

      if (toInput) {
        toInput.value = to;
      }


      updateAirportCode(fromInput);
      updateAirportCode(toInput);


      currentService = "flights";


      serviceTabs.forEach(tab => {

        const active =
          tab.dataset.service === "flights";

        tab.classList.toggle("active", active);

        tab.setAttribute(
          "aria-selected",
          active ? "true" : "false"
        );

      });


      if (flightForm) {
        flightForm.hidden = false;
      }

      if (hotelForm) {
        hotelForm.hidden = true;
      }

      if (carForm) {
        carForm.hidden = true;
      }


      clearError();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });


      showToast(
        `${from} → ${to} selected.`
      );

    });

  });


  /* =======================================================
     TOAST
     ======================================================= */

  function showToast(message) {

    if (!toastWrap) return;


    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;


    toastWrap.appendChild(toast);


    setTimeout(() => {

      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";

      setTimeout(() => {
        toast.remove();
      }, 200);

    }, 2500);

  }


  /* =======================================================
     DATE DISPLAY
     ======================================================= */

  function formatDisplayDate(dateString) {

    if (!dateString) return "";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );

  }


  /* =======================================================
     HTML ESCAPE
     ======================================================= */

  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* =======================================================
     INITIAL SETUP
     ======================================================= */

  updateAirportCode(fromInput);
  updateAirportCode(toInput);

  if (returnField) {
    returnField.hidden = false;
  }

  updatePassengerLabel();

});