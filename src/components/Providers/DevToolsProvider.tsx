import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactElement } from 'react';
import type { PropsWithChildren } from 'react';

const DevToolsProvider = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <>
      {children}

      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools />
    </>
  );
};

export default DevToolsProvider;
