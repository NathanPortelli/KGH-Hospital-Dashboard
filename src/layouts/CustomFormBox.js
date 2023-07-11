import { Grid, Box, FormControl, InputLabel } from '@mui/material';

function CustomFormBox({ sx, title, children }) {
  return (
    <Grid item xs={12} sm={6}>
      <FormControl sx={{minWidth: 'calc(100%)', m: 0 }} size="large">
        <InputLabel variant="standard" htmlFor="uncontrolled-native" sx={{ pl: 2 }}>{title}</InputLabel>
        {children}
      </FormControl>
    </Grid>
  );
}

export default CustomFormBox;
