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
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  FormatQuote as FormatQuoteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import { useAuth } from '../context/AuthContext';
import { getPaperById } from '../services/suiService';
import { getFileUrl } from '../services/walrusService';
import CitationManager from '../components/CitationManager';
import CommentSection from '../components/CommentSection';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PaperDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  
  // Load paper details
  useEffect(() => {
    const loadPaper = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const paperData = await getPaperById(id);
        setPaper(paperData);
        
        // Check if the paper is bookmarked
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setBookmarked(bookmarks.includes(id));
      } catch (err) {
        setError('Error loading paper details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPaper();
  }, [id]);
  
  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
  };
  
  const handleDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Error loading PDF. Please try again later.');
  };
  
  const handlePreviousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };
  
  const handleNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };
  
  const handleDownload = () => {
    if (!paper) return;
    
    const fileUrl = getFileUrl(paper.fileHash);
    window.open(fileUrl, '_blank');
  };
  
  const handleShare = () => {
    if (!paper) return;
    
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };
  
  const handleToggleBookmark = () => {
    if (!paper) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    if (bookmarked) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarks.filter(bookmarkId => bookmarkId !== id);
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      setBookmarked(false);
    } else {
      // Add to bookmarks
      bookmarks.push(id);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setBookmarked(true);
    }
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
  
  if (error || !paper) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Paper not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/papers')}
        >
          Back to Papers
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/papers')}
        sx={{ mb: 3 }}
      >
        Back to Papers
      </Button>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {paper.title}
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
              By {paper.authors.join(', ')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {paper.keywords.map((keyword, index) => (
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
              Abstract
            </Typography>
            
            <Typography variant="body1" paragraph>
              {paper.abstract}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Paper Preview
            </Typography>
            
            {pdfError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {pdfError}
              </Alert>
            ) : (
              <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, mb: 2 }}>
                <Document
                  file={getFileUrl(paper.fileHash)}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                  loading={<CircularProgress />}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={600}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                
                {numPages && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    <Button
                      disabled={pageNumber <= 1}
                      onClick={handlePreviousPage}
                    >
                      Previous
                    </Button>
                    <Typography variant="body2" sx={{ mx: 2 }}>
                      Page {pageNumber} of {numPages}
                    </Typography>
                    <Button
                      disabled={pageNumber >= numPages}
                      onClick={handleNextPage}
                    >
                      Next
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Download Full Paper
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Citation Manager */}
      <CitationManager paperId={id} paperTitle={paper.title} />
      
      {/* Comments Section */}
      <CommentSection resourceId={id} resourceType={1} />
    </Container>
  );
};

export default PaperDetailsPage;
