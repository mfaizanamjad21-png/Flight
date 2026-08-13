document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================
     ELEMENTS
  ========================= */

  const flightForm = document.getElementById("flightForm");
  const hotelForm = document.getElementById("hotelForm");
  const carForm = document.getElementById("carForm");

  const serviceTabs = document.querySelectorAll(".service-tab");
  const tripTabs = document.querySelectorAll(".trip-tab");

  const paxTrigger = document.getElementById("paxTrigger");
  const paxPanel = document.getElementById("paxPanel");
  const paxDone = document.getElementById("paxDone");
  const paxLabel = document.getElementById("paxLabel");

  const formError = document.getElementById("formError");

  const clearRecentBtn =
    document.getElementById("clearRecent");

  const recentList =
    document.getElementById("recentList");

  const routeGrid =
    document.getElementById("routeGrid");

  const swapBtn =
    document.getElementById("swapBtn");

  const resultsSection =
    document.getElementById("resultsSection");


  /* =========================
     STATE
  ========================= */

  const paxState = {
    adults: 1,
    children: 0,
    infants: 0,
    cabin: "Economy"
  };

  let tripType = "round";


  /* =========================
     DEMO DATA
  ========================= */

  const demoFlights = [
    {
      airline: "Skyloft Air",
      depart: "07:15 AM",
      arrive: "10:45 AM",
      duration: "3h 30m",
      price: 489
    },
    {
      airline: "Global Airways",
      depart: "09:30 AM",
      arrive: "01:05 PM",
      duration: "3h 35m",
      price: 535
    },
    {
      airline: "AeroFly",
      depart: "11:20 AM",
      arrive: "03:00 PM",
      duration: "3h 40m",
      price: 579
    },
    {
      airline: "Pacific Sky",
      depart: "02:10 PM",
      arrive: "05:45 PM",
      duration: "3h 35m",
      price: 612
    },
    {
      airline: "Star Express",
      depart: "05:40 PM",
      arrive: "09:15 PM",
      duration: "3h 35m",
      price: 655
    }
  ];


  const demoHotels = [
    {
      name: "Grand Hyatt",
      rating: "4.8 ★",
      price: 210,
      amenity: "Free WiFi · Pool · Breakfast"
    },
    {
      name: "City Center Inn",
      rating: "4.3 ★",
      price: 115,
      amenity: "Central Location · Free Parking"
    },
    {
      name: "Marriott Luxury Suites",
      rating: "4.9 ★",
      price: 320,
      amenity: "Spa · Executive Lounge"
    },
    {
      name: "Boutique Hotel",
      rating: "4.6 ★",
      price: 175,
      amenity: "Rooftop · Fitness Center"
    },
    {
      name: "The Continental",
      rating: "4.7 ★",
      price: 240,
      amenity: "City View · Dining · Gym"
    }
  ];


  const demoCars = [
    {
      model: "Toyota Corolla or similar",
      className: "Compact Sedan",
      price: 45,
      vendor: "Hertz",
      features: "5 Seats · Automatic · Unlimited Mileage"
    },
    {
      model: "Ford Explorer or similar",
      className: "Midsize SUV",
      price: 78,
      vendor: "Enterprise",
      features: "7 Seats · All-Wheel Drive"
    },
    {
      model: "Tesla Model 3",
      className: "Electric Premium",
      price: 95,
      vendor: "Avis",
      features: "5 Seats · Automatic · Electric"
    },
    {
      model: "Hyundai Elantra",
      className: "Economy",
      price: 38,
      vendor: "Budget",
      features: "5 Seats · High MPG"
    },
    {
      model: "Jeep Wrangler",
      className: "4x4 SUV",
      price: 85,
      vendor: "Sixt",
      features: "4WD · Unlimited Mileage"
    }
  ];


  /* =========================
     INITIALIZATION
  ========================= */

  setInitialDates();
  loadRecentSearches();
  updatePaxLabel();


  /* =========================
     SERVICE TABS
  ========================= */

  serviceTabs.forEach((tab) => {
    tab.addEventListener("click", () => {

      serviceTabs.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute(
          "aria-selected",
          "false"
        );
      });

      tab.classList.add("active");

      tab.setAttribute(
        "aria-selected",
        "true"
      );

      const service =
        tab.dataset.service;

      flightForm.hidden =
        service !== "flights";

      hotelForm.hidden =
        service !== "hotels";

      carForm.hidden =
        service !== "cars";

      hideError();
      hideResults();
    });
  });


  /* =========================
     ROUND TRIP / ONE WAY
  ========================= */

  tripTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

      tripTabs.forEach((item) => {
        item.classList.remove("active");

        item.setAttribute(
          "aria-selected",
          "false"
        );
      });

      tab.classList.add("active");

      tab.setAttribute(
        "aria-selected",
        "true"
      );

      tripType = tab.dataset.trip;

      const returnField =
        document.getElementById(
          "returnField"
        );

      const returnInput =
        document.getElementById(
          "return-0"
        );

      if (tripType === "round") {

        returnField.hidden = false;

      } else {

        returnField.hidden = true;

        if (returnInput) {
          returnInput.value = "";
        }
      }
    });

  });


  /* =========================
     SWAP AIRPORTS
  ========================= */

  if (swapBtn) {

    swapBtn.addEventListener(
      "click",
      () => {

        const from =
          document.getElementById(
            "from-0"
          );

        const to =
          document.getElementById(
            "to-0"
          );

        if (!from || !to) {
          return;
        }

        const temp = from.value;

        from.value = to.value;
        to.value = temp;

      }
    );

  }


  /* =========================
     PASSENGER POPUP
  ========================= */

  if (paxTrigger) {

    paxTrigger.addEventListener(
      "click",
      () => {

        const expanded =
          paxTrigger.getAttribute(
            "aria-expanded"
          ) === "true";

        paxTrigger.setAttribute(
          "aria-expanded",
          String(!expanded)
        );

        paxPanel.hidden = expanded;

      }
    );

  }


  /* =========================
     DONE BUTTON
  ========================= */

  if (paxDone) {

    paxDone.addEventListener(
      "click",
      () => {

        paxPanel.hidden = true;

        paxTrigger.setAttribute(
          "aria-expanded",
          "false"
        );

        updatePaxLabel();

      }
    );

  }


  /* =========================
     PASSENGER STEPPERS
  ========================= */

  document
    .querySelectorAll(".stepper-row")
    .forEach((row) => {

      const type =
        row.dataset.type;

      const minus =
        row.querySelector(".minus");

      const plus =
        row.querySelector(".plus");

      const output =
        row.querySelector(".step-val");


      if (minus) {

        minus.addEventListener(
          "click",
          () => {

            const minimum =
              type === "adults"
                ? 1
                : 0;

            paxState[type] =
              Math.max(
                minimum,
                paxState[type] - 1
              );

            output.textContent =
              paxState[type];

            updatePaxLabel();
          }
        );

      }


      if (plus) {

        plus.addEventListener(
          "click",
          () => {

            paxState[type] =
              Math.min(
                9,
                paxState[type] + 1
              );

            output.textContent =
              paxState[type];

            updatePaxLabel();
          }
        );

      }

    });


  /* =========================
     CABIN BUTTONS
  ========================= */

  document
    .querySelectorAll(".cabin")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".cabin")
            .forEach((item) => {

              item.classList.remove(
                "active"
              );

              item.setAttribute(
                "aria-checked",
                "false"
              );

            });


          button.classList.add(
            "active"
          );

          button.setAttribute(
            "aria-checked",
            "true"
          );


          paxState.cabin =
            button.dataset.cabin;

          updatePaxLabel();

        }
      );

    });


  /* =========================
     FLIGHT SEARCH
  ========================= */

  if (flightForm) {

    flightForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        hideError();

        const from =
          getValue("from-0");

        const to =
          getValue("to-0");

        const depart =
          getValue("depart-0");

        const returnDate =
          getValue("return-0");


        if (!from || !to) {

          showError(
            "Please enter both origin and destination."
          );

          return;
        }


        if (
          from.toLowerCase() ===
          to.toLowerCase()
        ) {

          showError(
            "Origin and destination cannot be the same."
          );

          return;
        }


        if (!depart) {

          showError(
            "Please select a departure date."
          );

          return;
        }


        if (
          tripType === "round" &&
          !returnDate
        ) {

          showError(
            "Please select a return date."
          );

          return;
        }


        if (
          tripType === "round" &&
          returnDate < depart
        ) {

          showError(
            "Return date must be on or after the departure date."
          );

          return;
        }


        saveRecentSearch(
          from,
          to
        );

        renderFlightResults(
          from,
          to
        );

      }
    );

  }


  /* =========================
     HOTEL SEARCH
  ========================= */

  if (hotelForm) {

    hotelForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        hideError();

        const destination =
          getValue(
            "hotel-destination"
          );

        const checkin =
          getValue(
            "hotel-checkin"
          );

        const checkout =
          getValue(
            "hotel-checkout"
          );


        if (!destination) {

          showError(
            "Please enter a hotel destination."
          );

          return;
        }


        if (!checkin || !checkout) {

          showError(
            "Please select check-in and check-out dates."
          );

          return;
        }


        if (checkout <= checkin) {

          showError(
            "Check-out must be after check-in."
          );

          return;
        }


        renderHotelResults(
          destination
        );

      }
    );

  }


  /* =========================
     CAR SEARCH
  ========================= */

  if (carForm) {

    carForm.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        hideError();

        const pickup =
          getValue("car-pickup");

        const dropoff =
          getValue("car-dropoff");

        const pickDate =
          getValue("car-pickdate");

        const dropDate =
          getValue("car-dropdate");


        if (!pickup || !dropoff) {

          showError(
            "Please enter both pick-up and drop-off locations."
          );

          return;
        }


        if (!pickDate || !dropDate) {

          showError(
            "Please select both rental dates."
          );

          return;
        }


        if (dropDate < pickDate) {

          showError(
            "Drop-off date must be on or after pick-up date."
          );

          return;
        }


        renderCarResults(
          pickup,
          dropoff
        );

      }
    );

  }


  /* =========================
     CLEAR RECENT SEARCHES
  ========================= */

  if (clearRecentBtn) {

    clearRecentBtn.addEventListener(
      "click",
      () => {

        localStorage.removeItem(
          "bookingAirSearches"
        );

        recentList.innerHTML =
          `
            <li class="recent-item">
              No recent searches
            </li>
          `;

        showToast(
          "Recent searches cleared."
        );

      }
    );

  }


  /* =========================
     POPULAR ROUTES
  ========================= */

  if (routeGrid) {

    routeGrid
      .querySelectorAll(".route-card")
      .forEach((card) => {

        card.addEventListener(
          "click",
          () => {

            const from =
              document.getElementById(
                "from-0"
              );

            const to =
              document.getElementById(
                "to-0"
              );


            from.value =
              card.dataset.fc;

            to.value =
              card.dataset.tc;


            serviceTabs.forEach(
              (item) => {
                item.classList.remove(
                  "active"
                );

                item.setAttribute(
                  "aria-selected",
                  "false"
                );
              }
            );


            const flightTab =
              document.querySelector(
                '[data-service="flights"]'
              );

            flightTab.classList.add(
              "active"
            );

            flightTab.setAttribute(
              "aria-selected",
              "true"
            );


            flightForm.hidden = false;
            hotelForm.hidden = true;
            carForm.hidden = true;


            showToast(
              `Selected route: ${card.dataset.fc} → ${card.dataset.tc}`
            );


            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

          }
        );

      });

  }


  /* =========================
     RECENT SEARCH CLICK
  ========================= */

  if (recentList) {

    recentList
      .querySelectorAll(".recent-item")
      .forEach((item) => {

        item.addEventListener(
          "click",
          () => {

            if (
              !item.dataset.from ||
              !item.dataset.to
            ) {
              return;
            }


            const from =
              document.getElementById(
                "from-0"
              );

            const to =
              document.getElementById(
                "to-0"
              );


            from.value =
              item.dataset.from;

            to.value =
              item.dataset.to;


            if (flightForm) {
              flightForm.requestSubmit();
            }

          }
        );

      });

  }


  /* =========================
     DATE SETUP
  ========================= */

  function setInitialDates() {

    const today =
      new Date();

    const depart =
      addDays(today, 14);

    const returnDate =
      addDays(today, 21);


    setDate(
      "depart-0",
      depart
    );

    setDate(
      "return-0",
      returnDate
    );

    setDate(
      "hotel-checkin",
      depart
    );

    setDate(
      "hotel-checkout",
      returnDate
    );

    setDate(
      "car-pickdate",
      depart
    );

    setDate(
      "car-dropdate",
      addDays(today, 18)
    );


    setMinDate(
      "depart-0",
      today
    );

    setMinDate(
      "hotel-checkin",
      today
    );

    setMinDate(
      "car-pickdate",
      today
    );


    setMinDate(
      "return-0",
      depart
    );

    setMinDate(
      "hotel-checkout",
      depart
    );

    setMinDate(
      "car-dropdate",
      depart
    );

  }


  function setDate(id, date) {

    const input =
      document.getElementById(id);

    if (input) {
      input.value =
        formatDate(date);
    }

  }


  function setMinDate(id, date) {

    const input =
      document.getElementById(id);

    if (input) {
      input.min =
        formatDate(date);
    }

  }


  function addDays(
    date,
    days
  ) {

    const result =
      new Date(date);

    result.setDate(
      result.getDate() + days
    );

    return result;
  }


  function formatDate(date) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    return `${year}-${month}-${day}`;
  }


  /* =========================
     PASSENGER LABEL
  ========================= */

  function updatePaxLabel() {

    const total =
      paxState.adults +
      paxState.children +
      paxState.infants;


    paxLabel.textContent =
      `${total} passenger${total === 1 ? "" : "s"} · ${paxState.cabin}`;

  }


  /* =========================
     FLIGHT RESULTS
  ========================= */

  function renderFlightResults(
    from,
    to
  ) {

    showLoading(
      "Finding available flights..."
    );


    setTimeout(() => {

      const results =
        demoFlights.map(
          (flight, index) => ({
            ...flight,
            id: index + 1,
            from,
            to
          })
        );


      renderResults(
        `
          Available Flights
          (${results.length})
        `,
        `
          <div class="results-header">

            <h2>
              Available Flights
              (${results.length})
            </h2>

            <label>
              <strong>Sort by:</strong>

              <select
                id="sortFilter"
                class="sort-select"
              >
                <option value="low">
                  Price: Low to High
                </option>

                <option value="high">
                  Price: High to Low
                </option>

                <option value="airline">
                  Airline A to Z
                </option>
              </select>

            </label>

          </div>


          <ul
            class="results-list"
            id="flightResults"
          >

            ${createFlightCards(results)}

          </ul>
        `
      );


      const sort =
        document.getElementById(
          "sortFilter"
        );


      if (sort) {

        sort.addEventListener(
          "change",
          () => {

            const sorted =
              [...results];


            if (
              sort.value === "low"
            ) {

              sorted.sort(
                (a, b) =>
                  a.price - b.price
              );

            }


            if (
              sort.value === "high"
            ) {

              sorted.sort(
                (a, b) =>
                  b.price - a.price
              );

            }


            if (
              sort.value === "airline"
            ) {

              sorted.sort(
                (a, b) =>
                  a.airline.localeCompare(
                    b.airline
                  )
              );

            }


            document.getElementById(
              "flightResults"
            ).innerHTML =
              createFlightCards(
                sorted
              );


            bindResultButtons();

          }
        );

      }


      bindResultButtons();

    }, 450);

  }


  function createFlightCards(
    flights
  ) {

    return flights
      .map(
        (flight) => `
          <li class="result-card">

            <div class="result-main">

              <div class="result-time">
                ${escapeHtml(
                  flight.depart
                )}
                –
                ${escapeHtml(
                  flight.arrive
                )}
              </div>

              <div class="result-meta">
                ${escapeHtml(
                  flight.airline
                )}
                · Nonstop ·
                ${escapeHtml(
                  flight.duration
                )}
              </div>

              <div class="result-sub">
                ${escapeHtml(
                  flight.from
                )}
                →
                ${escapeHtml(
                  flight.to
                )}
                ·
                ${escapeHtml(
                  paxState.cabin
                )}
              </div>

            </div>


            <div>

              <div class="result-price">
                $${flight.price}
              </div>

              <button
                type="button"
                class="search-btn select-result"
                data-message="Flight selected!"
              >
                Select
              </button>

            </div>

          </li>
        `
      )
      .join("");
  }


  /* =========================
     HOTEL RESULTS
  ========================= */

  function renderHotelResults(
    destination
  ) {

    showLoading(
      "Searching available hotels..."
    );


    setTimeout(() => {

      const hotels =
        demoHotels.map(
          (hotel) => ({
            ...hotel,
            name:
              `${hotel.name} ${destination}`
          })
        );


      renderResults(
        `Available Hotels near ${destination}`,

        `
          <div class="results-header">

            <h2>
              Available Hotels near
              ${escapeHtml(
                destination
              )}
              (${hotels.length})
            </h2>

          </div>


          <ul class="results-list">

            ${hotels
              .map(
                (hotel) => `
                  <li class="result-card">

                    <div class="result-main">

                      <div class="result-time">
                        🏨
                        ${escapeHtml(
                          hotel.name
                        )}
                      </div>

                      <div class="result-meta">
                        ${escapeHtml(
                          hotel.rating
                        )}
                      </div>

                      <div class="result-sub">
                        ${escapeHtml(
                          hotel.amenity
                        )}
                      </div>

                    </div>


                    <div>

                      <div class="result-price">
                        $${hotel.price}
                        <small>
                          /night
                        </small>
                      </div>

                      <button
                        type="button"
                        class="search-btn select-result"
                        data-message="Hotel room reserved!"
                      >
                        Book Room
                      </button>

                    </div>

                  </li>
                `
              )
              .join("")}

          </ul>
        `
      );


      bindResultButtons();

    }, 450);

  }


  /* =========================
     CAR RESULTS
  ========================= */

  function renderCarResults(
    pickup,
    dropoff
  ) {

    showLoading(
      "Finding available vehicles..."
    );


    setTimeout(() => {

      renderResults(
        `Rental Cars near ${pickup}`,

        `
          <div class="results-header">

            <h2>
              Available Rental Cars
              (${demoCars.length})
            </h2>

          </div>


          <ul class="results-list">

            ${demoCars
              .map(
                (car) => `
                  <li class="result-card">

                    <div class="result-main">

                      <div class="result-time">
                        🚗
                        ${escapeHtml(
                          car.model
                        )}
                      </div>

                      <div class="result-meta">
                        ${escapeHtml(
                          car.className
                        )}
                        ·
                        ${escapeHtml(
                          car.vendor
                        )}
                      </div>

                      <div class="result-sub">
                        ${escapeHtml(
                          car.features
                        )}
                        · Drop-off:
                        ${escapeHtml(
                          dropoff
                        )}
                      </div>

                    </div>


                    <div>

                      <div class="result-price">
                        $${car.price}
                        <small>
                          /day
                        </small>
                      </div>

                      <button
                        type="button"
                        class="search-btn select-result"
                        data-message="Car rental reserved!"
                      >
                        Reserve Car
                      </button>

                    </div>

                  </li>
                `
              )
              .join("")}

          </ul>
        `
      );


      bindResultButtons();

    }, 450);

  }


  /* =========================
     RESULTS DISPLAY
  ========================= */

  function renderResults(
    title,
    content
  ) {

    resultsSection.hidden = false;

    resultsSection.innerHTML =
      content;

    resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }


  function showLoading(
    text
  ) {

    resultsSection.hidden = false;

    resultsSection.innerHTML =
      `
        <div class="loading-spinner">

          <div
            class="spinner"
            aria-hidden="true"
          ></div>

          <p>
            ${escapeHtml(text)}
          </p>

        </div>
      `;

  }


  function hideResults() {

    resultsSection.hidden = true;

    resultsSection.innerHTML = "";

  }


  /* =========================
     RESULT BUTTONS
  ========================= */

  function bindResultButtons() {

    document
      .querySelectorAll(
        ".select-result"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            showToast(
              button.dataset.message ||
              "Selection confirmed."
            );

          }
        );

      });

  }


  /* =========================
     ERROR HANDLING
  ========================= */

  function showError(
    message
  ) {

    formError.textContent =
      message;

    formError.hidden = false;

    formError.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }


  function hideError() {

    formError.hidden = true;

    formError.textContent = "";

  }


  /* =========================
     RECENT SEARCH STORAGE
  ========================= */

  function saveRecentSearch(
    from,
    to
  ) {

    let searches = [];


    try {

      searches =
        JSON.parse(
          localStorage.getItem(
            "bookingAirSearches"
          )
        ) || [];

    } catch (error) {

      searches = [];

    }


    searches =
      searches.filter(
        (item) =>
          !(
            item.from === from &&
            item.to === to
          )
      );


    searches.unshift({
      from,
      to,
      date:
        new Date().toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric"
          }
        )
    });


    localStorage.setItem(
      "bookingAirSearches",
      JSON.stringify(
        searches.slice(0, 5)
      )
    );


    loadRecentSearches();

  }


  function loadRecentSearches() {

    if (!recentList) {
      return;
    }


    let searches = [];


    try {

      searches =
        JSON.parse(
          localStorage.getItem(
            "bookingAirSearches"
          )
        ) || [];

    } catch (error) {

      searches = [];

    }


    if (!searches.length) {
      return;
    }


    recentList.innerHTML =
      searches
        .map(
          (item) => `
            <li
              class="recent-item"
              data-from="${escapeHtml(
                item.from
              )}"
              data-to="${escapeHtml(
                item.to
              )}"
            >

              <span class="ri-route">

                <b>
                  ${escapeHtml(
                    item.from
                  )}
                </b>

                <span>
                  →
                </span>

                <b>
                  ${escapeHtml(
                    item.to
                  )}
                </b>

              </span>


              <span class="ri-meta">
                ${escapeHtml(
                  item.from
                )}
                ·
                ${escapeHtml(
                  item.to
                )}
              </span>


              <span class="ri-date">
                ${escapeHtml(
                  item.date
                )}
              </span>

            </li>
          `
        )
        .join("");


    recentList
      .querySelectorAll(
        ".recent-item"
      )
      .forEach((item) => {

        item.addEventListener(
          "click",
          () => {

            const from =
              document.getElementById(
                "from-0"
              );

            const to =
              document.getElementById(
                "to-0"
              );


            from.value =
              item.dataset.from;

            to.value =
              item.dataset.to;


            flightForm.requestSubmit();

          }
        );

      });

  }


  /* =========================
     TOAST
  ========================= */

  function showToast(
    message
  ) {

    const toastWrap =
      document.getElementById(
        "toastWrap"
      );


    if (!toastWrap) {
      return;
    }


    const toast =
      document.createElement(
        "div"
      );


    toast.className =
      "toast";

    toast.textContent =
      message;


    toastWrap.appendChild(
      toast
    );


    setTimeout(
      () => {
        toast.remove();
      },
      3000
    );

  }


  /* =========================
     GET INPUT VALUE
  ========================= */

  function getValue(
    id
  ) {

    const element =
      document.getElementById(id);


    if (!element) {
      return "";
    }


    return element.value.trim();

  }


  /* =========================
     SECURITY
     ESCAPE HTML
  ========================= */

  function escapeHtml(
    value
  ) {

    return String(value)
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

  }

});