### README: Azure Function and React Integration for Dynamic Forms
## Overview

This project demonstrates how to create a dynamic form system using Azure Functions, Azure Table Storage, and a React frontend. The Azure Function retrieves pipeline information along with form instructions from Azure Table Storage. The React frontend dynamically generates and displays these forms in a modal based on the instructions provided.
Prerequisites

    Azure account with an Azure Storage Account and Table Storage.
    Azure Function App set up in your Azure account.
    React development environment.

## Setup Instructions
# 1. Azure Table Storage

Add a new column named InputFieldInstructions to your Azure Table Storage. This column should contain JSON instructions for the input fields required by each pipeline.

Example of InputFieldInstructions JSON:

json
```
{
    "fields": [
        {
            "name": "username",
            "type": "text",
            "label": "Username",
            "required": true
        },
        {
            "name": "email",
            "type": "text",
            "label": "Email",
            "required": true
        },
        {
            "name": "password",
            "type": "text",
            "label": "Password",
            "required": true
        },
        {
            "name": "role",
            "type": "text",
            "label": "Role",
            "required": false
        }
    ]
}
```
# 2. Azure Function

Ensure your Azure Function is set up to query the table and include the InputFieldInstructions in the response. Below is a sample function code snippet:

python
```
import logging
import json
import azure.functions as func
from azure.identity import DefaultAzureCredential
from azure.data.tables import TableServiceClient
import jwt
from jwt.algorithms import RSAAlgorithm
import requests

## Environment variables or configurations
STORAGE_ACCOUNT_NAME = "your_storage_account_name"
TABLE_NAME = "your_table_name"
CLIENT_ID = "your_client_id"
TENANT_ID = "your_tenant_id"
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"

def get_email_from_token(token):
    try:
        jwks_url = f"{AUTHORITY}/discovery/v2.0/keys"
        jwks_response = requests.get(jwks_url)
        jwks = jwks_response.json()

        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }

        if rsa_key:
            payload = jwt.decode(token, key=RSAAlgorithm.from_jwk(json.dumps(rsa_key)), algorithms=["RS256"], audience=f"api://{CLIENT_ID}")
            email = payload.get("preferred_username") or payload.get("email") or payload.get("upn")
            return email
        else:
            raise ValueError("Unable to find appropriate key")
    except Exception as e:
        logging.error(f"Token validation error: {e}")
        return None

def get_company_from_email(email):
    try:
        company_name = email.split('@')[1].split('.')[0]
        return company_name
    except Exception as e:
        logging.error(f"Error extracting company name from email: {e}")
        return None

def query_pipelines(company_name):
    try:
        credential = DefaultAzureCredential()
        table_service = TableServiceClient(endpoint=f"https://{STORAGE_ACCOUNT_NAME}.table.core.windows.net", credential=credential)
        table_client = table_service.get_table_client(table_name=TABLE_NAME)

        query_filter = f"PartitionKey eq '{company_name}'"
        entities = table_client.query_entities(query_filter=query_filter)

        pipelines = []
        for entity in entities:
            pipelines.append({
                "name": entity.get("PipelineName"),
                "link": entity.get("PipelineLink"),
                "description": entity.get("PipelineDescription"),
                "inputFieldInstructions": json.loads(entity.get("InputFieldInstructions", "{}"))
            })

        return pipelines
    except Exception as e:
        logging.error(f"Error querying pipelines: {e}")
        return None

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        auth_header = req.headers.get('Authorization')
        if not auth_header:
            raise ValueError("Missing Authorization header")

        token = auth_header.split(' ')[1]

        email = get_email_from_token(token)
        if not email:
            raise ValueError("Invalid token or email extraction failed.")

        company_name = get_company_from_email(email)
        if not company_name:
            raise ValueError("Failed to extract company name from email.")

        pipelines = query_pipelines(company_name)
        if pipelines is None:
            raise ValueError("Failed to query pipelines.")

        return func.HttpResponse(
            body=json.dumps(pipelines),
            mimetype="application/json",
            status_code=200
        )
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            body=f"An error occurred: {str(e)}",
            status_code=500
        )
```
## 3. React Frontend

Ensure your React project is set up to dynamically render forms based on the instructions from the Azure Function. Below is an example of how to set this up.

    Install Material-UI Components

    bash

    npm install @mui/material @emotion/react @emotion/styled

    React Component

    Here's the complete code for the React component that handles authentication, retrieves pipeline data, and displays dynamic forms in a modal:

# javascript

