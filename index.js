const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `
      <img src="${imgSrc}" />
      ${movie.Title} (${movie.Year})
    `;
  },
  inputValue(movie) {
    return `${movie.Title} (${movie.Year})`
  },
  async fetchData(searchTerm) {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: '27a5da02',
        s: searchTerm
      }
    });
    if (response.data.Error) {
      return [];
    }
    return response.data.Search
  }
}


createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('.left-summary'), true);
  },
});

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('.right-summary'), false);
  },
})

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summary, leftSide) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apiKey: '27a5da02',
      i: movie.imdbID
    }
  })
  summary.innerHTML = movieTemplate(response.data);

  leftSide ? leftMovie = response.data : rightMovie = response.data;

  if (leftMovie && rightMovie) {
    runComparison();
  }
}

const runComparison = () => {
  const leftSideStats = document.querySelectorAll('.left-summary .notification')
  const rightSideStats = document.querySelectorAll('.right-summary .notification')
  leftSideStats.forEach(
    (leftStat, index) => {
      const rightStat = rightSideStats[index]
      const leftValue = parseInt(leftStat.dataset.value);
      const rightValue = parseInt(rightStat.dataset.value);

      if (leftValue > rightValue) {
        rightStat.classList.remove('is-primary')
        rightStat.classList.add('is-danger')
      } else {
        leftStat.classList.remove('is-primary')
        leftStat.classList.add('is-danger')
      }
    }
  )
}

const movieTemplate = (movieDetails) => {
  const dollars = parseInt(movieDetails.BoxOffice.replace(/\$/g, '').replace(/,/g, ''))
  const metaScore = parseInt(movieDetails.Metascore)
  const imdbRating = parseFloat(movieDetails.imdbRating)
  const votes = parseInt(movieDetails.imdbVotes.replace(/,/g, ''))
  const awards = movieDetails.Awards.split(' ').reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0)
  console.log(awards)

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetails.Poster}"  />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>
            ${movieDetails.Title}
          </h1>
          <h4>
            ${movieDetails.Genre}
          </h4>
          <p>
            ${movieDetails.Plot}
          </p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetails.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetails.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metaScore} class="notification is-primary">
      <p class="title">${movieDetails.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetails.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${votes} class="notification is-primary">
      <p class="title">${movieDetails.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `
}