import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ConnectButton } from '@mysten/dapp-kit';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to ResearchHub
        </Typography>

        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Connect your Sui wallet to access the platform and start sharing your research.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%', my: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ width: '100%', mt: 3, mb: 3 }}>
            <ConnectButton />
          </Box>
        )}

        <Divider sx={{ width: '100%', mb: 3 }} />

        <Typography variant="h6" gutterBottom>
          Why Connect a Wallet?
        </Typography>

        <Typography variant="body2" align="center" color="text.secondary" paragraph>
          ResearchHub uses blockchain technology to ensure the integrity and ownership of your research.
          By connecting your Sui wallet, you can:
        </Typography>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Securely upload and manage your research papers and datasets
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Control access to your research with fine-grained permissions
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Verify the authenticity and provenance of other researchers' work
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • Receive recognition and citations for your contributions
          </Typography>
        </Box>

        <Box sx={{ mt: 4, width: '100%' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>

      <Typography variant="body2" align="center" color="text.secondary">
        Don't have a Sui wallet yet?{' '}
        <a
          href="https://docs.sui.io/build/wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn how to set one up
        </a>
      </Typography>
    </Container>
  );
};

export default LoginPage;
