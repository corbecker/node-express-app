import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autoComplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';

const burger = document.querySelector('.burger--container');
const navs = document.querySelectorAll('.nav__section');

burger.addEventListener('click', e => {
  burger.classList.toggle('is-expanded');
  navs.forEach(nav => {
    nav.classList.toggle('is-expanded');
  });
})

typeAhead( $('.search'));

makeMap( $('#map'));

autoComplete( $('#address'), $('#lng'), $('#lat') );