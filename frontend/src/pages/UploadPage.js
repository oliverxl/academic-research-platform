import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  InputAdornment,
  IconButton,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import FileUploader from '../components/FileUploader';
import { uploadPaper, uploadDataset } from '../services/suiService';

const UploadPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [uploadType, setUploadType] = useState('paper');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Paper form state
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [paperAuthors, setPaperAuthors] = useState(['']);
  const [paperKeywords, setPaperKeywords] = useState(['']);
  const [paperIsPublic, setPaperIsPublic] = useState(true);
  
  // Dataset form state
  const [datasetTitle, setDatasetTitle] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [datasetAuthors, setDatasetAuthors] = useState(['']);
  const [datasetKeywords, setDatasetKeywords] = useState(['']);
  const [datasetIsPublic, setDatasetIsPublic] = useState(true);
  
  const steps = ['Select Upload Type', 'Upload File', 'Enter Metadata', 'Review & Submit'];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleUploadTypeChange = (event, newValue) => {
    setUploadType(newValue);
  };
  
  const handleFileUploaded = (fileData) => {
    setUploadedFile(fileData);
    handleNext();
  };
  
  const handleAddAuthor = () => {
    if (uploadType === 'paper') {
      setPaperAuthors([...paperAuthors, '']);
    } else {
      setDatasetAuthors([...datasetAuthors, '']);
    }
  };
  
  const handleAuthorChange = (index, value) => {
    if (uploadType === 'paper') {
      const newAuthors = [...paperAuthors];
      newAuthors[index] = value;
      setPaperAuthors(newAuthors);
    } else {
      const newAuthors = [...datasetAuthors];
      newAuthors[index] = value;
      setDatasetAuthors(newAuthors);
    }
  };
  
  const handleAddKeyword = () => {
    if (uploadType === 'paper') {
      setPaperKeywords([...paperKeywords, '']);
    } else {
      setDatasetKeywords([...datasetKeywords, '']);
    }
  };
  
  const handleKeywordChange = (index, value) => {
    if (uploadType === 'paper') {
      const newKeywords = [...paperKeywords];
      newKeywords[index] = value;
      setPaperKeywords(newKeywords);
    } else {
      const newKeywords = [...datasetKeywords];
      newKeywords[index] = value;
      setDatasetKeywords(newKeywords);
    }
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (uploadType === 'paper') {
        // Filter out empty authors and keywords
        const filteredAuthors = paperAuthors.filter(author => author.trim() !== '');
        const filteredKeywords = paperKeywords.filter(keyword => keyword.trim() !== '');
        
        const paperData = {
          title: paperTitle,
          abstract: paperAbstract,
          authors: filteredAuthors,
          keywords: filteredKeywords,
          fileHash: uploadedFile.fileHash,
          fileSize: uploadedFile.fileSize,
          isPublic: paperIsPublic,
        };
        
        await uploadPaper(paperData);
      } else {
        // Filter out empty authors and keywords
        const filteredAuthors = datasetAuthors.filter(author => author.trim() !== '');
        const filteredKeywords = datasetKeywords.filter(keyword => keyword.trim() !== '');
        
        const datasetData = {
          title: datasetTitle,
          description: datasetDescription,
          authors: filteredAuthors,
          keywords: filteredKeywords,
          fileHash: uploadedFile.fileHash,
          fileSize: uploadedFile.fileSize,
          isPublic: datasetIsPublic,
        };
        
        await uploadDataset(datasetData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate(uploadType === 'paper' ? '/papers' : '/datasets');
      }, 2000);
    } catch (err) {
      setError('Error uploading to blockchain. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              What would you like to upload?
            </Typography>
            <Tabs
              value={uploadType}
              onChange={handleUploadTypeChange}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Research Paper" value="paper" />
              <Tab label="Dataset" value="dataset" />
            </Tabs>
            
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {uploadType === 'paper' ? (
                <Typography variant="body1">
                  Upload a research paper in PDF format. This can be a published paper, preprint, or work in progress.
                </Typography>
              ) : (
                <Typography variant="body1">
                  Upload a dataset in any format (CSV, JSON, ZIP, etc.). This can be raw data, processed data, or any other research-related dataset.
                </Typography>
              )}
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload your {uploadType === 'paper' ? 'research paper' : 'dataset'}
            </Typography>
            <FileUploader onFileUploaded={handleFileUploaded} />
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enter metadata for your {uploadType === 'paper' ? 'research paper' : 'dataset'}
            </Typography>
            
            {uploadType === 'paper' ? (
              // Paper metadata form
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Title"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Abstract"
                    multiline
                    rows={4}
                    value={paperAbstract}
                    onChange={(e) => setPaperAbstract(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Authors
                  </Typography>
                  {paperAuthors.map((author, index) => (
                    <TextField
                      key={index}
                      fullWidth
                      label={`Author ${index + 1}`}
                      value={author}
                      onChange={(e) => handleAuthorChange(index, e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddAuthor}
                    variant="outlined"
                    size="small"
                  >
                    Add Author
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {paperKeywords.map((keyword, index) => (
                      <TextField
                        key={index}
                        label={`Keyword ${index + 1}`}
                        value={keyword}
                        onChange={(e) => handleKeywordChange(index, e.target.value)}
                        size="small"
                        sx={{ mb: 1, mr: 1 }}
                      />
                    ))}
                  </Box>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddKeyword}
                    variant="outlined"
                    size="small"
                  >
                    Add Keyword
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paperIsPublic}
                        onChange={(e) => setPaperIsPublic(e.target.checked)}
                      />
                    }
                    label="Make this paper publicly accessible"
                  />
                </Grid>
              </Grid>
            ) : (
              // Dataset metadata form
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Title"
                    value={datasetTitle}
                    onChange={(e) => setDatasetTitle(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={datasetDescription}
                    onChange={(e) => setDatasetDescription(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Authors/Contributors
                  </Typography>
                  {datasetAuthors.map((author, index) => (
                    <TextField
                      key={index}
                      fullWidth
                      label={`Author/Contributor ${index + 1}`}
                      value={author}
                      onChange={(e) => handleAuthorChange(index, e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddAuthor}
                    variant="outlined"
                    size="small"
                  >
                    Add Author/Contributor
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {datasetKeywords.map((keyword, index) => (
                      <TextField
                        key={index}
                        label={`Keyword ${index + 1}`}
                        value={keyword}
                        onChange={(e) => handleKeywordChange(index, e.target.value)}
                        size="small"
                        sx={{ mb: 1, mr: 1 }}
                      />
                    ))}
                  </Box>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddKeyword}
                    variant="outlined"
                    size="small"
                  >
                    Add Keyword
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={datasetIsPublic}
                        onChange={(e) => setDatasetIsPublic(e.target.checked)}
                      />
                    }
                    label="Make this dataset publicly accessible"
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        );
      
      case 3:
        return (
          <Box sx={{ width: '100%', mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review and Submit
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Your {uploadType} has been successfully uploaded! Redirecting...
              </Alert>
            )}
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                File Information
              </Typography>
              <Typography variant="body2">
                <strong>File Name:</strong> {uploadedFile?.file.name}
              </Typography>
              <Typography variant="body2">
                <strong>File Size:</strong> {(uploadedFile?.fileSize / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Typography variant="body2">
                <strong>File Type:</strong> {uploadedFile?.file.type}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Metadata
              </Typography>
              
              {uploadType === 'paper' ? (
                <>
                  <Typography variant="body2">
                    <strong>Title:</strong> {paperTitle}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Abstract:</strong> {paperAbstract}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Authors:</strong> {paperAuthors.filter(a => a.trim() !== '').join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Keywords:</strong>{' '}
                    {paperKeywords.filter(k => k.trim() !== '').map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Visibility:</strong> {paperIsPublic ? 'Public' : 'Private'}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2">
                    <strong>Title:</strong> {datasetTitle}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {datasetDescription}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Authors/Contributors:</strong> {datasetAuthors.filter(a => a.trim() !== '').join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Keywords:</strong>{' '}
                    {datasetKeywords.filter(k => k.trim() !== '').map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Visibility:</strong> {datasetIsPublic ? 'Public' : 'Private'}
                  </Typography>
                </>
              )}
            </Paper>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Research
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={
                (activeStep === 0 && !uploadType) ||
                (activeStep === 2 && uploadType === 'paper' && (!paperTitle || !paperAbstract)) ||
                (activeStep === 2 && uploadType === 'dataset' && (!datasetTitle || !datasetDescription)) ||
                loading ||
                success
              }
              startIcon={activeStep === steps.length - 1 ? <CloudUploadIcon /> : null}
            >
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default UploadPage;
