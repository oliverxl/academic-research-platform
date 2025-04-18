import { search, getPopularKeywords, getTrendingItems } from '../services/searchService';
import { getPapers, getDatasets } from '../services/suiService';

// Mock the suiService functions
jest.mock('../services/suiService', () => ({
  getPapers: jest.fn(),
  getDatasets: jest.fn(),
}));

describe('SearchService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getPapers.mockReset();
    getDatasets.mockReset();
    
    // Setup mock data
    const mockPapers = [
      {
        id: '0x123',
        title: 'Advances in Quantum Computing',
        abstract: 'This paper explores recent advances in quantum computing...',
        authors: ['John Doe', 'Jane Smith'],
        keywords: ['quantum computing', 'quantum mechanics', 'qubits'],
        fileHash: 'abc123',
        fileSize: 1024 * 1024 * 2, // 2MB
        isPublic: true,
        owner: '0x456',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
      {
        id: '0x789',
        title: 'Machine Learning for Climate Science',
        abstract: 'This paper demonstrates how machine learning can be applied to climate science...',
        authors: ['Alice Johnson', 'Bob Brown'],
        keywords: ['machine learning', 'climate science', 'neural networks'],
        fileHash: 'def456',
        fileSize: 1024 * 1024 * 3, // 3MB
        isPublic: true,
        owner: '0xabc',
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
      },
    ];
    
    const mockDatasets = [
      {
        id: '0xdef',
        title: 'Climate Data 2010-2020',
        description: 'This dataset contains climate measurements from 2010 to 2020...',
        authors: ['Climate Research Institute'],
        keywords: ['climate', 'temperature', 'precipitation'],
        fileHash: 'ghi789',
        fileSize: 1024 * 1024 * 50, // 50MB
        isPublic: true,
        owner: '0x456',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      },
    ];
    
    getPapers.mockResolvedValue(mockPapers);
    getDatasets.mockResolvedValue(mockDatasets);
  });
  
  describe('search', () => {
    it('should return all papers and datasets when no query is provided', async () => {
      const result = await search('');
      
      expect(result.papers.length).toBe(2);
      expect(result.datasets.length).toBe(1);
      expect(result.total).toBe(3);
    });
    
    it('should filter papers and datasets based on search query', async () => {
      const result = await search('quantum');
      
      expect(result.papers.length).toBe(1);
      expect(result.papers[0].title).toBe('Advances in Quantum Computing');
      expect(result.datasets.length).toBe(0);
      expect(result.total).toBe(1);
    });
    
    it('should filter papers and datasets based on author filter', async () => {
      const result = await search('', { author: 'John Doe' });
      
      expect(result.papers.length).toBe(1);
      expect(result.papers[0].title).toBe('Advances in Quantum Computing');
      expect(result.datasets.length).toBe(0);
      expect(result.total).toBe(1);
    });
    
    it('should filter papers and datasets based on keyword filter', async () => {
      const result = await search('', { keyword: 'climate' });
      
      expect(result.papers.length).toBe(1);
      expect(result.papers[0].title).toBe('Machine Learning for Climate Science');
      expect(result.datasets.length).toBe(1);
      expect(result.datasets[0].title).toBe('Climate Data 2010-2020');
      expect(result.total).toBe(2);
    });
    
    it('should filter papers and datasets based on date range', async () => {
      const dateFrom = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // 20 days ago
      const result = await search('', { dateFrom: dateFrom.toISOString() });
      
      expect(result.papers.length).toBe(2);
      expect(result.datasets.length).toBe(0);
      expect(result.total).toBe(2);
    });
    
    it('should combine multiple filters', async () => {
      const result = await search('climate', { author: 'Alice Johnson' });
      
      expect(result.papers.length).toBe(1);
      expect(result.papers[0].title).toBe('Machine Learning for Climate Science');
      expect(result.datasets.length).toBe(0);
      expect(result.total).toBe(1);
    });
  });
  
  describe('getPopularKeywords', () => {
    it('should return keywords sorted by frequency', async () => {
      const keywords = await getPopularKeywords();
      
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords[0]).toHaveProperty('keyword');
      expect(keywords[0]).toHaveProperty('count');
      
      // Check that keywords are sorted by count (descending)
      for (let i = 1; i < keywords.length; i++) {
        expect(keywords[i-1].count).toBeGreaterThanOrEqual(keywords[i].count);
      }
    });
  });
  
  describe('getTrendingItems', () => {
    it('should return trending papers and datasets', async () => {
      const trending = await getTrendingItems();
      
      expect(trending).toHaveProperty('papers');
      expect(trending).toHaveProperty('datasets');
      expect(trending.papers.length).toBeGreaterThan(0);
      
      // Check that papers are sorted by creation date (newest first)
      for (let i = 1; i < trending.papers.length; i++) {
        expect(trending.papers[i-1].createdAt).toBeGreaterThanOrEqual(trending.papers[i].createdAt);
      }
    });
  });
});
