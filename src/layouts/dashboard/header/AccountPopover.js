import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// @mui
import { Grid, Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signOut } from "firebase/auth";
import { db, auth } from '../../../config/firebase';
import account from '../../../_mock/account';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
  },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [userName, setUserName] = useState([]);

  const userCollectionRef = collection(db, "users");
  const navigate = useNavigate();

  useEffect(() => {
    const getUserName = async () => {
      try {
        const querySnapshot = await getDocs(
          query(userCollectionRef, where("email", "==", auth.currentUser.email))
        );
        if (!querySnapshot.empty) {
          const user = querySnapshot.docs[0].data();
          const { name, designation } = user;
          setUserName({ name, designation });
          localStorage.setItem('userName', JSON.stringify({ name, designation })); // Store in local storage
        }
      } catch (e) {
        console.error(e);
      }
    };

    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(JSON.parse(storedUserName));
    } else {
      getUserName();
    }
  }, []);

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (event) => {
    setOpen(null);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/login', { replace: true });
      })
      .catch((error) => {
        toast.error('An error occurred while signing out. Please refresh and try again.');
      });
  };

  return (
    <>
      <Grid
        onClick={handleOpen}
        container
        direction="row"
        alignItems="center"
        sx={{
          cursor: "pointer",
          ml: 3,
          position: 'relative',
          padding: '8px',
          backgroundColor: '#D0F2FF',
          borderRadius: '10%',
        }}
      >
        <Grid item>
          <IconButton
            sx={{
              p: 0,
              zIndex: 2,
              ...(open && {
                '&:before': {
                  zIndex: 1,
                  content: "''",
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  position: 'absolute',
                },
              }),
            }}
          >
            <Avatar src={account.photoURL} alt="photoURL" />
          </IconButton>
        </Grid>
        <Grid item>
          <Stack direction="column" alignItems="flex-start" spacing={0} sx={{ ml: 1 }}>
            <Typography sx={{ color: "#04297A" }}>{userName.name}</Typography>
            <Typography sx={{ textAlign: 'right', color: "#04297A", fontSize: "12px", textTransform: 'uppercase' }}>{userName.designation}</Typography>
          </Stack>
        </Grid>
      </Grid>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 225,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {userName.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {auth?.currentUser?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={handleClose}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}