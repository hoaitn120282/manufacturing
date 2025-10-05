# Profile Page Documentation

## Overview
ProfilePage is a comprehensive user profile management component that allows users to manage their personal information, security settings, and application preferences.

## Features

### 📄 **Tab 1: Personal Information**
- **Profile Editing**: Edit/save personal information with form validation
- **Avatar Management**: Upload and preview profile pictures with AvatarUpload component
- **Real-time Validation**: Form validation with error messages
- **Responsive Design**: Works on mobile and desktop devices

### 🔒 **Tab 2: Security**
- **Password Change**: Secure password update with current password verification
- **Password Strength**: Real-time password strength indicator
- **Password Visibility**: Toggle show/hide for password fields
- **Validation**: Password confirmation and strength requirements

### ⚙️ **Tab 3: Settings**
- **Notification Preferences**: Email, push, and weekly report settings
- **Appearance Settings**: Dark mode toggle
- **Settings Persistence**: Save preferences to user profile

## Components Used

### AvatarUpload Component
```jsx
<AvatarUpload 
  user={user}
  onAvatarChange={handleAvatarUpload}
  loading={loading}
/>
```

**Props:**
- `user`: User object containing profile information
- `onAvatarChange`: Callback function when avatar is uploaded
- `loading`: Loading state for upload process
- `size`: Avatar size (default: 120px)
- `editable`: Whether avatar can be changed (default: true)

### PasswordStrengthIndicator Component
```jsx
<PasswordStrengthIndicator password={passwordForm.newPassword} />
```

**Props:**
- `password`: Password string to analyze

**Features:**
- Real-time strength calculation
- Visual progress bar
- Checklist of password requirements
- Color-coded strength levels (Weak, Fair, Good, Strong)

## Redux Integration

### Actions Used
- `updateProfile(profileData)`: Update user profile information
- `changePassword(passwordData)`: Change user password
- `uploadAvatar(file)`: Upload new avatar image

### State Management
- Uses `authSlice` for user authentication state
- Loading states for async operations
- Error handling with snackbar notifications

## API Integration

### Services Used
- `authService`: Profile updates and password changes
- `profileService`: Avatar upload and preferences

### Endpoints
- `PUT /auth/profile`: Update profile information
- `PUT /auth/change-password`: Change password
- `POST /auth/upload-avatar`: Upload avatar image
- `PUT /auth/preferences`: Update user preferences

## Form Validation

### Profile Form
- **Required Fields**: First name, last name, email
- **Email Validation**: Proper email format
- **Real-time Validation**: Immediate feedback on errors

### Password Form
- **Current Password**: Required for security
- **New Password**: Minimum 6 characters
- **Confirmation**: Must match new password
- **Strength Requirements**: Visual feedback for password strength

## File Upload

### Avatar Upload
- **File Types**: JPG, PNG, GIF
- **Size Limit**: 5MB maximum
- **Preview**: Shows preview before upload
- **Error Handling**: File size and type validation

## Responsive Design

### Mobile-First Approach
- **Grid Layout**: Responsive grid for different screen sizes
- **Touch-Friendly**: Large touch targets for mobile devices
- **Card-Based Design**: Clean, modern interface

### Breakpoints
- **xs (0px+)**: Mobile layout
- **sm (600px+)**: Tablet layout
- **md (900px+)**: Desktop layout with sidebar

## Error Handling

### User Feedback
- **Snackbar Notifications**: Success and error messages
- **Form Validation**: Inline error messages
- **Loading States**: Visual feedback during operations

### Error Types
- **Network Errors**: API connection issues
- **Validation Errors**: Form input validation
- **File Upload Errors**: Size and type restrictions

## Usage Example

```jsx
import ProfilePage from './pages/ProfilePage';

// In your router
<Route path="/profile" element={<ProfilePage />} />
```

## Dependencies
- `@mui/material`: UI components
- `react-redux`: State management
- `@reduxjs/toolkit`: Redux utilities
- `react-router-dom`: Navigation

## Future Enhancements

### Potential Features
- **Two-Factor Authentication**: Add 2FA setup
- **Activity Log**: Show user activity history
- **Social Media Links**: Connect social accounts
- **Data Export**: Export user data
- **Account Deletion**: Self-service account removal

### Performance Optimizations
- **Image Compression**: Compress uploaded images
- **Lazy Loading**: Load components on demand
- **Caching**: Cache user preferences locally
- **Debounced Validation**: Reduce validation API calls