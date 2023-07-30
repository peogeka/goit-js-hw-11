import { fetchImages } from './api.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'intersection-observer'; 

let lightBox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionsDelay: 250,
});

const state = {
  currentPage: 1,
  isLoading: false,
};

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');


searchForm.addEventListener('submit', onSubmitForm);


async function onSubmitForm(event) {
  event.preventDefault();
 try {
  const searchQuery = getSearchQueryFromForm();
  
  state.currentPage = 1;

  const images = await fetchImages(searchQuery, state.currentPage);
  displayGallery(images);
  state.currentPage++;
  addIntersectionObserver(); 

  if (images.length === 0) {
    showNoResultsMessage();
  }
} catch (error) {
  console.error('Something went wrong:', error);
}
}


function addIntersectionObserver() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  };

  const observer = new IntersectionObserver(onIntersection, options);
  const sentinel = document.createElement('div');
  sentinel.classList.add('sentinel');
  galleryContainer.appendChild(sentinel);
  observer.observe(sentinel);
}


async function onIntersection(entries, observer) {
  try {
  if (state.isLoading || entries[0].intersectionRatio <= 0) return;

  state.isLoading = true;
  const searchQuery = getSearchQueryFromForm();
  const images = await fetchImages(searchQuery, state.currentPage);

  if (images.length > 0) {
    appendGalleryMarkup(images);
    state.currentPage++;
  } else {
    observer.disconnect(); 
    showEndOfResultsMessage();
  }
} catch (error) {
  console.error('Something went wrong:', error);
  
}

  state.isLoading = false;
}


function displayGallery(images) {
  const galleryMarkup = createGalleryMarkup(images);
  replaceGalleryMarkup(galleryMarkup);

 
  const lightboxOptions = {
  
  };

 
  lightBox.refresh();
}


function replaceGalleryMarkup(galleryMarkup) {
  galleryContainer.innerHTML = galleryMarkup;
}


function appendGalleryMarkup(images) {
  const galleryMarkup = createGalleryMarkup(images);
  galleryContainer.insertAdjacentHTML('beforeend', galleryMarkup);

  const newImageLinks = galleryContainer.querySelectorAll(
    '.photo-card:not(.sl-initialized)'
  );
  newImageLinks.forEach(link => {
    link.classList.add('sl-initialized'); 
  });

  
   lightBox.refresh();
}


function createGalleryMarkup(images) {
  return images
    .map(
      image => `
    <a href="${image.webformatURL}" class="photo-card"> 
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </a>
  `
    )
    .join('');
}


function getSearchQueryFromForm() {
  const formData = new FormData(searchForm);
  return formData.get('searchQuery');
}


function showMessage(messageText) {
  Notiflix.Notify.failure(messageText);
}


const noResultsMessage = "Sorry, there are no images matching your search query. Please try again.";
const endOfResultsMessage = "We're sorry, but you've reached the end of search results.";


showMessage(noResultsMessage);
showMessage(endOfResultsMessage);