import React, { useState } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { hideNotification } from '../../store/slices/uiSlice';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const NotificationSnackbar = () => {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.ui);
  const [exit, setExit] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setExit(true);
  };

  const handleExited = () => {
    dispatch(hideNotification());
    setExit(false);
  };

  if (!notification?.open) {
    return null;
  }

  return (
    <Snackbar
      open={notification.open && !exit}
      autoHideDuration={notification.duration || 6000}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      onExited={handleExited}
      anchorOrigin={{
        vertical: notification.vertical || 'bottom',
        horizontal: notification.horizontal || 'left'
      }}
    >
      <Alert
        severity={notification.severity || 'info'}
        variant={notification.variant || 'filled'}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{ width: '100%' }}
      >
        {notification.title && (
          <AlertTitle>{notification.title}</AlertTitle>
        )}
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;