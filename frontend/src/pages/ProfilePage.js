import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    bio: '',
    researchInterests: '',
    orcidId: '',
  });

  useEffect(() => {
    if (user) {
      // Populate form with user data
      setFormData({
        name: user.name || '',
        email: user.email || '',
        institution: user.institution || '',
        bio: user.bio || '',
        researchInterests: user.researchInterests || '',
        orcidId: user.orcidId || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real app, this would call an API to update the profile
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update user profile in context
      updateUserProfile(formData);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mb: 2 }}
              alt={formData.name}
              src="/static/images/avatar/1.jpg"
            />
            
            <Typography variant="h6" gutterBottom>
              {formData.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formData.email}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {formData.institution}
            </Typography>
            
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              fullWidth
            >
              Change Avatar
            </Button>
            
            <Divider sx={{ width: '100%', my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom align="left" sx={{ width: '100%' }}>
              Wallet Information
            </Typography>
            
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Connected Wallet:
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {user?.walletAddress || '0x...'}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
            >
              Disconnect Wallet
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Edit Profile
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Research Interests"
                    name="researchInterests"
                    value={formData.researchInterests}
                    onChange={handleChange}
                    helperText="Separate interests with commas"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ORCID ID"
                    name="orcidId"
                    value={formData.orcidId}
                    onChange={handleChange}
                    helperText="e.g., 0000-0002-1825-0097"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    sx={{ mt: 2 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
