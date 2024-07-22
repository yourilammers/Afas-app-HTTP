import type { Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useAccessToken = (): [string, Dispatch<SetStateAction<string>>] => {
  return useLocalStorage('accessToken');
};
