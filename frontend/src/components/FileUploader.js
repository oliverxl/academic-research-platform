import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { uploadFile, uploadLargeFile } from '../services/walrusService';

// File size threshold for using chunked upload (20MB)
const LARGE_FILE_THRESHOLD = 20 * 1024 * 1024;

const FileUploader = ({ onFileUploaded, acceptedFileTypes, maxFileSize = 100 * 1024 * 1024 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('standard');

  // Determine upload method based on file size
  useEffect(() => {
    if (file) {
      setUploadMethod(file.size > LARGE_FILE_THRESHOLD ? 'chunked' : 'standard');
    }
  }, [file]);

  const handleUploadProgress = useCallback((progress) => {
    setUploadProgress(progress);
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setUploadProgress(0);

    try {
      setUploading(true);

      // Determine which upload method to use based on file size
      const isLargeFile = selectedFile.size > LARGE_FILE_THRESHOLD;

      // Upload file to Walrus with progress tracking
      const result = isLargeFile
        ? await uploadLargeFile(selectedFile, handleUploadProgress)
        : await uploadFile(selectedFile, handleUploadProgress);

      // Call the callback with the upload result
      if (onFileUploaded) {
        onFileUploaded({
          file: selectedFile,
          fileHash: result.fileHash,
          fileSize: result.fileSize,
          mimeType: result.mimeType,
          url: result.url,
        });
      }
    } catch (err) {
      setError(err.message || 'Error uploading file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded, handleUploadProgress]);

  // Default accepted file types if not provided
  const defaultAcceptedTypes = {
    'application/pdf': ['.pdf'],
    'application/zip': ['.zip'],
    'application/x-zip-compressed': ['.zip'],
    'application/json': ['.json'],
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes || defaultAcceptedTypes,
    maxSize: maxFileSize,
    multiple: false,
  });

  // Get file type display name
  const getFileTypeDisplay = (file) => {
    if (!file) return '';

    const extension = file.name.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'PDF Document',
      'zip': 'ZIP Archive',
      'json': 'JSON File',
      'csv': 'CSV Spreadsheet',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
    };

    return typeMap[extension] || file.type;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!uploading && (
        <Paper
          {...getRootProps()}
          className="dropzone"
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.400',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          <input {...getInputProps()} />

          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag & drop a file here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported file types: {Object.values(acceptedFileTypes || defaultAcceptedTypes)
                .flat()
                .map(type => type.replace('.', '').toUpperCase())
                .join(', ')}
              <br />
              Maximum file size: {(maxFileSize / (1024 * 1024)).toFixed(0)}MB
            </Typography>
          </Box>
        </Paper>
      )}

      {uploading && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsertDriveFileIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" noWrap>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {getFileTypeDisplay(file)}
              </Typography>
            </Box>
            <Chip
              label={uploadMethod === 'chunked' ? 'Chunked Upload' : 'Standard Upload'}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>

          <Typography variant="body2" align="center">
            Uploading... {uploadProgress}%
          </Typography>
        </Paper>
      )}

      {file && !uploading && (
        <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InsertDriveFileIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {getFileTypeDisplay(file)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Will use {file.size > LARGE_FILE_THRESHOLD ? 'chunked upload' : 'standard upload'}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              Remove
            </Button>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              disabled={uploading}
              onClick={() => onDrop([file])}
            >
              Upload File
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default FileUploader;
