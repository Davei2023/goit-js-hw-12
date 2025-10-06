// src/js/pixabay-api.js
import axios from 'axios';

export const PER_PAGE = 15;
const API_KEY = '42030436-f44bf17f2fc4b636ae2b8b7a9';
const BASE_URL = 'https://pixabay.com/api/';

export async function getImagesByQuery(query, page = 1) {
  const { data } = await axios.get(BASE_URL, {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: PER_PAGE,
      page,
    },
  });
  return data; // { total, totalHits, hits: [...] }
}