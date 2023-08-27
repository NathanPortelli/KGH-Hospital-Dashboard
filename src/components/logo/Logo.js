import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link } from '@mui/material';
import kghLogo from './logo.png'

// ----------------------------------------------------------------------

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  const logo = (
    <Box
      ref={ref}
      component="div"
      sx={{
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    >
      <img  width={50} height={50}  src={kghLogo} alt="KGH Logo" />
      {/* <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
        width="192.000000pt" height="60.000000pt" viewBox="0 0 192.000000 192.000000"
        preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,192.000000) scale(0.100000,-0.100000)"
        fill="#000080" stroke="none">
        <path d="M660 1430 l0 -480 -330 0 -330 0 0 -470 0 -470 635 0 635 0 2 463 3
        462 323 3 322 2 0 485 0 485 -630 0 -630 0 0 -480z"/>
        </g>
      </svg> */}
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <Link to="/dashboard/app" component={RouterLink} sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};

export default Logo;
