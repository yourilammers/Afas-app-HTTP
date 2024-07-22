import { AppBar, styled, Toolbar } from '@mui/material';
import { Link } from '@tanstack/react-router';
import { ReactElement } from 'react';
import SignInOutButton from '../Account/SignInOutButton';
import Fitz from '../Icons/Fitz';

const Header = (): ReactElement => {
  return (
    <StyledAppBar position="relative">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/">
          <Fitz height="32px" />
        </Link>
        <SignInOutButton />
      </Toolbar>
    </StyledAppBar>
  );
};

const StyledAppBar = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.common.sandstone};
`;

export default Header;
