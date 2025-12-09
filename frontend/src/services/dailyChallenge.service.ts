import axios from 'axios';
import { DailyChallenge, CreateDailyChallengeRequest } from '../types/dailyChallenge';
import { extractErrorMessage } from '../utils/error.utils';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${baseURL}/api/daily-challenges`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dailyChallengeService = {

  async getTodayChallenge(): Promise<DailyChallenge> {
    try {
      const response = await api.get<DailyChallenge>('/today');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch today\'s challenge'));
    }
  },

  async getDailyChallengeByDate(date: string): Promise<DailyChallenge> {
    try {
      const response = await api.get<DailyChallenge>(`/date/${date}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch daily challenge'));
    }
  },

  async getDailyChallengeById(challengeId: string): Promise<DailyChallenge> {
    try {
      const response = await api.get<DailyChallenge>(`/${challengeId}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch daily challenge'));
    }
  },

  async getAllDailyChallenges(): Promise<DailyChallenge[]> {
    try {
      const response = await api.get<DailyChallenge[]>('');
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch daily challenges'));
    }
  },

  async createDailyChallenge(request: CreateDailyChallengeRequest): Promise<DailyChallenge> {
    try {
      const response = await api.post<DailyChallenge>('', request);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create daily challenge'));
    }
  },

  async deleteDailyChallenge(challengeId: string): Promise<void> {
    try {
      await api.delete(`/${challengeId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete daily challenge'));
    }
  },
};

