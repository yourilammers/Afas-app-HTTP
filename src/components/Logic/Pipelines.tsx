import React, { useState, useEffect } from "react";
import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from "@azure/msal-browser";
import axios from "axios";
import { Container, Typography, Card, CardContent, CardActions, Button, Grid, Box } from '@mui/material';

// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: "99fbd4f5-fc2f-40c1-95fa-f8bcae8e8d94",
        authority: "https://login.microsoftonline.com/a3b7e820-e897-498d-a4bf-c723c6f52ab6",
        redirectUri: "http://localhost:3000"
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

const storageRequest = {
    scopes: ["api://99fbd4f5-fc2f-40c1-95fa-f8bcae8e8d94/acces_as_user"] // Replace <your-api-client-id> with your API's client ID
};

async function getAccessToken(account: AccountInfo) {
    try {
        const response = await msalInstance.acquireTokenSilent({
            ...storageRequest,
            account: account
        });
        return response.accessToken;
    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            // Use redirect method ins tead of popup
            msalInstance.acquireTokenRedirect({
                ...storageRequest,
                account: account
            });
        } else {
            throw error;
        }
    }
}

const PipelinesComponent: React.FC = () => {
    const [account, setAccount] = useState<AccountInfo | null>(null);
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            setAccount(accounts[0]);
        } else {
            msalInstance.loginRedirect().catch(error => {
                console.error(error);
            });
        }
    }, []);

    useEffect(() => {
        const fetchPipelines = async () => {
            if (account) {
                try {
                    const accessToken = await getAccessToken(account);
                    console.log("accesToken: " + accessToken)
                    if (!accessToken) {
                        console.error("No access token acquired.");
                        return;
                    }

                    const response = await axios.get("http://localhost:7071/api/GetPipelines", {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });

                    setPipelines(response.data);
                } catch (error) {
                    console.error("Error fetching pipelines:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPipelines();
    }, [account]);

    return (
        <Box sx={{ mt: 4, mx: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Pipelines
          </Typography>
          {loading ? (
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          ) : pipelines.length > 0 ? (
            <Grid container spacing={3}>
              {pipelines.map((pipeline, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {pipeline.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pipeline.description || "No description available"}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" variant="contained" color="primary" href={pipeline.link}>
                        Start Pipeline
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No pipelines found.
            </Typography>
          )}
        </Box>
      );
    };

export default PipelinesComponent;