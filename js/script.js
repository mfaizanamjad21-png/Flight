document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const flightForm = document.getElementById('flightForm');
  const hotelForm = document.getElementById('hotelForm');
  const carForm = document.getElementById('carForm');
  const serviceTabs = document.querySelectorAll('.service-tab');
  const paxTrigger = document.getElementById('paxTrigger');
  const paxPanel = document.getElementById('paxPanel');
  const paxDone = document.getElementById('paxDone');
  const paxLabel = document.getElementById('paxLabel');
  const formError = document.getElementById('formError');
  const clearRecentBtn = document.getElementById('clearRecent');
  const recentList = document.getElementById('recentList');
  const routeGrid = document.getElementById('routeGrid');
  const swapBtn = document.getElementById('swapBtn');

  const paxState = {
    adults: 1,
    children: 0,
    infants: 0,
    cabin: 'Economy'
  };

  let currentFlightResults = [];

  // Load Saved Recent Searches on initialization
  loadRecentSearches();

  // --- Fixed Service Tab Switcher (Flights, Hotels, Car Rentals) ---
  serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 1. Reset all tabs visual styling
      serviceTabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = 'transparent';
        t.style.color = 'var(--text-main)';
      });

      // 2. Set selected tab active style
      tab.classList.add('active');
      tab.style.background = 'var(--primary)';
      tab.style.color = '#fff';

      // 3. Hide all forms explicitly
      if (flightForm) {
        flightForm.hidden = true;
        flightForm.style.display = 'none';
      }
      if (hotelForm) {
        hotelForm.hidden = true;
        hotelForm.style.display = 'none';
      }
      if (carForm) {
        carForm.hidden = true;
        carForm.style.display = 'none';
      }

      // 4. Reveal only the selected form
      const service = tab.dataset.service;
      if (service === 'flights' && flightForm) {
        flightForm.hidden = false;
        flightForm.style.display = 'block';
      } else if (service === 'hotels' && hotelForm) {
        hotelForm.hidden = false;
        hotelForm.style.display = 'block';
      } else if (service === 'cars' && carForm) {
        carForm.hidden = false;
        carForm.style.display = 'block';
      }

      // 5. Hide active search results section when switching main tabs
      const resultsContainer = document.querySelector('.results-section');
      if (resultsContainer) resultsContainer.hidden = true;
    });
  });

  // Swap Flight Origin/Destination
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const fromInput = document.getElementById('from-0');
      const toInput = document.getElementById('to-0');
      if (fromInput && toInput) {
        const tempVal = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = tempVal;
      }
    });
  }

  // Passenger Dropdown logic
  if (paxTrigger) {
    paxTrigger.addEventListener('click', () => {
      const isExpanded = paxTrigger.getAttribute('aria-expanded') === 'true';
      paxTrigger.setAttribute('aria-expanded', !isExpanded);
      if (paxPanel) paxPanel.hidden = isExpanded;
    });
  }

  if (paxDone) {
    paxDone.addEventListener('click', () => {
      if (paxPanel) paxPanel.hidden = true;
      if (paxTrigger) paxTrigger.setAttribute('aria-expanded', 'false');
      updatePaxLabel();
    });
  }

  document.querySelectorAll('.stepper-row').forEach(row => {
    const type = row.dataset.type;
    const minusBtn = row.querySelector('.minus');
    const plusBtn = row.querySelector('.plus');
    const valDisplay = row.querySelector('.step-val');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        if (type === 'adults' && paxState.adults > 1) paxState.adults--;
        if (type === 'children' && paxState.children > 0) paxState.children--;
        if (type === 'infants' && paxState.infants > 0) paxState.infants--;
        if (valDisplay) valDisplay.textContent = paxState[type];
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        if (paxState[type] < 9) paxState[type]++;
        if (valDisplay) valDisplay.textContent = paxState[type];
      });
    }
  });

  document.querySelectorAll('.cabin').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cabin').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      e.target.classList.add('active');
      e.target.setAttribute('aria-checked', 'true');
      paxState.cabin = e.target.dataset.cabin;
    });
  });

  function updatePaxLabel() {
    if (!paxLabel) return;
    const totalPax = paxState.adults + paxState.children + paxState.infants;
    paxLabel.textContent = `${totalPax} passenger${totalPax > 1 ? 's' : ''} · ${paxState.cabin}`;
  }

  // Unified Dynamic Results Container
  function getResultsContainer() {
    let container = document.querySelector('.results-section');
    if (!container) {
      container = document.createElement('section');
      container.className = 'results-section';
      const searchSec = document.querySelector('.search');
      if (searchSec) searchSec.after(container);
    }
    container.hidden = false;
    return container;
  }

  // --- 1. Flight Search ---
  if (flightForm) {
    flightForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formError) formError.hidden = true;

      const fromVal = document.getElementById('from-0')?.value.trim();
      const toVal = document.getElementById('to-0')?.value.trim();

      if (!fromVal || !toVal) {
        showError('Please enter both origin and destination cities.');
        return;
      }

      saveRecentSearch(fromVal, toVal);
      renderLoadingState('Fetching available flights...');

      try {
        const apiKey = '6c3aab45';
        const query = encodeURIComponent(toVal || 'Air');
        const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
        const data = await res.json();

        const items = (data.Response === 'True' && data.Search) ? data.Search : [];
        currentFlightResults = generateFlightData(fromVal, toVal, items);
        renderFlightResults(currentFlightResults);
      } catch (err) {
        currentFlightResults = generateFlightData(fromVal, toVal, []);
        renderFlightResults(currentFlightResults);
      }
    });
  }

  function generateFlightData(from, to, apiItems) {
    const airlines = ['Skyloft Air', 'Global Airways', 'AeroFly', 'Pacific Sky', 'Star Express'];
    const resultsCount = Math.max(apiItems.length, 5);
    const flights = [];

    for (let i = 0; i < Math.min(resultsCount, 6); i++) {
      const basePrice = 250 + (i * 65) + Math.floor(Math.random() * 40);
      const title = apiItems[i] ? apiItems[i].Title : `${from} to ${to} Direct`;

      flights.push({
        id: i + 1,
        title: title,
        airline: airlines[i % airlines.length],
        from: from,
        to: to,
        departTime: `${7 + (i * 2)}:00 AM`,
        arriveTime: `${10 + (i * 2)}:30 AM`,
        duration: '3h 30m',
        price: basePrice
      });
    }
    return flights;
  }

  function renderFlightResults(flights) {
    const container = getResultsContainer();
    container.innerHTML = `
      <div class="results-header" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
        <h2>Available Flights (${flights.length})</h2>
        <div>
          <label for="sortFilter"><strong>Sort by:</strong> </label>
          <select id="sortFilter" class="sort-select">
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="az">Airline A to Z</option>
          </select>
        </div>
      </div>
      <ul class="results-list" id="resultsList" style="list-style: none; padding: 0;"></ul>
    `;

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        sortAndDisplayFlights(e.target.value);
      });
    }

    sortAndDisplayFlights('price-asc');
  }

  function sortAndDisplayFlights(sortType) {
    const sorted = [...currentFlightResults];
    if (sortType === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (sortType === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    if (sortType === 'az') sorted.sort((a, b) => a.airline.localeCompare(b.airline));

    const resultsList = document.getElementById('resultsList');
    if (resultsList) {
      resultsList.innerHTML = sorted.map(flight => `
        <li class="result-card" style="background: var(--bg-card); padding: 1rem; margin-top: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: bold; font-size: 1.1rem;">✈️ ${flight.departTime} – ${flight.arriveTime}</div>
            <div style="color: var(--text-muted); font-size: 0.9rem;">${flight.airline} · Nonstop · ${flight.duration}</div>
            <small style="color: var(--text-muted);">${flight.title}</small>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">$${flight.price}</div>
            <button type="button" class="search-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-top: 0.25rem;" onclick="showToast('Flight selected!')">Select</button>
          </div>
        </li>
      `).join('');
    }
  }

  // --- 2. Hotel Search ---
  if (hotelForm) {
    hotelForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const destInput = document.getElementById('hotel-destination');
      const dest = destInput ? destInput.value.trim() : 'London';
      renderLoadingState('Searching available hotels...');

      const fallbackHotels = [
        { name: `Grand Hyatt ${dest}`, rating: '4.8 ★', price: 210, amenity: 'Free WiFi · Pool · Breakfast' },
        { name: `${dest} City Center Inn`, rating: '4.3 ★', price: 115, amenity: 'Central Location · Free Parking' },
        { name: `Marriott Luxury Suites ${dest}`, rating: '4.9 ★', price: 320, amenity: 'Spa · Executive Lounge' },
        { name: `Boutique Hotel ${dest}`, rating: '4.6 ★', price: 175, amenity: 'Rooftop Bar · Fitness Center' },
        { name: `The Continental ${dest}`, rating: '4.7 ★', price: 240, amenity: 'City View · Fine Dining · Gym' }
      ];

      try {
        const apiKey = '6c3aab45';
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(dest)}&apikey=${apiKey}`);
        const data = await res.json();

        let hotels = [];
        if (data.Response === 'True' && data.Search) {
          hotels = data.Search.slice(0, 5).map((item, idx) => ({
            name: `${item.Title} Hotel (${dest})`,
            rating: `${(4.2 + (idx * 0.15)).toFixed(1)} ★`,
            price: 120 + (idx * 45),
            amenity: 'Free WiFi · Air Conditioning · Breakfast Included'
          }));
        } else {
          hotels = fallbackHotels;
        }

        renderCustomResults('Hotels', dest, hotels, item => `
          <li class="result-card" style="background: var(--bg-card); padding: 1rem; margin-top: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; font-size: 1.1rem;">🏨 ${item.name}</div>
              <div style="color: #f59e0b; font-size: 0.9rem; font-weight: 600;">${item.rating}</div>
              <small style="color: var(--text-muted);">${item.amenity}</small>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">$${item.price}<span style="font-size: 0.8rem; font-weight: normal;">/night</span></div>
              <button type="button" class="search-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-top: 0.25rem;" onclick="showToast('Hotel room reserved!')">Book Room</button>
            </div>
          </li>
        `);
      } catch (err) {
        renderCustomResults('Hotels', dest, fallbackHotels, item => `
          <li class="result-card" style="background: var(--bg-card); padding: 1rem; margin-top: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; font-size: 1.1rem;">🏨 ${item.name}</div>
              <div style="color: #f59e0b; font-size: 0.9rem; font-weight: 600;">${item.rating}</div>
              <small style="color: var(--text-muted);">${item.amenity}</small>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">$${item.price}<span style="font-size: 0.8rem; font-weight: normal;">/night</span></div>
              <button type="button" class="search-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-top: 0.25rem;" onclick="showToast('Hotel room reserved!')">Book Room</button>
            </div>
          </li>
        `);
      }
    });
  }

  // --- 3. Car Rental Search ---
  if (carForm) {
    carForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pickupInput = document.getElementById('car-pickup');
      const pickup = pickupInput ? pickupInput.value.trim() : 'Airport';
      renderLoadingState('Finding available vehicles...');

      const fallbackCars = [
        { model: 'Toyota Corolla or similar', class: 'Compact Sedan', price: 45, vendor: 'Hertz', features: '5 Seats · Automatic · Unlimited Mileage' },
        { model: 'Ford Explorer or similar', class: 'Midsize SUV', price: 78, vendor: 'Enterprise', features: '7 Seats · All-Wheel Drive' },
        { model: 'Tesla Model 3', class: 'Electric Premium', price: 95, vendor: 'Avis', features: 'Autopilot · Free Supercharging' },
        { model: 'Hyundai Elantra', class: 'Economy', price: 38, vendor: 'Budget', features: '5 Seats · High MPG' },
        { model: 'Jeep Wrangler', class: '4x4 SUV', price: 85, vendor: 'Sixt', features: '4WD · Convertible Top · Unlimited Mileage' }
      ];

      try {
        const apiKey = '6c3aab45';
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(pickup)}&apikey=${apiKey}`);
        const data = await res.json();

        let cars = [];
        const vendors = ['Hertz', 'Enterprise', 'Avis', 'Budget', 'Sixt'];
        const classes = ['Compact Sedan', 'Midsize SUV', 'Electric Premium', 'Economy', 'Fullsize Sedan'];

        if (data.Response === 'True' && data.Search) {
          cars = data.Search.slice(0, 5).map((item, idx) => ({
            model: `${item.Title} Edition Vehicle`,
            class: classes[idx % classes.length],
            price: 40 + (idx * 15),
            vendor: vendors[idx % vendors.length],
            features: '5 Seats · Automatic Transmission · Free Cancellation'
          }));
        } else {
          cars = fallbackCars;
        }

        renderCustomResults('Rental Cars', pickup, cars, item => `
          <li class="result-card" style="background: var(--bg-card); padding: 1rem; margin-top: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; font-size: 1.1rem;">🚗 ${item.model}</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">${item.class} · Provided by <strong>${item.vendor}</strong></div>
              <small style="color: var(--text-muted);">${item.features}</small>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">$${item.price}<span style="font-size: 0.8rem; font-weight: normal;">/day</span></div>
              <button type="button" class="search-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-top: 0.25rem;" onclick="showToast('Car rental reserved!')">Reserve Car</button>
            </div>
          </li>
        `);
      } catch (err) {
        renderCustomResults('Rental Cars', pickup, fallbackCars, item => `
          <li class="result-card" style="background: var(--bg-card); padding: 1rem; margin-top: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: bold; font-size: 1.1rem;">🚗 ${item.model}</div>
              <div style="color: var(--text-muted); font-size: 0.9rem;">${item.class} · Provided by <strong>${item.vendor}</strong></div>
              <small style="color: var(--text-muted);">${item.features}</small>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary);">$${item.price}<span style="font-size: 0.8rem; font-weight: normal;">/day</span></div>
              <button type="button" class="search-btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-top: 0.25rem;" onclick="showToast('Car rental reserved!')">Reserve Car</button>
            </div>
          </li>
        `);
      }
    });
  }

  // Helper Methods
  function renderLoadingState(text) {
    const container = getResultsContainer();
    container.innerHTML = `<div style="text-align: center; padding: 2rem;"><p>${text}</p></div>`;
  }

  function renderCustomResults(category, location, list, templateFn) {
    const container = getResultsContainer();
    container.innerHTML = `
      <div class="results-header" style="margin-top: 1.5rem;">
        <h2>Available ${category} near ${location} (${list.length})</h2>
      </div>
      <ul class="results-list" style="list-style: none; padding: 0;">
        ${list.map(templateFn).join('')}
      </ul>
    `;
  }

  function showError(msg) {
    if (formError) {
      formError.textContent = msg;
      formError.hidden = false;
    }
  }

  // Local Storage Methods
  function saveRecentSearch(from, to) {
    let searches = JSON.parse(localStorage.getItem('skyloft_searches')) || [];
    searches = searches.filter(s => !(s.from === from && s.to === to));
    searches.unshift({ from, to, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    if (searches.length > 5) searches.pop();
    localStorage.setItem('skyloft_searches', JSON.stringify(searches));
    loadRecentSearches();
  }

  function loadRecentSearches() {
    const searches = JSON.parse(localStorage.getItem('skyloft_searches'));
    if (!searches || !searches.length || !recentList) return;

    recentList.innerHTML = searches.map(s => `
      <li class="recent-item" data-from="${s.from}" data-to="${s.to}">
        <span class="ri-route"><b>${s.from}</b> <span class="arrow">→</span> <b>${s.to}</b></span>
        <span class="ri-meta">${s.from} · ${s.to}</span>
        <span class="ri-date">${s.date}</span>
      </li>
    `).join('');

    recentList.querySelectorAll('.recent-item').forEach(item => {
      item.addEventListener('click', () => {
        const fromInput = document.getElementById('from-0');
        const toInput = document.getElementById('to-0');
        if (fromInput) fromInput.value = item.dataset.from;
        if (toInput) toInput.value = item.dataset.to;
        if (flightForm) flightForm.dispatchEvent(new Event('submit'));
      });
    });
  }

  if (clearRecentBtn) {
    clearRecentBtn.addEventListener('click', () => {
      localStorage.removeItem('skyloft_searches');
      if (recentList) recentList.innerHTML = '<li style="color: var(--text-muted); font-size: 0.9rem;">No recent searches</li>';
      showToast('Recent searches cleared');
    });
  }

  if (routeGrid) {
    routeGrid.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('click', () => {
        const from = card.dataset.fc;
        const to = card.dataset.tc;
        const fromInput = document.getElementById('from-0');
        const toInput = document.getElementById('to-0');
        if (fromInput) fromInput.value = from;
        if (toInput) toInput.value = to;
        showToast(`Selected route: ${from} to ${to}`);
      });
    });
  }

  window.showToast = function(msg) {
    const toastWrap = document.getElementById('toastWrap');
    if (!toastWrap) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = 'background: #10b981; color: #fff; padding: 0.75rem 1rem; border-radius: 6px; margin-top: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    toastWrap.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };
});