import axios from "axios";

const API_URL = "http://localhost:5001"; 

export const getExampleData = async () => {
  const response = await axios.get(`${API_URL}/your-endpoint`);
  return response.data;
};
