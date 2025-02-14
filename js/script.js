document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const movieList = document.getElementById("movieList");
  const loading = document.getElementById("loading");
  const sortDropdown = document.getElementById("sortDropdown");
  
  let movies = [];

  searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
          searchMovies(query);
      }
  });

  searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
          searchBtn.click();
      }
  });

  sortDropdown.addEventListener("change", () => {
      if (sortDropdown.value === "title") {
          movies.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortDropdown.value === "year") {
          movies.sort((a, b) => {
              const aYear = a.release_date ? parseInt(a.release_date.split("-")[0]) : 0;
              const bYear = b.release_date ? parseInt(b.release_date.split("-")[0]) : 0;
              return aYear - bYear;
          });
      }
      displayMovies(movies);
  });

  function searchMovies(query) {
      loading.style.display = "block";
      fetch(`api.php?query=${encodeURIComponent(query)}`)
          .then((response) => response.json())
          .then((data) => {
              loading.style.display = "none";
              movies = data.results || [];
              displayMovies(movies);
          })
          .catch(() => {
              loading.style.display = "none";
              movieList.innerHTML = "<p class='text-center text-danger'>Error fetching movies.</p>";
          });
  }

  function displayMovies(movies) {
      movieList.innerHTML = movies.length
          ? movies.map(movie => `<p>${movie.title} (${movie.release_date?.split("-")[0] || "N/A"})</p>`).join("")
          : "<p class='text-center'>No movies found.</p>";
  }
});
