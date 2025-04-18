import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  FormatQuote as FormatQuoteIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { addCitation, removeCitation, getCitations } from '../services/suiService';

const CitationManager = ({ paperId, paperTitle }) => {
  const { isAuthenticated, user } = useAuth();
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState('');
  const [citationText, setCitationText] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [availablePapers, setAvailablePapers] = useState([]);

  // Load citations
  useEffect(() => {
    const loadCitations = async () => {
      if (!paperId) return;

      setLoading(true);
      try {
        const result = await getCitations(paperId);
        setCitations(result);
      } catch (err) {
        setError('Error loading citations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCitations();
  }, [paperId]);

  // Load available papers for citation
  useEffect(() => {
    const loadAvailablePapers = async () => {
      if (!isAuthenticated) return;

      try {
        // In a real implementation, this would fetch papers from the blockchain
        // For now, we'll use mock data
        setAvailablePapers([
          { id: '0x123', title: 'Advances in Quantum Computing' },
          { id: '0x456', title: 'Machine Learning Applications in Climate Science' },
          { id: '0x789', title: 'Blockchain for Academic Research' },
        ]);
      } catch (err) {
        console.error('Error loading available papers:', err);
      }
    };

    loadAvailablePapers();
  }, [isAuthenticated]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPaper('');
    setCitationText('');
    setPageNumber('');
  };

  const handleAddCitation = async () => {
    if (!selectedPaper || !citationText) {
      setError('Please select a paper and enter citation text');
      return;
    }

    setLoading(true);
    try {
      await addCitation(paperId, selectedPaper, citationText, pageNumber ? parseInt(pageNumber) : null);

      // Add the new citation to the list
      const selectedPaperObj = availablePapers.find(p => p.id === selectedPaper);
      setCitations([
        ...citations,
        {
          id: `temp-${Date.now()}`, // This will be replaced with the actual ID from the blockchain
          citedPaperId: selectedPaper,
          citedPaperTitle: selectedPaperObj?.title || 'Unknown Paper',
          citationText,
          pageNumber: pageNumber ? parseInt(pageNumber) : null,
          createdAt: Date.now(),
        },
      ]);

      handleCloseDialog();
    } catch (err) {
      setError('Error adding citation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCitation = async (citationId) => {
    setLoading(true);
    try {
      await removeCitation(citationId);

      // Remove the citation from the list
      setCitations(citations.filter(c => c.id !== citationId));
    } catch (err) {
      setError('Error removing citation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Citations
        </Typography>
        <Alert severity="info">
          Please log in to manage citations
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Citations
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          disabled={loading}
        >
          Add Citation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {citations.length > 0 ? (
        <List>
          {citations.map((citation) => (
            <React.Fragment key={citation.id}>
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveCitation(citation.id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormatQuoteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle1">
                        {citation.citedPaperTitle}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        "{citation.citationText}"
                      </Typography>
                      {citation.pageNumber && (
                        <Chip
                          label={`Page ${citation.pageNumber}`}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No citations added yet
        </Typography>
      )}

      {/* Add Citation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Citation</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="paper-select-label">Paper</InputLabel>
              <Select
                labelId="paper-select-label"
                value={selectedPaper}
                label="Paper"
                onChange={(e) => setSelectedPaper(e.target.value)}
              >
                {availablePapers.map((paper) => (
                  <MenuItem key={paper.id} value={paper.id}>
                    {paper.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Citation Text"
              multiline
              rows={4}
              value={citationText}
              onChange={(e) => setCitationText(e.target.value)}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Page Number (Optional)"
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddCitation}
            variant="contained"
            disabled={loading || !selectedPaper || !citationText}
          >
            Add Citation
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CitationManager;
