import { styled, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ReactElement } from 'react';
import Fitz from '../Icons/Fitz';

const Footer = (): ReactElement => {
  return (
    <Box
      component="footer"
      bgcolor={(theme) => theme.palette.common.midnight}
      color={(theme) => theme.palette.primary.contrastText}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <StyledLogo height="32px" />
        </Box>
        <Box>
          <Typography component="small" variant="caption">
            &copy; 2024 Fitz. All rights reserved
          </Typography>
        </Box>
      </Toolbar>
    </Box>
  );
};

const StyledLogo = styled(Fitz)`
  fill: ${({ theme }) => theme.palette.primary.contrastText};
`;

export default Footer;
