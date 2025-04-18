import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Pagination,
  Alert,
  Button,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useCurrentAccount } from '@mysten/dapp-kit';
import PaperCard from '../components/PaperCard';
import { getPapers } from '../services/suiService';

const PapersPage = () => {
  const wallet = useCurrentAccount();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retrying, setRetrying] = useState(false);
  const itemsPerPage = 6;

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const data = await getPapers(wallet);
      setPapers(data);
      setFilteredPapers(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setError(null);
    } catch (err) {
      setError('Error fetching papers. Please try again later.');
      console.error('Error fetching papers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [wallet]);

  useEffect(() => {
    // Filter papers based on search query
    let filtered = papers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = papers.filter(paper =>
        paper.title.toLowerCase().includes(query) ||
        paper.abstract.toLowerCase().includes(query) ||
        paper.authors.some(author => author.toLowerCase().includes(query)) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Sort papers
    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'title_asc':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredPapers(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1); // Reset to first page when filters change
  }, [searchQuery, sortBy, papers]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Get current page items
  const currentPapers = filteredPapers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Research Papers
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse and discover research papers from academic researchers around the world.
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search papers by title, abstract, author, or keyword"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="sort-by-label">Sort By</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            onChange={handleSortChange}
            label="Sort By"
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="title_asc">Title (A-Z)</MenuItem>
            <MenuItem value="title_desc">Title (Z-A)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{ my: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setRetrying(true);
                fetchPapers().finally(() => setRetrying(false));
              }}
              disabled={retrying}
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          }
        >
          {error}
        </Alert>
      ) : filteredPapers.length === 0 ? (
        <Alert severity="info" sx={{ my: 4 }}>
          No papers found matching your search criteria.
        </Alert>
      ) : (
        <>
          <Grid container spacing={4}>
            {currentPapers.map((paper) => (
              <Grid item key={paper.id} xs={12} sm={6} md={4}>
                <PaperCard paper={paper} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default PapersPage;
