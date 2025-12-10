// src/js/pixabay-api.js
import axios from 'axios';

export const PER_PAGE = 15;

const API_KEY = '52640263-ce01b15f2958a6288c5805755';

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

export async function getImagesByQuery(query, page = 1) {
  const { data } = await api.get('', {
    params: { q: query, page },
  });
  return data; // { total, totalHits, hits }
}