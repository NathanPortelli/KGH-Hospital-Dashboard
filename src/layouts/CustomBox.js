import { Box } from '@mui/material';

function CustomBox({ sx, children }) {
  return (
    <Box sx={{ marginBottom: '20px', border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 3, backgroundColor: 'grey.200', ...sx }}>
      {children}
    </Box>
  );
}

export default CustomBox;
