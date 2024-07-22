import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { ThemeProvider } from '@mui/system';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { msalConfig } from './config/authConfig';
import { routeTree } from './routeTree.gen';
import fitzTheme from './themes/fitzTheme';


const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Register {
    router: typeof router;
  }
}

const msalInstance = new PublicClientApplication(msalConfig);

const rootElement = document.getElementById('app');

if (rootElement) {
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <MsalProvider instance={msalInstance}>
        <ThemeProvider theme={fitzTheme}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ThemeProvider>
      </MsalProvider>,
    );
  }
}
