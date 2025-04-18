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
import DatasetCard from '../components/DatasetCard';
import { getDatasets } from '../services/suiService';

const DatasetsPage = () => {
  const wallet = useCurrentAccount();
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retrying, setRetrying] = useState(false);
  const itemsPerPage = 6;

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const data = await getDatasets(wallet);
      setDatasets(data);
      setFilteredDatasets(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setError(null);
    } catch (err) {
      setError('Error fetching datasets. Please try again later.');
      console.error('Error fetching datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [wallet]);

  useEffect(() => {
    // Filter datasets based on search query
    let filtered = datasets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = datasets.filter(dataset =>
        dataset.title.toLowerCase().includes(query) ||
        dataset.description.toLowerCase().includes(query) ||
        dataset.authors.some(author => author.toLowerCase().includes(query)) ||
        dataset.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Sort datasets
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
      case 'size_asc':
        filtered = [...filtered].sort((a, b) => a.fileSize - b.fileSize);
        break;
      case 'size_desc':
        filtered = [...filtered].sort((a, b) => b.fileSize - a.fileSize);
        break;
      default:
        break;
    }

    setFilteredDatasets(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1); // Reset to first page when filters change
  }, [searchQuery, sortBy, datasets]);

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
  const currentDatasets = filteredDatasets.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Research Datasets
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Browse and discover datasets from academic researchers around the world.
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search datasets by title, description, author, or keyword"
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
            <MenuItem value="size_asc">Size (Smallest First)</MenuItem>
            <MenuItem value="size_desc">Size (Largest First)</MenuItem>
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
                fetchDatasets().finally(() => setRetrying(false));
              }}
              disabled={retrying}
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          }
        >
          {error}
        </Alert>
      ) : filteredDatasets.length === 0 ? (
        <Alert severity="info" sx={{ my: 4 }}>
          No datasets found matching your search criteria.
        </Alert>
      ) : (
        <>
          <Grid container spacing={4}>
            {currentDatasets.map((dataset) => (
              <Grid item key={dataset.id} xs={12} sm={6} md={4}>
                <DatasetCard dataset={dataset} />
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

export default DatasetsPage;
