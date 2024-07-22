import { useMsal } from '@azure/msal-react';
import { Button, Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { ReactElement } from 'react';
import { loginRequest } from '../../config/authConfig';

const SignIn = (): ReactElement => {
  const { instance } = useMsal();

  const handleLogin = (): void => {
    void instance.loginPopup(loginRequest);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100%"
    >
      <Paper
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: 4 }}
      >
        <Typography variant="h4" component="h1">
          Sign in
        </Typography>
        <Typography variant="body1" component="p">
          Please sign in to your account to view your pipelines.
        </Typography>
        <Button size="large" variant="contained" onClick={() => handleLogin()}>
          Sign in
        </Button>
      </Paper>
    </Box>
  );
};

export default SignIn;
