import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  DataUsage as DataUsageIcon,
} from '@mui/icons-material';

const DatasetCard = ({ dataset }) => {
  const {
    id,
    title,
    description,
    authors,
    keywords,
    fileSize,
    isPublic,
    createdAt,
  } = dataset;

  // Format the date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Format the file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Truncate the description
  const truncatedDescription = description.length > 150
    ? `${description.substring(0, 150)}...`
    : description;

  return (
    <Card
      className="paper-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" gutterBottom>
            {title}
          </Typography>
          <Tooltip title={isPublic ? 'Public' : 'Private'}>
            {isPublic ? (
              <PublicIcon color="success" />
            ) : (
              <LockIcon color="warning" />
            )}
          </Tooltip>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {truncatedDescription}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {authors.join(', ')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DataUsageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(fileSize)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {keywords.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              size="small"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<StorageIcon />}
          component={RouterLink}
          to={`/datasets/${id}`}
        >
          View Dataset
        </Button>
      </CardActions>
    </Card>
  );
};

export default DatasetCard;
