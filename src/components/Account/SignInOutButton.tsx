import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Button } from '@mui/material';
import { ReactElement } from 'react';
import { loginRequest } from '../../config/authConfig';
import { useAccessToken } from '../../hooks/useAccessToken';
import { useAuthenticationHandler } from '../../hooks/useAuthenticationHandler';

const SignInOutButton = (): ReactElement => {
  const { instance } = useMsal();
  const authenticationResultHandler = useAuthenticationHandler();
  const [, setAccessToken] = useAccessToken();

  const handleLogin = (): void => {
    instance.loginPopup(loginRequest).then(authenticationResultHandler);
  };

  const handleLogout = (): void => {
    instance
      .logoutPopup({
        postLogoutRedirectUri: '/',
        mainWindowRedirectUri: '/',
      })
      .then(() => {
        setAccessToken('');
      });
  };

  return (
    <>
      <UnauthenticatedTemplate>
        <Button color="secondary" variant="contained" onClick={handleLogin}>
          Sign in
        </Button>
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <Button color="secondary" variant="contained" onClick={handleLogout}>
          Sign out
        </Button>
      </AuthenticatedTemplate>
    </>
  );
};

export default SignInOutButton;
