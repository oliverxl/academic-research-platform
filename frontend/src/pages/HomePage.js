import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const HomePage = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                ResearchHub
              </Typography>
              <Typography variant="h5" paragraph>
                A decentralized platform for academic researchers to store, share, and access research papers and datasets.
              </Typography>
              <Typography variant="body1" paragraph>
                Powered by Walrus decentralized storage and Sui blockchain technology, ensuring data integrity and universal accessibility.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/papers"
                  startIcon={<DescriptionIcon />}
                >
                  Browse Papers
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/upload"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Research
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://source.unsplash.com/random/600x400/?research,science"
                alt="Research"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Discover the benefits of our decentralized academic research platform
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://source.unsplash.com/random/600x400/?secure,lock"
                alt="Secure Storage"
              />
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Secure Storage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Store your research papers and datasets securely using Walrus decentralized storage.
                  Your data is encrypted and distributed across multiple nodes, ensuring high availability and integrity.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://source.unsplash.com/random/600x400/?share,collaborate"
                alt="Easy Sharing"
              />
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Easy Sharing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share your research with specific individuals or make it publicly available.
                  Control access with fine-grained permissions and track who has accessed your research.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image="https://source.unsplash.com/random/600x400/?discover,search"
                alt="Discovery"
              />
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Discovery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find relevant research papers and datasets through advanced search capabilities.
                  Filter by keywords, authors, institutions, and more to discover the research you need.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            A simple process to store, share, and access academic research
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="div" gutterBottom>
                  1. Upload
                </Typography>
                <Typography variant="body1">
                  Upload your research papers or datasets to our platform.
                  Your data is stored securely on Walrus decentralized storage.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <StorageIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="div" gutterBottom>
                  2. Manage
                </Typography>
                <Typography variant="body1">
                  Set access permissions for your uploads.
                  Control who can view, comment on, or edit your research.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="div" gutterBottom>
                  3. Discover
                </Typography>
                <Typography variant="body1">
                  Search for and access research shared by other researchers.
                  Collaborate with others on shared projects.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Container maxWidth="md" sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Join our platform today and start sharing your research with the world.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/login"
          sx={{ mt: 2 }}
        >
          Sign Up Now
        </Button>
      </Container>
    </Box>
  );
};

export default HomePage;
