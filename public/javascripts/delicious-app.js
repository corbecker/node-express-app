import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autoComplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';

const burger = document.querySelector('.burger--container');
const navs = document.querySelectorAll('.nav__section');

burger.addEventListener('click', e => {
  burger.classList.toggle('is-expanded');
  navs.forEach(nav => {
    nav.classList.toggle('is-expanded');
  });
})

typeAhead( $('.search'));

autoComplete( $('#address'), $('#lng'), $('#lat') );