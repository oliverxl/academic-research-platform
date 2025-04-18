import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              ResearchHub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A decentralized platform for academic researchers to store, share, and access research papers and datasets.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="/papers" color="inherit" display="block">
              Papers
            </Link>
            <Link href="/datasets" color="inherit" display="block">
              Datasets
            </Link>
            <Link href="/upload" color="inherit" display="block">
              Upload
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              About
            </Typography>
            <Link href="#" color="inherit" display="block">
              About Us
            </Link>
            <Link href="#" color="inherit" display="block">
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" display="block">
              Terms of Service
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' ResearchHub. All rights reserved. '}
          <br />
          {'Powered by '}
          <Link color="inherit" href="https://sui.io/">
            Sui
          </Link>
          {' and '}
          <Link color="inherit" href="https://www.walrus.xyz/">
            Walrus
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
