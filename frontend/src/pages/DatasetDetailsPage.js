import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ArrowBack as ArrowBackIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getDatasetById } from '../services/suiService';
import { getFileUrl, getFileMetadata } from '../services/walrusService';
import CommentSection from '../components/CommentSection';

const DatasetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [dataset, setDataset] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  
  // Load dataset details
  useEffect(() => {
    const loadDataset = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const datasetData = await getDatasetById(id);
        setDataset(datasetData);
        
        // Try to get file metadata
        try {
          const metadataResult = await getFileMetadata(datasetData.fileHash);
          setMetadata(metadataResult);
        } catch (metadataErr) {
          console.error('Error loading file metadata:', metadataErr);
        }
        
        // Check if the dataset is bookmarked
        const bookmarks = JSON.parse(localStorage.getItem('datasetBookmarks') || '[]');
        setBookmarked(bookmarks.includes(id));
      } catch (err) {
        setError('Error loading dataset details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDataset();
  }, [id]);
  
  const handleDownload = () => {
    if (!dataset) return;
    
    const fileUrl = getFileUrl(dataset.fileHash);
    window.open(fileUrl, '_blank');
  };
  
  const handleShare = () => {
    if (!dataset) return;
    
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };
  
  const handleToggleBookmark = () => {
    if (!dataset) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('datasetBookmarks') || '[]');
    
    if (bookmarked) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarks.filter(bookmarkId => bookmarkId !== id);
      localStorage.setItem('datasetBookmarks', JSON.stringify(updatedBookmarks));
      setBookmarked(false);
    } else {
      // Add to bookmarks
      bookmarks.push(id);
      localStorage.setItem('datasetBookmarks', JSON.stringify(bookmarks));
      setBookmarked(true);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !dataset) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Dataset not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/datasets')}
        >
          Back to Datasets
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/datasets')}
        sx={{ mb: 3 }}
      >
        Back to Datasets
      </Button>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {dataset.title}
              </Typography>
              
              <Box>
                <Tooltip title="Download">
                  <IconButton onClick={handleDownload}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Share">
                  <IconButton onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={bookmarked ? "Remove Bookmark" : "Bookmark"}>
                  <IconButton onClick={handleToggleBookmark}>
                    {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              By {dataset.authors.join(', ')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {dataset.keywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            
            <Typography variant="body1" paragraph>
              {dataset.description}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Dataset Details
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ width: '30%', fontWeight: 'bold' }}>
                      File Size
                    </TableCell>
                    <TableCell>{formatFileSize(dataset.fileSize)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      File Type
                    </TableCell>
                    <TableCell>{metadata?.mimeType || 'Unknown'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Uploaded On
                    </TableCell>
                    <TableCell>{new Date(dataset.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Visibility
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dataset.isPublic ? 'Public' : 'Private'}
                        color={dataset.isPublic ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Storage
                    </TableCell>
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Walrus Decentralized Storage
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download Dataset
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Comments Section */}
      <CommentSection resourceId={id} resourceType={2} />
    </Container>
  );
};

export default DatasetDetailsPage;
