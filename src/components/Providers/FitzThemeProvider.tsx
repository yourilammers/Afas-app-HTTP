import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';
import { PropsWithChildren, ReactElement } from 'react';
import fitzTheme from '../../themes/fitzTheme';

const FitzThemeProvider = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <ThemeProvider theme={fitzTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default FitzThemeProvider;
