import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Grid, Typography } from '@mui/material';
import { fShortenNumber } from '../../../utils/formatNumber';
import Iconify from '../../../components/iconify';

const StyledIcon = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(7),
  height: theme.spacing(7),
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
}));

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  sx: PropTypes.object,
};

// Creates the information boxes in Dashboard main page
// Adapted from original React MUI sample dashboard

export default function AppWidgetSummary({ title, total, icon, color = 'primary', sx, ...other }) {
  return (
    <Card
      sx={{
        py: 1,
        boxShadow: 0,
        textAlign: 'center',
        color: (theme) => theme.palette[color].contrastText,
        bgcolor: (theme) => theme.palette[color].lighter,
        transition: 'background-color 0.2s ease', 
        '&:hover': { backgroundColor: (theme) => theme.palette[color].light },
        ...sx,
      }}
      {...other}
    >
      <Grid container alignItems="center">
        <Grid item xs={2} sx={{ml: 3, mt: 1}}>
          <StyledIcon
            sx={{
              color: (theme) => theme.palette[color].contrastText,
              backgroundImage: (theme) => `linear-gradient(135deg, ${alpha(theme.palette[color].contrastText, 0)} 0%, ${alpha(theme.palette[color].contrastText, 0.24)} 100%)`,
            }}
          >
            <Iconify icon={icon} width={30} height={30} />
          </StyledIcon>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h3">{fShortenNumber(total)}</Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
            {title}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}