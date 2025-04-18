// This service handles search functionality for the platform

import { getPapers, getDatasets } from './suiService';

/**
 * Search for papers and datasets
 * @param {string} query - The search query
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} - The search results
 */
export const search = async (query, filters = {}) => {
  try {
    // Get all papers and datasets
    const [papers, datasets] = await Promise.all([
      getPapers(filters.publicOnly),
      getDatasets(filters.publicOnly),
    ]);
    
    // Filter papers based on search query and filters
    const filteredPapers = papers.filter(paper => {
      // Match query against title, abstract, authors, and keywords
      const matchesQuery = !query || 
        paper.title.toLowerCase().includes(query.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(query.toLowerCase()) ||
        paper.authors.some(author => author.toLowerCase().includes(query.toLowerCase())) ||
        paper.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()));
      
      // Apply additional filters
      const matchesFilters = 
        (!filters.author || paper.authors.some(author => 
          author.toLowerCase().includes(filters.author.toLowerCase()))) &&
        (!filters.keyword || paper.keywords.some(keyword => 
          keyword.toLowerCase().includes(filters.keyword.toLowerCase()))) &&
        (!filters.dateFrom || new Date(paper.createdAt) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(paper.createdAt) <= new Date(filters.dateTo));
      
      return matchesQuery && matchesFilters;
    });
    
    // Filter datasets based on search query and filters
    const filteredDatasets = datasets.filter(dataset => {
      // Match query against title, description, authors, and keywords
      const matchesQuery = !query || 
        dataset.title.toLowerCase().includes(query.toLowerCase()) ||
        dataset.description.toLowerCase().includes(query.toLowerCase()) ||
        dataset.authors.some(author => author.toLowerCase().includes(query.toLowerCase())) ||
        dataset.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()));
      
      // Apply additional filters
      const matchesFilters = 
        (!filters.author || dataset.authors.some(author => 
          author.toLowerCase().includes(filters.author.toLowerCase()))) &&
        (!filters.keyword || dataset.keywords.some(keyword => 
          keyword.toLowerCase().includes(filters.keyword.toLowerCase()))) &&
        (!filters.dateFrom || new Date(dataset.createdAt) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo || new Date(dataset.createdAt) <= new Date(filters.dateTo));
      
      return matchesQuery && matchesFilters;
    });
    
    return {
      papers: filteredPapers,
      datasets: filteredDatasets,
      total: filteredPapers.length + filteredDatasets.length,
    };
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

/**
 * Get popular keywords from papers and datasets
 * @returns {Promise<Array>} - The popular keywords
 */
export const getPopularKeywords = async () => {
  try {
    // Get all papers and datasets
    const [papers, datasets] = await Promise.all([
      getPapers(true), // Only public papers
      getDatasets(true), // Only public datasets
    ]);
    
    // Extract all keywords
    const allKeywords = [
      ...papers.flatMap(paper => paper.keywords),
      ...datasets.flatMap(dataset => dataset.keywords),
    ];
    
    // Count keyword occurrences
    const keywordCounts = allKeywords.reduce((counts, keyword) => {
      counts[keyword] = (counts[keyword] || 0) + 1;
      return counts;
    }, {});
    
    // Convert to array and sort by count
    const sortedKeywords = Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Get top 20
    
    return sortedKeywords;
  } catch (error) {
    console.error('Error getting popular keywords:', error);
    return [];
  }
};

/**
 * Get trending papers and datasets
 * @returns {Promise<Object>} - The trending items
 */
export const getTrendingItems = async () => {
  try {
    // Get all public papers and datasets
    const [papers, datasets] = await Promise.all([
      getPapers(true),
      getDatasets(true),
    ]);
    
    // Sort by creation date (newest first)
    const sortedPapers = [...papers].sort((a, b) => b.createdAt - a.createdAt);
    const sortedDatasets = [...datasets].sort((a, b) => b.createdAt - a.createdAt);
    
    return {
      papers: sortedPapers.slice(0, 5), // Top 5 newest papers
      datasets: sortedDatasets.slice(0, 5), // Top 5 newest datasets
    };
  } catch (error) {
    console.error('Error getting trending items:', error);
    return { papers: [], datasets: [] };
  }
};
