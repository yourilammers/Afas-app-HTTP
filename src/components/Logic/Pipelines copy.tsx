import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

const Pipelines: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (accounts.length > 0) {
      setEmail(accounts[0].username);
    }

    const fetchPipelines = async () => {
      try {
        // Mock token for local development
        const mockToken = 'mocked_access_token';
        
        const apiResponse = await fetch('http://localhost:7071/api/GetPipelines', {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'x-ms-client-principal-name': accounts[0]?.username || ''
          }
        });
        const data = await apiResponse.json();
        setPipelines(data);
      } catch (error) {
        console.error('Error fetching pipelines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelines();
  }, [instance, accounts]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Available Pipelines</h1>
      <p>User email: {email}</p>
      <ul>
        {pipelines.map(pipeline => (
          <li key={pipeline.id}>{pipeline.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Pipelines;
