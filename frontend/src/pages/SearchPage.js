import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import PaperCard from '../components/PaperCard';
import DatasetCard from '../components/DatasetCard';
import { search, getPopularKeywords } from '../services/searchService';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State
  const [searchQuery, setSearchQuery] = useState(queryParams.get('q') || '');
  const [searchResults, setSearchResults] = useState({ papers: [], datasets: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [popularKeywords, setPopularKeywords] = useState([]);
  const [filters, setFilters] = useState({
    author: queryParams.get('author') || '',
    keyword: queryParams.get('keyword') || '',
    dateFrom: queryParams.get('dateFrom') || '',
    dateTo: queryParams.get('dateTo') || '',
    publicOnly: queryParams.get('publicOnly') === 'true',
  });
  
  // Load search results when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery && !filters.author && !filters.keyword && !filters.dateFrom && !filters.dateTo) {
        setSearchResults({ papers: [], datasets: [], total: 0 });
        return;
      }
      
      setLoading(true);
      try {
        const results = await search(searchQuery, filters);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [searchQuery, filters]);
  
  // Load popular keywords
  useEffect(() => {
    const loadPopularKeywords = async () => {
      try {
        const keywords = await getPopularKeywords();
        setPopularKeywords(keywords);
      } catch (error) {
        console.error('Error loading popular keywords:', error);
      }
    };
    
    loadPopularKeywords();
  }, []);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.author) params.set('author', filters.author);
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.publicOnly) params.set('publicOnly', 'true');
    
    navigate({ pathname: '/search', search: params.toString() });
  };
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle keyword click
  const handleKeywordClick = (keyword) => {
    setFilters(prev => ({ ...prev, keyword }));
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Academic Resources
      </Typography>
      
      {/* Search Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Query"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, keywords..."
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                type="button"
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => document.getElementById('filters-accordion').click()}
                sx={{ height: '56px' }}
              >
                Filters
              </Button>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ height: '56px' }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          
          {/* Advanced Filters */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              id="filters-accordion"
            >
              <Typography>Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Author"
                    variant="outlined"
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    placeholder="Filter by author name"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Keyword"
                    variant="outlined"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    placeholder="Filter by keyword"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    variant="outlined"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    variant="outlined"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <Button
                      variant={filters.publicOnly ? "contained" : "outlined"}
                      color={filters.publicOnly ? "primary" : "inherit"}
                      onClick={() => handleFilterChange('publicOnly', !filters.publicOnly)}
                    >
                      {filters.publicOnly ? "Public Only" : "All Resources"}
                    </Button>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </form>
      </Paper>
      
      {/* Popular Keywords */}
      {popularKeywords.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Popular Keywords:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {popularKeywords.map(({ keyword, count }) => (
              <Chip
                key={keyword}
                label={`${keyword} (${count})`}
                onClick={() => handleKeywordClick(keyword)}
                clickable
                color={filters.keyword === keyword ? "primary" : "default"}
                variant={filters.keyword === keyword ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Search Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {searchResults.total > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {searchResults.total} results found
              </Typography>
              
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{ mb: 3 }}
              >
                <Tab label={`All (${searchResults.total})`} />
                <Tab label={`Papers (${searchResults.papers.length})`} />
                <Tab label={`Datasets (${searchResults.datasets.length})`} />
              </Tabs>
              
              <Divider sx={{ mb: 3 }} />
              
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  {searchResults.papers.map(paper => (
                    <Grid item xs={12} key={paper.id}>
                      <PaperCard paper={paper} />
                    </Grid>
                  ))}
                  
                  {searchResults.datasets.map(dataset => (
                    <Grid item xs={12} key={dataset.id}>
                      <DatasetCard dataset={dataset} />
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  {searchResults.papers.map(paper => (
                    <Grid item xs={12} key={paper.id}>
                      <PaperCard paper={paper} />
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {activeTab === 2 && (
                <Grid container spacing={3}>
                  {searchResults.datasets.map(dataset => (
                    <Grid item xs={12} key={dataset.id}>
                      <DatasetCard dataset={dataset} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ) : (
            searchQuery || filters.author || filters.keyword || filters.dateFrom || filters.dateTo ? (
              <Box sx={{ textAlign: 'center', my: 8 }}>
                <Typography variant="h6" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try adjusting your search query or filters
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', my: 8 }}>
                <Typography variant="h6" gutterBottom>
                  Enter a search query to find papers and datasets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  You can search by title, author, keywords, and more
                </Typography>
              </Box>
            )
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;