```
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
                        label={field.label}
                        type="number"
                        name={field.name}
                        inputProps={{ min: field.min, max: field.max }}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(e, field)}
                        fullWidth
                        margin="normal"
                        required={field.required}
                    />
                );
            case 'text':
                return (
                    <TextField
                        key={field.name}
                        label={field.label}
                        type="text"
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(e, field)}
                        fullWidth
                        margin="normal"
                        required={field.required}
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
```

# How It Works

    Azure Function: The Azure Function queries the Azure Table Storage and includes the InputFieldInstructions column in the response.
    React Frontend:
        The React component uses MSAL to authenticate and obtain an access token.
        The component fetches pipeline data from the Azure Function, which includes the form instructions.
        When the "Start Pipeline" button is clicked, it checks if there are form instructions.
            If form instructions exist, a modal dialog with the form is displayed.
            If no form instructions exist, the user is redirected to the pipeline link directly.
    Dynamic Form Rendering: The form fields are rendered dynamically inside a modal dialog based on the JSON instructions provided.




# React single-page application built with MSAL React and Microsoft identity platform

This sample demonstrates how to use [MSAL React](https://www.npmjs.com/package/@azure/msal-react) to login, logout, conditionally render components to authenticated users, and acquire an access token for a protected resource such as Microsoft Graph.

## Features

This sample demonstrates the following MSAL React concepts:

* Configuration
* Login
* Logout
* Conditionally rendering components for authenticated or unauthenticated users
* Acquiring an access token and calling Microsoft Graph

## Contents

| File/folder       | Description                                |
|-------------------|--------------------------------------------|
| `src`             | Contains sample source files               |
| `styles`          | Contains styling for the sample            |
| `components`      | Contains ui components such as sign-in button, sign-out button and navbar |
| `public`          | Contains static content such as images and the base html   |
| `authConfig.js`   | Contains configuration parameters for the sample.      |
| `App.jsx`         | Contains MSAL React Components and main sample content |
| `graph.js`       | Provides a helper function for calling MS Graph API.   |                      |
| `index.js`        | Contains the root component and MsalProvider |
| `.gitignore`      | Define what to ignore at commit time.      |
| `CHANGELOG.md`    | List of changes to the sample.             |
| `CONTRIBUTING.md` | Guidelines for contributing to the sample. |
| `package.json`    | Package manifest for npm.                  |
| `README.md`       | This README file.                          |
| `LICENSE`         | The license for the sample.                |

**Note:** This sample was bootstrapped using [Create React App](https://github.com/facebook/create-react-app).

## Getting Started

### Prerequisites

[Node.js](https://nodejs.org/en/) must be installed to run this sample.

### Setup

1. [Register a new application](https://docs.microsoft.com/azure/active-directory/develop/scenario-spa-app-registration) in the [Azure Portal](https://portal.azure.com). Ensure that the application is enabled for the [authorization code flow with PKCE](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow). This will require that you redirect URI configured in the portal is of type `SPA`.
1. Clone this repository `git clone https://github.com/Azure-Samples/ms-identity-javascript-react-spa.git`
1. Open the [/src/authConfig.js](src/config/authConfig.ts) file and provide the required configuration values.
1. On the command line, navigate to the root of the repository, and run `npm install` to install the project dependencies via npm.

## Running the sample

1. Configure authentication and authorization parameters:
   1. Open `src/authConfig.js`
   2. Replace the string `"Enter_the_Application_Id_Here"` with your app/client ID on AAD Portal.
   3. Replace the string `"Enter_the_Cloud_Instance_Id_HereEnter_the_Tenant_Info_Here"` with `"https://login.microsoftonline.com/common/"` (*note*: This is for multi-tenant applications located on the global Azure cloud. For more information, see the [documentation](https://docs.microsoft.com/azure/active-directory/develop/quickstart-v2-javascript-auth-code)).
   4. Replace the string `"Enter_the_Redirect_Uri_Here"` with the redirect uri you setup on AAD Portal.
2. Configure the parameters for calling MS Graph API:
   2. Replace the string `"Enter_the_Graph_Endpoint_Herev1.0/me"` with `"https://graph.microsoft.com/v1.0/me"` (*note*: This is for MS Graph instance located on the global Azure cloud. For more information, see the [documentation](https://docs.microsoft.com/en-us/graph/deployments))
3. To start the sample application, run `npm start`.
4. Finally, open a browser and navigate to [http://localhost:3000](http://localhost:3000).

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
