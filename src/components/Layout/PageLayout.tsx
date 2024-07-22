import { Box } from '@mui/system';
import { PropsWithChildren, ReactElement } from 'react';
import Footer from './Footer';
import Header from './Header';

const PageLayout = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <Box component="div" minHeight="100vh">
      <Header />
      <Box
        p={4}
        display="flex"
        flexDirection="column"
        component="main"
        height="1px"
        minHeight="calc(100vh - 64px)"
        bgcolor={(theme) => theme.palette.background.default}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
