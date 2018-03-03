import axios from 'axios';

export const apiCall = axios.create({
  baseURL: 'https://api.github.com',
  params: {
    access_token: 'e30c08eec08b5701b50c75b8bb8031d9cdaf7cee',
  },
});