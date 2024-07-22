import type { Dispatch, SetStateAction } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useUsername = (): [string, Dispatch<SetStateAction<string>>] => {
  return useLocalStorage('username');
};
