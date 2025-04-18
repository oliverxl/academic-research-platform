import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { addComment, updateComment, removeComment, getComments } from '../services/suiService';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ resourceId, resourceType }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!resourceId) return;
      
      setLoading(true);
      try {
        const result = await getComments(resourceId, resourceType);
        setComments(result);
      } catch (err) {
        setError('Error loading comments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadComments();
  }, [resourceId, resourceType]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await addComment(resourceId, resourceType, newComment);
      
      // Add the new comment to the list
      setComments([
        ...comments,
        {
          id: `temp-${Date.now()}`, // This will be replaced with the actual ID from the blockchain
          author: user.id,
          authorName: user.name,
          content: newComment,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      
      setNewComment('');
    } catch (err) {
      setError('Error adding comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.content);
  };

  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditedCommentText('');
  };

  const handleUpdateComment = async (commentId) => {
    if (!editedCommentText.trim()) return;
    
    setLoading(true);
    try {
      await updateComment(commentId, editedCommentText);
      
      // Update the comment in the list
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, content: editedCommentText, updatedAt: Date.now() } 
          : c
      ));
      
      setEditingCommentId(null);
      setEditedCommentText('');
    } catch (err) {
      setError('Error updating comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveComment = async (commentId) => {
    setLoading(true);
    try {
      await removeComment(commentId);
      
      // Remove the comment from the list
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      setError('Error removing comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && comments.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {comments.length > 0 ? (
            <List>
              {comments.map((comment) => (
                <React.Fragment key={comment.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      user && comment.author === user.id && (
                        <Box>
                          {editingCommentId === comment.id ? (
                            <IconButton
                              edge="end"
                              aria-label="cancel"
                              onClick={handleCancelEditing}
                            >
                              <CancelIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleStartEditing(comment)}
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveComment(comment.id)}
                            disabled={loading}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <AccountCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">
                            {comment.authorName || `User ${comment.author.substring(0, 8)}...`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(comment.createdAt)}
                            {comment.updatedAt > comment.createdAt && ' (edited)'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        editingCommentId === comment.id ? (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={editedCommentText}
                              onChange={(e) => setEditedCommentText(e.target.value)}
                              variant="outlined"
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={!editedCommentText.trim() || loading}
                            >
                              Update
                            </Button>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                          >
                            {comment.content}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </>
      )}
      
      {isAuthenticated ? (
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Add a comment"
            multiline
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            disabled={loading}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
            >
              Comment
            </Button>
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please log in to add comments
        </Alert>
      )}
    </Paper>
  );
};

export default CommentSection;
