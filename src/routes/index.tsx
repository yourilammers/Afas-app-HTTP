import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { createFileRoute } from '@tanstack/react-router';
import { ReactElement } from 'react';
import SignIn from '../components/Account/SignIn';
import Pipelines from '../components/Logic/Pipelines'; // Import the Pipelines component
import { useAccessToken } from '../hooks/useAccessToken';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home(): ReactElement {
  const { accounts } = useMsal();
  const [accessToken] = useAccessToken();

  console.log('Merijn, kopieer dit: ', accounts);
  console.log('Merijn, kopieer dit: ', accessToken);

  return (
    <>
      <AuthenticatedTemplate>
      <>
          <p>Hello {accounts[0]?.username}, logged in!</p>
          <Pipelines />  {/* Add the Pipelines component */}
        </>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignIn />
      </UnauthenticatedTemplate>
    </>
  );
}
