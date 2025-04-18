import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPapers, setUserPapers] = useState([]);
  const [userDatasets, setUserDatasets] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock data - in a real app, this would come from your API
      setUserPapers([
        { id: 1, title: 'Advances in Quantum Computing', date: '2023-04-15' },
        { id: 2, title: 'Neural Networks for Climate Prediction', date: '2023-03-22' },
      ]);
      
      setUserDatasets([
        { id: 1, title: 'Climate Data 2010-2022', date: '2023-04-10' },
        { id: 2, title: 'Quantum Computing Benchmark Results', date: '2023-02-18' },
      ]);
      
      setRecentActivity([
        { id: 1, type: 'comment', content: 'Alice commented on your paper "Advances in Quantum Computing"', date: '2023-04-18' },
        { id: 2, type: 'citation', content: 'Your paper was cited in "Quantum Algorithms Review"', date: '2023-04-16' },
        { id: 3, type: 'download', content: 'Your dataset "Climate Data" was downloaded 5 times', date: '2023-04-14' },
      ]);
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
        Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome back, {user?.name || 'Researcher'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your research papers, datasets, and track your impact in the academic community.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Your Papers */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary">
                Your Papers
              </Typography>
              <Button component={RouterLink} to="/papers" size="small">
                View All
              </Button>
            </Box>
            
            <Divider />
            
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {userPapers.length > 0 ? (
                userPapers.map((paper) => (
                  <ListItem
                    button
                    component={RouterLink}
                    to={`/papers/${paper.id}`}
                    key={paper.id}
                  >
                    <ListItemText
                      primary={paper.title}
                      secondary={`Published: ${new Date(paper.date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No papers yet" />
                </ListItem>
              )}
            </List>
            
            <Divider />
            
            <Box sx={{ mt: 2 }}>
              <Button
                component={RouterLink}
                to="/upload"
                variant="contained"
                color="primary"
                fullWidth
              >
                Upload New Paper
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Your Datasets */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary">
                Your Datasets
              </Typography>
              <Button component={RouterLink} to="/datasets" size="small">
                View All
              </Button>
            </Box>
            
            <Divider />
            
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {userDatasets.length > 0 ? (
                userDatasets.map((dataset) => (
                  <ListItem
                    button
                    component={RouterLink}
                    to={`/datasets/${dataset.id}`}
                    key={dataset.id}
                  >
                    <ListItemText
                      primary={dataset.title}
                      secondary={`Published: ${new Date(dataset.date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No datasets yet" />
                </ListItem>
              )}
            </List>
            
            <Divider />
            
            <Box sx={{ mt: 2 }}>
              <Button
                component={RouterLink}
                to="/upload"
                variant="contained"
                color="primary"
                fullWidth
              >
                Upload New Dataset
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Activity
            </Typography>
            
            <Divider />
            
            <List>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemText
                        primary={activity.content}
                        secondary={`${new Date(activity.date).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent activity" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
