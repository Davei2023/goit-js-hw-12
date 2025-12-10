import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// --------- refs ---------
const refs = {
  form: document.querySelector('.form'),
  input: document.querySelector('.search-inp'),
  searchBtn: document.querySelector('.search-btn'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-btn'),
  loader: document.querySelector('.loader-container'),
};

// --------- api ---------
const PER_PAGE = 15;
const API_KEY = '42030436-f44bf17f2fc4b636ae2b8b7a9';

const api = axios.create({
  baseURL: 'https://pixabay.com/api/',
  timeout: 10000,
  params: {
    key: API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: PER_PAGE,
  },
});

async function getImages(q, page = 1) {
  const { data } = await api.get('', { params: { q, page } });
  return data; // { total, totalHits, hits }
}

// --------- state ---------
let page = 1;
let query = '';
let maxPage = 0;
let isLoading = false;

// --------- lightbox ---------
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

// --------- listeners ---------
refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

// --------- handlers ---------
async function onSearch(e) {
  e.preventDefault();
  const q = refs.input.value.trim();

  if (!q) return toast(`The search field can't be empty! Please, enter your request!`);
  if (q.length > 100) return toast('Search query must be 100 characters or less.');

  // reset
  query = q;
  page = 1;
  refs.gallery.innerHTML = '';
  hideLoadMore();
  showLoader();

  try {
    const { hits, totalHits } = await getImages(query, page);
    maxPage = Math.ceil((totalHits || 0) / PER_PAGE);

    if (!hits?.length) {
      toast(`Sorry, there are no images matching your search query. Please, try again!`);
      return;
    }

    appendMarkup(hits);
    if (page < maxPage) showLoadMore();
  } catch (err) {
    console.error(err);
    toast('Something went wrong. Please, try again later.');
  } finally {
    hideLoader();
    refs.form.reset();
  }
}

async function onLoadMore() {
  if (isLoading) return;
  if (page >= maxPage) return endOfResults();

  isLoading = true;
  showLoader();
  refs.loadMoreBtn.disabled = true;

  try {
    page += 1;
    const { hits } = await getImages(query, page);
    if (!hits?.length) return endOfResults();

    appendMarkup(hits);
    smoothScrollByCard();

    if (page >= maxPage) endOfResults();
  } catch (err) {
    console.error(err);
    toast('Something went wrong. Please, try again later.');
  } finally {
    hideLoader();
    refs.loadMoreBtn.disabled = false;
    isLoading = false;
  }
}

// --------- ui helpers ---------
function appendMarkup(hits) {
  const markup = hits.map(toCard).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function toCard({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) {
  return `
    <li class="gallery-item">
      <a class="gallery-link" href="${largeImageURL}" rel="noopener noreferrer">
        <img class="gallery-image" src="${webformatURL}" alt="${escapeHtml(tags || '')}" loading="lazy" />
        <p class="gallery-descr">
          likes: <span class="descr-span">${likes}</span>
          &nbsp; views: <span class="descr-span">${views}</span>
          &nbsp; comments: <span class="descr-span">${comments}</span>
          &nbsp; downloads: <span class="descr-span">${downloads}</span>
        </p>
      </a>
    </li>`;
}

function toast(message) {
  iziToast.error({
    message,
    position: 'topRight',
    maxWidth: 432,
    closeOnClick: true,
  });
}

function showLoader()  { refs.loader.style.display = 'flex'; }
function hideLoader()  { refs.loader.style.display = 'none'; }
function showLoadMore(){ refs.loadMoreBtn.classList.remove('is-hidden'); }
function hideLoadMore(){ refs.loadMoreBtn.classList.add('is-hidden'); }

function endOfResults() {
  hideLoadMore();
  iziToast.info({
    message: `We're sorry, but you've reached the end of search results.`,
    position: 'topRight',
  });
}

function smoothScrollByCard() {
  const firstCard = refs.gallery.querySelector('.gallery-item');
  if (!firstCard) return;
  const { height } = firstCard.getBoundingClientRect();
  window.scrollBy({ top: height * 2 + 24, behavior: 'smooth' });
}

// --------- tiny util ---------
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[s]));
}