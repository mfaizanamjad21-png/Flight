/* =========================================================
   BOOKING AIR - JavaScript (SwaggerHub Flight API Integration)
   File Location: js/script.js
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     DOM ELEMENTS
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
  const toastWrap = document.getElementById("toastWrap");


  /* =======================================================
     STATE
     ======================================================= */

  let currentService = "flights";
  let currentTrip = "round";
  let currentCabin = "Economy";
  let fetchedFlights = [];

  let passengers = {
    adults: 1,
    children: 0,
    infants: 0
  };


  /* =======================================================
     AIRPORT CODES & HELPERS
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
    "Toronto": "YYZ"
  };

  function getAirportCode(city) {
    const cleanCity = (city || "").trim();
    if (!cleanCity) return "---";
    if (airportCodes[cleanCity]) return airportCodes[cleanCity];

    const match = Object.keys(airportCodes).find(
      key => key.toLowerCase() === cleanCity.toLowerCase()
    );
    if (match) return airportCodes[match];

    return cleanCity
      .replace(/[^a-zA-Z]/g, "")
      .substring(0, 3)
      .toUpperCase() || "---";
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
    fromInput.addEventListener("input", () => updateAirportCode(fromInput));
    fromInput.addEventListener("blur", () => updateAirportCode(fromInput));
  }

  if (toInput) {
    toInput.addEventListener("input", () => updateAirportCode(toInput));
    toInput.addEventListener("blur", () => updateAirportCode(toInput));
  }


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

    if (departInput && !departInput.value) departInput.value = formatDateForInput(depart);
    if (returnInput && !returnInput.value) returnInput.value = formatDateForInput(returnDate);
  }

  setDefaultDates();


  /* =======================================================
     SERVICE & TRIP CONTROLS
     ======================================================= */

  serviceTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const service = tab.dataset.service;
      currentService = service;

      serviceTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });

      if (flightForm) flightForm.hidden = service !== "flights";
      if (hotelForm) hotelForm.hidden = service !== "hotels";
      if (carForm) carForm.hidden = service !== "cars";

      clearError();
      if (resultsSection) {
        resultsSection.hidden = true;
        resultsSection.innerHTML = "";
      }
    });
  });

  tripTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      currentTrip = tab.dataset.trip;

      tripTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });

      if (returnField) returnField.hidden = currentTrip === "oneway";
      if (returnInput) returnInput.required = currentTrip === "round";
    });
  });

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
     PASSENGERS & CABIN
     ======================================================= */

  function updatePassengerLabel() {
    const total = passengers.adults + passengers.children + passengers.infants;
    const passengerText = total === 1 ? "passenger" : "passengers";
    if (paxLabel) paxLabel.textContent = `${total} ${passengerText} · ${currentCabin}`;
  }

  if (paxTrigger && paxPanel) {
    paxTrigger.addEventListener("click", () => {
      const isOpen = !paxPanel.hidden;
      paxPanel.hidden = isOpen;
      paxTrigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });
  }

  if (paxDone && paxPanel) {
    paxDone.addEventListener("click", () => {
      paxPanel.hidden = true;
      if (paxTrigger) paxTrigger.setAttribute("aria-expanded", "false");
      updatePassengerLabel();
    });
  }

  stepperRows.forEach(row => {
    const type = row.dataset.type;
    const minus = row.querySelector(".minus");
    const plus = row.querySelector(".plus");
    const output = row.querySelector(".step-val");

    if (!minus || !plus || !output) return;

    minus.addEventListener("click", () => {
      const minimum = type === "adults" ? 1 : 0;
      passengers[type] = Math.max(minimum, passengers[type] - 1);
      output.textContent = passengers[type];
      updatePassengerLabel();
    });

    plus.addEventListener("click", () => {
      const maximum = type === "adults" ? 9 : type === "children" ? 8 : 4;
      if (passengers[type] >= maximum) {
        showToast(`Maximum ${type} limit reached.`);
        return;
      }
      passengers[type]++;
      output.textContent = passengers[type];
      updatePassengerLabel();
    });
  });

  cabinButtons.forEach(button => {
    button.addEventListener("click", () => {
      currentCabin = button.dataset.cabin;
      cabinButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-checked", active ? "true" : "false");
      });
      updatePassengerLabel();
    });
  });


  /* =======================================================
     VALIDATION & ERRORS
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

  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function validateDates(depart, returnDate) {
    if (!depart) return "Please select a departure date.";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const departure = parseLocalDate(depart);
    if (departure < today) return "Departure date cannot be in the past.";

    if (currentTrip === "round") {
      if (!returnDate) return "Please select a return date.";
      const returning = parseLocalDate(returnDate);
      if (returning < departure) return "Return date must be after departure date.";
    }
    return null;
  }


  /* =======================================================
     SWAGGERHUB MOCK API CALL (/flights)
     ======================================================= */

  async function fetchLiveFlights(originCode, destinationCode) {
    // Queries the native /flights endpoint on SwaggerHub
    const endpoint = `https://virtserver.swaggerhub.com/faizan-a1c/Filght/1.0.0/flights?origin=${encodeURIComponent(originCode)}&destination=${encodeURIComponent(destinationCode)}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.status === 429) {
      throw new Error("SwaggerHub rate limit reached (10 requests/min). Please wait 1 minute before trying again.");
    }

    if (!response.ok) {
      throw new Error(`SwaggerHub API Error: Status ${response.status}`);
    }

    const rawData = await response.json();
    const results = Array.isArray(rawData) ? rawData : [rawData];

    // Uses native flight schema properties returned directly from SwaggerHub
    return results.map(item => ({
      id: item.id || "fl-default",
      airline: item.airline || "Booking Air",
      flightNumber: item.flightNumber || "BA-100",
      origin: originCode,
      destination: destinationCode,
      departTime: item.departTime || "08:30 AM",
      arriveTime: item.arriveTime || "08:45 PM",
      durationHours: item.durationHours || 7,
      duration: item.duration || "7h 15m",
      price: item.price || 450,
      stops: item.stops || "Nonstop"
    }));
  }


  /* =======================================================
     RENDER RESULTS & FILTERS
     ======================================================= */

  function applyFlightFilters(flights, sortBy = "price-asc", stopsFilter = "all") {
    return flights
      .filter(flight => {
        if (stopsFilter === "nonstop") return flight.stops.toLowerCase() === "nonstop";
        if (stopsFilter === "stops") return flight.stops.toLowerCase() !== "nonstop";
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "duration") return a.durationHours - b.durationHours;
        return 0;
      });
  }

  function renderFlightResultsUI(flights, metadata) {
    if (!resultsSection) return;

    const departureDate = formatDisplayDate(metadata.depart);
    const returnDisplay = metadata.returnDate ? formatDisplayDate(metadata.returnDate) : null;
    const totalPax = passengers.adults + passengers.children + passengers.infants;

    resultsSection.innerHTML = `
      <div class="results-header">
        <div>
          <h2>Available Flights</h2>
          <p class="result-sub">
            ${escapeHTML(metadata.from)} (${escapeHTML(metadata.fromCode)}) → 
            ${escapeHTML(metadata.to)} (${escapeHTML(metadata.toCode)})
          </p>
          <p class="result-sub">
            ${departureDate} ${returnDisplay ? ` · Return ${returnDisplay}` : ""} · ${escapeHTML(currentCabin)}
          </p>
        </div>
        <strong>${totalPax} passenger${totalPax !== 1 ? "s" : ""}</strong>
      </div>

      <div class="filter-bar" style="display: flex; gap: 1rem; margin: 1rem 0; padding: 1rem; background: #f4f4f5; border-radius: 8px;">
        <div>
          <label for="sortSelect"><b>Sort By:</b></label>
          <select id="sortSelect">
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="duration">Fastest Duration</option>
          </select>
        </div>

        <div>
          <label for="stopsSelect"><b>Stops:</b></label>
          <select id="stopsSelect">
            <option value="all">All Flights</option>
            <option value="nonstop">Nonstop Only</option>
            <option value="stops">1+ Stops</option>
          </select>
        </div>
      </div>

      <ul class="results-list" id="flightList">
        ${renderFlightCards(flights)}
      </ul>
    `;

    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

    const sortSelect = document.getElementById("sortSelect");
    const stopsSelect = document.getElementById("stopsSelect");

    const handleFilterChange = () => {
      const filtered = applyFlightFilters(fetchedFlights, sortSelect.value, stopsSelect.value);
      document.getElementById("flightList").innerHTML = renderFlightCards(filtered);
      attachSelectListeners();
    };

    if (sortSelect) sortSelect.addEventListener("change", handleFilterChange);
    if (stopsSelect) stopsSelect.addEventListener("change", handleFilterChange);
    attachSelectListeners();
  }

  function renderFlightCards(flights) {
    if (flights.length === 0) {
      return `<li class="result-card"><p>No flights match your filter criteria.</p></li>`;
    }

    return flights.map(flight => `
      <li class="result-card">
        <div class="result-main">
          <div class="result-time">${escapeHTML(flight.departTime)} → ${escapeHTML(flight.arriveTime)}</div>
          <div class="result-meta">${escapeHTML(flight.origin)} → ${escapeHTML(flight.destination)} · ${escapeHTML(flight.duration)} · ${escapeHTML(flight.stops)}</div>
          <div class="result-sub">${escapeHTML(flight.airline)} · ${escapeHTML(flight.flightNumber)}</div>
        </div>
        <div>
          <div class="result-price">$${flight.price}<small> / person</small></div>
          <button type="button" class="search-btn choose-flight" data-price="$${flight.price}">Select</button>
        </div>
      </li>
    `).join("");
  }

  function attachSelectListeners() {
    document.querySelectorAll(".choose-flight").forEach(button => {
      button.addEventListener("click", () => {
        showToast(`Flight selected — ${button.dataset.price}`);
      });
    });
  }


  /* =======================================================
     FORM SUBMIT EVENT
     ======================================================= */

  if (flightForm) {
    flightForm.addEventListener("submit", async (event) => {
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

      const dateError = validateDates(depart, returnDate);
      if (dateError) {
        showError(dateError);
        return;
      }

      const fromCode = getAirportCode(from);
      const toCode = getAirportCode(to);

      showToast(`Fetching flight data for ${fromCode} → ${toCode}...`);

      try {
        fetchedFlights = await fetchLiveFlights(fromCode, toCode);
        const initialFiltered = applyFlightFilters(fetchedFlights, "price-asc", "all");

        renderFlightResultsUI(initialFiltered, {
          from,
          to,
          fromCode,
          toCode,
          depart,
          returnDate
        });
      } catch (err) {
        console.error("SwaggerHub Fetch Error:", err);
        showError(err.message || "Failed to fetch flight data from SwaggerHub.");
      }
    });
  }


  /* =======================================================
     UTILITY FUNCTIONS
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
      setTimeout(() => toast.remove(), 200);
    }, 2500);
  }

  function formatDisplayDate(dateString) {
    if (!dateString) return "";
    const date = parseLocalDate(dateString);
    if (Number.isNaN(date.getTime())) return escapeHTML(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial UI Setup
  updateAirportCode(fromInput);
  updateAirportCode(toInput);
  if (returnField) returnField.hidden = false;
  updatePassengerLabel();

});