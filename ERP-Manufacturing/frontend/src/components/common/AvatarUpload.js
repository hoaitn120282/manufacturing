import React, { useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera, Edit } from '@mui/icons-material';

const AvatarUpload = ({ 
  user, 
  size = 120, 
  onAvatarChange, 
  loading = false,
  editable = true 
}) => {
  const fileInputRef = useRef(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleAvatarClick = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage({
          file,
          dataUrl: e.target.result,
        });
        setPreviewDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (previewImage && onAvatarChange) {
      setUploadLoading(true);
      try {
        await onAvatarChange(previewImage.file);
        setPreviewDialog(false);
        setPreviewImage(null);
      } catch (error) {
        console.error('Avatar upload failed:', error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setPreviewDialog(false);
    setPreviewImage(null);
  };

  return (
    <>
      <Box sx={{ textAlign: 'center', position: 'relative' }}>
        <Avatar
          src={user?.avatar}
          sx={{ 
            width: size, 
            height: size, 
            mx: 'auto', 
            mb: 2, 
            cursor: editable ? 'pointer' : 'default',
            position: 'relative',
            '&:hover': editable ? {
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '50%',
              }
            } : {}
          }}
          onClick={handleAvatarClick}
        >
          {!user?.avatar && `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
        </Avatar>

        {editable && (
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 16,
              right: '50%',
              transform: 'translateX(50%)',
              backgroundColor: 'primary.main',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
            onClick={handleAvatarClick}
          >
            <PhotoCamera fontSize="small" />
          </IconButton>
        )}

        {editable && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleAvatarClick}
            size="small"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={16} /> : 'Change Avatar'}
          </Button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          onChange={handleFileSelect}
        />

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          JPG, PNG or GIF (max. 5MB)
        </Typography>
      </Box>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={handleCancel} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Upload New Avatar</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {previewImage && (
              <>
                <Avatar
                  src={previewImage.dataUrl}
                  sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Preview of your new avatar
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  File: {previewImage.file.name} ({(previewImage.file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={uploadLoading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={uploadLoading}
          >
            {uploadLoading ? <CircularProgress size={20} /> : 'Upload Avatar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvatarUpload;