const API_KEY = "YOUR_OMDB_API_KEY";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsSection = document.getElementById("results");
const sortFilter = document.getElementById("sortFilter");
const loading = document.getElementById("loading");

searchBtn.addEventListener("click", fetchMovies);
sortFilter.addEventListener("change", applySorting);

async function fetchMovies() {
  const query = searchInput.value.trim();
  if (!query) return;

  showLoading();

  const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    hideLoading();

    if (data.Response === "False") {
      resultsSection.innerHTML = `<p>No movies found.</p>`;
      return;
    }

    window.movieResults = data.Search;
    renderMovies(window.movieResults);

  } catch (error) {
    hideLoading();
    resultsSection.innerHTML = `<p>Error fetching data.</p>`;
  }
}

function renderMovies(movies) {
  resultsSection.innerHTML = movies
    .map(movie => `
      <div class="movie-card">
        <img src="${movie.Poster}" alt="${movie.Title}" />
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
      </div>
    `)
    .join("");
}

function applySorting() {
  if (!window.movieResults) return;

  let sorted = [...window.movieResults];

  switch (sortFilter.value) {
    case "a-z":
      sorted.sort((a, b) => a.Title.localeCompare(b.Title));
      break;
    case "z-a":
      sorted.sort((a, b) => b.Title.localeCompare(a.Title));
      break;
    case "new-old":
      sorted.sort((a, b) => b.Year - a.Year);
      break;
    case "old-new":
      sorted.sort((a, b) => a.Year - b.Year);
      break;
  }

  renderMovies(sorted);
}

function showLoading() {
  loading.classList.remove("hidden");
}

function hideLoading() {
  loading.classList.add("hidden");
}
