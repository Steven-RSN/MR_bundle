//const API_URL =`http://localhost:4000`
// const API_URL = 'http://localhost:3000'; // Backend
import axios from 'axios';
import { useUserStore } from '../stores/user';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function sendDechetToServer(dechet) {
  const token = useUserStore().token
  try {
    const response = await axios.post(`${API_URL}/dechets/registerDechet`, dechet, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;

  } catch (err) {
    console.error('Erreur API:', err);
    console.error('Erreur API:', err.status);
    throw err;
  }
}

export async function sendUserToServer(user) {
  try {
    const response = await axios.post(`${API_URL}/users/register`, user);
    return response.data;
  } catch (err) {
    console.error('Erreur API:', err);
    throw err;

  }
}

export async function login(user) {
  try {
    const response = await axios.post(`${API_URL}/users/login`, user)
    return response.data;
  } catch (err) {
    console.error('Erreur API:', err);
    throw err;
  }

}

export async function getAllDechets() {
  const response = await axios.get(`${API_URL}/`);
  return response.data
}

export async function getDechetAndUserByIdDechet(id) {
  const res = await axios.get(`${API_URL}/dechets/${id}`)
  return res.data
}

export async function getProfilUserById(id) {
  const res = await axios.get(`${API_URL}/users/profil/${id}`)
  return res.data
}

export async function getCleaningStatus(dechetId) {
  const res = await axios.get(`${API_URL}/dechets/${dechetId}/clean/status`);
  return res.data;
}

export async function startCleaning(dechetId) {
  const token = useUserStore().token;
  return axios.post(`${API_URL}/dechets/${dechetId}/clean`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function cancelCleaning(dechetId) {
  const token = useUserStore().token;
  return axios.delete(`${API_URL}/dechets/${dechetId}/clean`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}