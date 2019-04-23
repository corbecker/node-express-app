import axios from 'axios';
import { $ } from './bling';

const mapOptions = {
  center: { 
    lat: 53.3498,
    lng: -6.2603
  },
  zoom: 10
}

function loadPlaces(map, lat = 53.3498, lng = -6.2603){
  axios
    .get(`/api/restaurants/near?lat=${lat}&lng=${lng}`)
    .then(res => {
      const restaurants = res.data;
      const mapContainer = document.querySelector('.map');
      const mapInput = document.querySelector('#map');
      
      if(!restaurants.length){
        const errMessage = document.createElement('div');
        errMessage.classList.add('search__result');
        errMessage.textContent = 'No restaurants listed there yet.'
        mapContainer.insertBefore(errMessage, mapInput);
        setTimeout(()=> {
          errMessage.remove();
        }, 2000)
        return;
      }
      
      //bounds
      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      const markers = restaurants.map(place => {
        const [placeLat, placeLng] = place.location.coordinates;
        const position = {lat: placeLat, lng: placeLng, };
        bounds.extend(position);
        const marker = new google.maps.Marker({ map, position });
        marker.place = place;
        return marker;
      });

      markers.forEach(marker => marker.addListener('click', function(){
        const html = `
          <div class="popup>
            <a href="/restaurant/${this.place.slug}">
              <img src="/uploads/${this.place.photo || 'restaurant.png'}" width="300" alt="${this.place.name}" />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
          `;
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
      }));

      //zoom map to fit markers
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);

    })
    .catch(err => {
      console.log(err);
    })
}

function makeMap(mapDiv){
  if(!mapDiv) return;
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  })
}

export default makeMap;