import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(restaurants){
  return restaurants.map(restaurant => {
    return `
      <a href="/restaurant/${restaurant.slug}" class="search__result">
        <strong>${restaurant.name}</strong>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  if(!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function(){
    if(!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    // show results
    searchResults.style.display = 'block';
    
    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        // if there is data
        if(res.data.length){
          const html = searchResultsHTML(res.data);
          searchResults.innerHTML = dompurify.sanitize(html);
          return;
        }
        //nothing came back
        searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">No results for ${this.value} found!</div>`);
      })
      .catch(err => {
        console.log(err);
      })
    
  });

  //keyboard inputs
  searchInput.on('keyup', (e) => {
    // if not up down or enter skip
    if(![38, 40, 13].includes(e.keyCode)){
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    //pressed down
    if(e.keyCode === 40 && current){
      next = current.nextElementSibling || items[0];
    }else if(e.keyCode === 40){
      next = items[0];
    }else if(e.keyCode === 38 && current){
      next = current.previousElementSibling || items[items.length - 1];
    }else if(e.keyCode === 38){
      next = items[items.length - 1];
    }else if(e.keyCode === 13 && current.href){
      window.location = current.href;
      return;
    }

    if(current){
      current.classList.remove(activeClass)
    }
    next.classList.add(activeClass);
  })
}

export default typeAhead;