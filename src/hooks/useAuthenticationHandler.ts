import type { AuthenticationResult } from '@azure/msal-browser';
import { useAccessToken } from './useAccessToken';
import { useUsername } from './useUsername';

export interface AuthenticationResultHandler {
  (result: AuthenticationResult): void;
}

export const useAuthenticationHandler = (): AuthenticationResultHandler => {
  const [, setUsername] = useUsername();
  const [, setAccessToken] = useAccessToken();

  return (result: AuthenticationResult) => {
    const newUsername = result.account?.username;

    if (newUsername) {
      setUsername(newUsername);
    }

    setAccessToken(result.accessToken);
  };
};
