import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat
} from '@mui/icons-material';

const MetricCard = ({
  title,
  value,
  icon,
  color,
  bgColor,
  trend,
  trendValue,
  loading = false,
  onClick
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp />;
    if (trend === 'down') return <TrendingDown />;
    return <TrendingFlat />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return theme.palette.success.main;
    if (trend === 'down') return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  if (loading) {
    return (
      <Card sx={{ height: 140, cursor: onClick ? 'pointer' : 'default' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="text" width={60} height={16} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: 140,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography color="textSecondary" variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Avatar
            sx={{
              backgroundColor: bgColor || theme.palette.primary.light,
              color: color || theme.palette.primary.main,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
        </Box>
        
        <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            {value}
          </Typography>
          
          {(trend || trendValue) && (
            <Box display="flex" alignItems="center" mt={1}>
              <Box
                display="flex"
                alignItems="center"
                sx={{ color: getTrendColor() }}
              >
                {React.cloneElement(getTrendIcon(), { fontSize: 'small' })}
                {trendValue && (
                  <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                    {trendValue}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;