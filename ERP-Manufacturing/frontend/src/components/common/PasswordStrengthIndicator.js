import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (pwd) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    // Calculate score
    Object.values(checks).forEach(check => {
      if (check) score += 20;
    });

    return { score, checks };
  };

  const getStrengthText = (score) => {
    if (score === 0) return { text: '', color: 'grey.500' };
    if (score <= 40) return { text: 'Weak', color: 'error.main' };
    if (score <= 60) return { text: 'Fair', color: 'warning.main' };
    if (score <= 80) return { text: 'Good', color: 'info.main' };
    return { text: 'Strong', color: 'success.main' };
  };

  const { score, checks } = calculateStrength(password);
  const strength = getStrengthText(score);

  if (!password) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          Password Strength:
        </Typography>
        <Typography variant="body2" sx={{ color: strength.color, fontWeight: 'bold' }}>
          {strength.text}
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={score} 
        sx={{ 
          height: 6, 
          borderRadius: 3,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            backgroundColor: strength.color,
          }
        }} 
      />

      <Box sx={{ mt: 1 }}>
        {[
          { key: 'length', text: 'At least 8 characters' },
          { key: 'lowercase', text: 'One lowercase letter' },
          { key: 'uppercase', text: 'One uppercase letter' },
          { key: 'numbers', text: 'One number' },
          { key: 'special', text: 'One special character' },
        ].map(({ key, text }) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            {checks[key] ? (
              <CheckCircle sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
            ) : (
              <Cancel sx={{ fontSize: 16, color: 'error.main', mr: 1 }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: checks[key] ? 'success.main' : 'text.secondary',
                textDecoration: checks[key] ? 'line-through' : 'none'
              }}
            >
              {text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PasswordStrengthIndicator;