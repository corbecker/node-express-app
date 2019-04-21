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
      if(!restaurants.length){
        return;
      }

      const markers = restaurants.map(place => {
        const [placeLat, placeLng] = place.location.coordinates;
        const position = {lat: placeLat, lng: placeLng, };
        const marker = new google.maps.Marker({ map, position });
        marker.place = place;
        return marker;
      })
    })
}

function makeMap(mapDiv){
  if(!mapDiv) return;
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  const input = $('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
}

export default makeMap;