import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autoComplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

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

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);

autoComplete( $('#address'), $('#lng'), $('#lat') );