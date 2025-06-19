import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import axiosInstance from './axiosInstance.js';
// Create mock adapter for your axios instance
const mock = new AxiosMockAdapter(axiosInstance, {
  delayResponse: 300,
  onNoMatch: 'passthrough'
});

// Define your mock responses here
mock.onGet('/users/my-avatar').reply(200, {
  result: {
    avatar: '/avatar.png',
  },
});

export default mock;