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
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';

const PaperCard = ({ paper }) => {
  const {
    id,
    title,
    abstract,
    authors,
    keywords,
    isPublic,
    owner,
    createdAt,
  } = paper;

  // Format the date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Truncate the abstract
  const truncatedAbstract = abstract.length > 150
    ? `${abstract.substring(0, 150)}...`
    : abstract;

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
          {truncatedAbstract}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {authors.join(', ')}
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
          startIcon={<DescriptionIcon />}
          component={RouterLink}
          to={`/papers/${id}`}
        >
          View Paper
        </Button>
      </CardActions>
    </Card>
  );
};

export default PaperCard;
