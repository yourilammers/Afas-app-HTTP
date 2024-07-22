import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

export const useLocalStorage = (key: string): [string, Dispatch<SetStateAction<string>>] => {
  const [value, setValue] = useState<string>(localStorage.getItem(key) || '');

  useEffect(() => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }, [value]);

  return [value, setValue];
};
