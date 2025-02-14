document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const moviesContainer = document.getElementById("moviesContainer");
    const sortDropdown = document.getElementById("sortDropdown");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageInfo = document.getElementById("pageInfo");
    const favoritesBtn = document.getElementById("favoritesBtn");
  
    let currentPage = 1;
    let totalPages = 1;
    let currentQuery = "";
    let currentMovies = [];
    let showingFavorites = false;
  
    loadMovies();
  
    searchBtn.addEventListener("click", () => {
      currentQuery = searchInput.value.trim();
      currentPage = 1;
      showingFavorites = false;
      loadMovies();
    });
  
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        searchBtn.click();
      }
    });
  
    sortDropdown.addEventListener("change", () => {
      if (currentMovies.length > 0) {
        if (sortDropdown.value === "title") {
          currentMovies.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortDropdown.value === "year") {
          currentMovies.sort((a, b) => {
            const aYear = a.release_date ? parseInt(a.release_date.split("-")[0]) : 0;
            const bYear = b.release_date ? parseInt(b.release_date.split("-")[0]) : 0;
            return aYear - bYear;
          });
        }
        displayMovies(currentMovies);
      }
    });
  
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1 && !showingFavorites) {
        currentPage--;
        loadMovies();
      }
    });
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages && !showingFavorites) {
        currentPage++;
        loadMovies();
      }
    });
  
    favoritesBtn.addEventListener("click", () => {
      showingFavorites = true;
      showFavorites();
    });
  
    function loadMovies() {
      let url = "api.php?";
      if (currentQuery !== "") {
        url += "query=" + encodeURIComponent(currentQuery) + "&page=" + currentPage;
      } else {
        url += "page=" + currentPage;
      }
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.results) {
            currentMovies = data.results;
            totalPages = data.total_pages || 1;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            displayMovies(currentMovies);
          } else {
            moviesContainer.innerHTML = "<p class='text-center'>No movies found.</p>";
          }
        })
        .catch(error => {
          console.error("Error fetching movies:", error);
          moviesContainer.innerHTML = "<p class='text-center text-danger'>Error fetching movies.</p>";
        });
    }
  
    function displayMovies(movies) {
      moviesContainer.innerHTML = "";
      if (movies && movies.length > 0) {
        movies.forEach(movie => {
          const col = document.createElement("div");
          col.className = "col-md-4 p-2";
          const card = document.createElement("div");
          card.className = "card movie-card";
          
          const favBtn = document.createElement("button");
          favBtn.className = "favorite-btn";
          favBtn.innerHTML = isFavorite(movie.id) ? "&#10084;" : "&#9825;";
          if (isFavorite(movie.id)) {
            favBtn.classList.add("active");
          }
          favBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(movie);
            favBtn.innerHTML = isFavorite(movie.id) ? "&#10084;" : "&#9825;";
            favBtn.classList.toggle("active");
          });
  
          const posterPath = movie.poster_path 
            ? "https://image.tmdb.org/t/p/w500" + movie.poster_path 
            : "https://via.placeholder.com/500x750?text=No+Image";
  
          card.innerHTML = `
            <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
              <p class="card-text">${movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</p>
              <p class="card-text">${movie.overview ? movie.overview.substring(0, 100) + "..." : ""}</p>
            </div>
          `;
          card.appendChild(favBtn);
          card.addEventListener("click", () => {
            loadMovieDetails(movie.id);
          });
          col.appendChild(card);
          moviesContainer.appendChild(col);
        });
      } else {
        moviesContainer.innerHTML = "<p class='text-center'>No movies found.</p>";
      }
    }
  
    function loadMovieDetails(movieId) {
      fetch("api.php?movie_id=" + movieId)
        .then(response => response.json())
        .then(movie => {
          showMovieModal(movie);
        })
        .catch(error => {
          console.error("Error fetching movie details:", error);
        });
    }
  
    function showMovieModal(movie) {
      const modalContent = document.getElementById("modalContent");
      const posterUrl = movie.poster_path 
        ? "https://image.tmdb.org/t/p/w500" + movie.poster_path 
        : "https://via.placeholder.com/500x750?text=No+Image";
      const genres = movie.genres ? movie.genres.map(g => g.name).join(", ") : "N/A";
  
      modalContent.innerHTML = `
        <div class="row">
          <div class="col-md-4">
            <img src="${posterUrl}" alt="${movie.title}" class="img-fluid rounded">
          </div>
          <div class="col-md-8">
            <h2>${movie.title}</h2>
            <p><strong>Release Date:</strong> ${movie.release_date || "N/A"}</p>
            <p><strong>Rating:</strong> ${movie.vote_average || "N/A"}</p>
            <p><strong>Runtime:</strong> ${movie.runtime ? movie.runtime + " mins" : "N/A"}</p>
            <p><strong>Genres:</strong> ${genres}</p>
            <p>${movie.overview || "No description available."}</p>
          </div>
        </div>
      `;
      let modal = new bootstrap.Modal(document.getElementById("movieModal"));
      modal.show();
    }
  
    function getFavorites() {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    }
  
    function isFavorite(movieId) {
      const favorites = getFavorites();
      return favorites.some(m => m.id === movieId);
    }
  
    function toggleFavorite(movie) {
      let favorites = getFavorites();
      if (isFavorite(movie.id)) {
        favorites = favorites.filter(m => m.id !== movie.id);
      } else {
        favorites.push(movie);
      }
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  
    function showFavorites() {
      const favorites = getFavorites();
      currentMovies = favorites;
      pageInfo.textContent = "Favorites";
      displayMovies(favorites);
    }
  });
  