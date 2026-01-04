import axiosInstance from './axios.config';
import { DailyChallenge, CreateDailyChallengeRequest } from '../types/dailyChallenge';
import { extractErrorMessage } from '../utils/error.utils';

const API_BASE = '/api/daily-challenges';

export const dailyChallengeService = {

  async getTodayChallenge(): Promise<DailyChallenge> {
    try {
      const response = await axiosInstance.get<DailyChallenge>(`${API_BASE}/today`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch today\'s challenge'));
    }
  },

  async getDailyChallengeByDate(date: string): Promise<DailyChallenge> {
    try {
      const response = await axiosInstance.get<DailyChallenge>(`${API_BASE}/date/${date}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch daily challenge'));
    }
  },

  async getDailyChallengeById(challengeId: string): Promise<DailyChallenge> {
    try {
      const response = await axiosInstance.get<DailyChallenge>(`${API_BASE}/${challengeId}`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch daily challenge'));
    }
  },

  async getAllDailyChallenges(): Promise<DailyChallenge[]> {
    try {
      const response = await axiosInstance.get<DailyChallenge[]>(API_BASE);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch daily challenges'));
    }
  },

  async createDailyChallenge(request: CreateDailyChallengeRequest): Promise<DailyChallenge> {
    try {
      const response = await axiosInstance.post<DailyChallenge>(API_BASE, request);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create daily challenge'));
    }
  },

  async deleteDailyChallenge(challengeId: string): Promise<void> {
    try {
      await axiosInstance.delete(`${API_BASE}/${challengeId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete daily challenge'));
    }
  },
};

