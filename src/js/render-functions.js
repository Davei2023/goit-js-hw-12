// src/js/render-functions.js
import SimpleLightbox from 'simplelightbox';

const galleryEl = document.querySelector('.gallery');
const loaderEl = document.querySelector('.loader-container');
const loadMoreBtn = document.querySelector('.load-btn');

const lightbox = new SimpleLightbox('.gallery-item a', {
  captionsData: 'alt',
  captionDelay: 250,
});

export function createGallery(images) {
  const markup = images.map(({
    webformatURL, largeImageURL, tags, likes, views, comments, downloads,
  }) => `
    <li class="gallery-item">
      <a class="gallery-link" href="${largeImageURL}">
        <img class="gallery-image" src="${webformatURL}" alt="${escapeHtml(tags || '')}" loading="lazy" />
        <p class="gallery-descr">
          Likes: <span class="descr-span">${likes}</span>
          &nbsp; Views: <span class="descr-span">${views}</span>
          &nbsp; Comments: <span class="descr-span">${comments}</span>
          &nbsp; Downloads: <span class="descr-span">${downloads}</span>
        </p>
      </a>
    </li>`).join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

export function clearGallery() { galleryEl.innerHTML = ''; }
export function showLoader() { loaderEl.style.display = 'flex'; }
export function hideLoader() { loaderEl.style.display = 'none'; }
export function showLoadMoreButton() { loadMoreBtn.classList.remove('is-hidden'); }
export function hideLoadMoreButton() { loadMoreBtn.classList.add('is-hidden'); }

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}
