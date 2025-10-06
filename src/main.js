// src/main.js

// styles
import './css/styles.css';
import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

// libs + modules
import iziToast from 'izitoast';
import { getImagesByQuery, PER_PAGE } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

// refs
const refs = {
  form: document.querySelector('.form'),
  input: document.querySelector('.form input[name="search-text"]'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  searchBtn: document.querySelector('.search-btn'),
};

// state
let currentQuery = '';
let page = 1;
let totalHits = 0;
let loaded = 0;
let isLoading = false;

// listeners
refs.form.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

// handlers
async function onSubmit(e) {
  e.preventDefault();
  const q = refs.input.value.trim();

  if (!q) return toast(`The search field can't be empty! Please, enter your request!`);
  if (q.length > 100) return toast('Search query must be 100 characters or less.');

  // reset state
  currentQuery = q;
  page = 1;
  totalHits = 0;
  loaded = 0;

  clearGallery();
  hideLoadMoreButton();

  await loadPage({ replace: true });


  if (loaded > 0 && loaded < totalHits) showLoadMoreButton();
}

async function onLoadMore() {
  await loadPage({ replace: false, smoothScroll: true });

  // кінець колекції
  if (loaded >= totalHits) {
    hideLoadMoreButton();
    iziToast.info({
      message: `We're sorry, but you've reached the end of search results.`,
      position: 'topRight',
    });
  }
}

// core loader
async function loadPage({ replace = false, smoothScroll = false } = {}) {
  if (isLoading) return;
  isLoading = true;

  showLoader();
  refs.searchBtn.disabled = true;
  refs.loadMoreBtn.disabled = true;

  try {
    const { hits, totalHits: totalFromApi } = await getImagesByQuery(currentQuery, page);

    if (page === 1) totalHits = totalFromApi || 0;

    if (!hits?.length) {
      if (page === 1) toast(`Sorry, there are no images matching your search query. Please, try again!`);
      return;
    }

    createGallery(hits);
    loaded += hits.length;

    // після догрузки робимо плавний скролл
    if (!replace && smoothScroll) smoothScrollByCard();

    page += 1;
    if (page === 2) refs.form.reset();
  } catch (err) {
    console.error(err);
    toast('Something went wrong. Please, try again later.');
  } finally {
    hideLoader();
    refs.searchBtn.disabled = false;
    refs.loadMoreBtn.disabled = false;
    isLoading = false;
  }
}

// helpers
function toast(message) {
  iziToast.show({
    class: 'error-svg',
    position: 'topRight',
    icon: 'error-svg',
    message,
    maxWidth: '432',
    messageColor: '#fff',
    messageSize: '16px',
    backgroundColor: '#EF4040',
    close: false,
    closeOnClick: true,
  });
}

function smoothScrollByCard() {
  const firstCard = refs.gallery.firstElementChild;
  if (!firstCard) return;
  const { height } = firstCard.getBoundingClientRect();
  window.scrollBy({ top: height * 2, behavior: 'smooth' });
}