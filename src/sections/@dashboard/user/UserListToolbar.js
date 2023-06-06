import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment } from '@mui/material';
import { useEffect, useState } from 'react';
import { getDocs, collection, query, where, getFirestore } from 'firebase/firestore';
import Iconify from '../../../components/iconify';

const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};

export default function UserListToolbar({ numSelected, filterName, onFilterName }) {
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const searchPatients = async () => {
      const db = getFirestore();
      const patientsRef = collection(db, 'patients');
  
      const filteredPatients = [];
  
      if (searchText !== '') {
        const q = query(
          patientsRef,
          where('FirstName', '==', searchText),
        );
  
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const patientData = doc.data();
          if (
            patientData.FirstName.includes(searchText) ||
            patientData.LastName.includes(searchText)
          ) {
            filteredPatients.push(patientData);
          }
        });
      }
  
      onFilterName(filteredPatients);
    };
  
    searchPatients();
  }, [searchText, onFilterName]);

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  return (
    <StyledRoot
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <StyledSearch
          value={searchText}
          onChange={handleSearchTextChange}
          placeholder="Search patients..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </StyledRoot>
  );
}