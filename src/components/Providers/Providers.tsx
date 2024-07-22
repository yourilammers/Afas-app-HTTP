import { PropsWithChildren, ReactElement } from 'react';
import DevToolsProvider from './DevToolsProvider';
import FitzThemeProvider from './FitzThemeProvider';
import UserTokenProvider from './UserTokenProvider';

const Providers = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <UserTokenProvider>
      <FitzThemeProvider>
        <DevToolsProvider>{children}</DevToolsProvider>
      </FitzThemeProvider>
    </UserTokenProvider>
  );
};

export default Providers;
