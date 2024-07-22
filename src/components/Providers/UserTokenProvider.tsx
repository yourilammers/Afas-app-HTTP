import { BrowserAuthError, InteractionRequiredAuthError } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { PropsWithChildren, ReactElement, useEffect, useState } from 'react';
import { loginRequest } from '../../config/authConfig';
import { useAuthenticationHandler } from '../../hooks/useAuthenticationHandler';
import { useUsername } from '../../hooks/useUsername';

const UserTokenProvider = ({ children }: PropsWithChildren): ReactElement => {
  const { instance } = useMsal();
  const [username] = useUsername();
  const [refresh, setRefresh] = useState(true);
  const authenticationResultHandler = useAuthenticationHandler();

  const currentAccount = username
    ? instance.getAccountByUsername(username) ?? undefined
    : undefined;

  useEffect(() => {
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: currentAccount,
        forceRefresh: refresh,
      })
      .then((result) => {
        authenticationResultHandler(result);
        setRefresh(false);
      })
      .catch(async (error) => {
        if (error instanceof InteractionRequiredAuthError || error instanceof BrowserAuthError) {
          // fallback to interaction when silent call fails
          await instance
            .acquireTokenPopup({
              ...loginRequest,
              loginHint: currentAccount?.username,
            })
            .then((result) => {
              authenticationResultHandler(result);
              setRefresh(false);
            })
            .catch(() => {
              // silently fail
            });
        }
      });
  }, []);

  return <>{children}</>;
};

export default UserTokenProvider;
