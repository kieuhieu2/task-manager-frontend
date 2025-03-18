import axios from 'axios';

const API_URL = 'http://localhost:8080/users';

export const createUser = async (userData: {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dob: string;
}) => {
  try {
    const response = await axios.post(API_URL, userData);
    if (response.data.code === 1000) {
      return response.data.result;
    } else {
      throw new Error('Lỗi API');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
    throw error;
  }
};
