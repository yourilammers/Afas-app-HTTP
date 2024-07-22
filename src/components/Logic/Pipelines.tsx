import React, { useState, useEffect } from "react";
import { PublicClientApplication, AccountInfo, InteractionRequiredAuthError } from "@azure/msal-browser";
import axios from "axios";
import { Container, Typography, Card, CardContent, CardActions, Button, Grid, Box, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

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
    scopes: ["api://99fbd4f5-fc2f-40c1-95fa-f8bcae8e8d94/acces_as_user"]
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
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [open, setOpen] = useState<boolean>(false);
    const [currentPipeline, setCurrentPipeline] = useState<any>(null);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: any) => {
        setFormData({
            ...formData,
            [field.name]: e.target.value
        });
    };

    const renderField = (field: any) => {
        switch (field.type) {
            case 'int':
                return (
                    <TextField
                        key={field.name}
                        label={field.name}
                        type="number"
                        name={field.name}
                        inputProps={{ min: field.min, max: field.max }}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(e, field)}
                        fullWidth
                        margin="normal"
                    />
                );
            case 'text':
                return (
                    <TextField
                        key={field.name}
                        label={field.name}
                        type="text"
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(e, field)}
                        fullWidth
                        margin="normal"
                    />
                );
            default:
                return null;
        }
    };

    const handleOpen = (pipeline: any) => {
        setCurrentPipeline(pipeline);
        if (pipeline.inputFieldInstructions?.fields) {
            setOpen(true);
        } else {
            window.location.href = pipeline.link;
        }
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({});
    };

    const handleSubmit = () => {
        // Add your form submission logic here
        console.log('Form Data:', formData);
        handleClose();
        window.location.href = currentPipeline.link;
    };

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
                                    <Button size="small" variant="contained" color="primary" onClick={() => handleOpen(pipeline)}>
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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Start Pipeline</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please fill out the following form to start the pipeline.
                    </DialogContentText>
                    {currentPipeline && currentPipeline.inputFieldInstructions?.fields?.map((field: any) => renderField(field))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Start
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PipelinesComponent;
