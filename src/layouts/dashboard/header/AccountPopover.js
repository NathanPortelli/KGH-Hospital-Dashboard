import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// @mui
import { Grid, Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signOut } from "firebase/auth";
import { db, auth } from '../../../config/firebase';

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [userName, setUserName] = useState([]);

  const userCollectionRef = collection(db, "users");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's name & designation through signed-in email address.
    const getUserName = async () => {
      try {
        const querySnapshot = await getDocs(
          query(userCollectionRef, where("email", "==", auth.currentUser.email))
        );
        if (!querySnapshot.empty) { // If name linked to email exists is user collection
          const { name, designation } = querySnapshot.docs[0].data(); // Set name & designation from first found in query
          setUserName({ name, designation });
          localStorage.setItem('userName', JSON.stringify({ name, designation })); // Store in local storage
        }
      } catch (e) {
        console.error(e);
      }
    };

    const storedUserName = localStorage.getItem('userName'); 
    if (storedUserName) { setUserName(JSON.parse(storedUserName)); } // If getUserName has already run and is still cached 
    else { getUserName(); } // First time after sign in or cache removal
  }, []);

  // Pop-up handling
  const [open, setOpen] = useState(null);
  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };
  const handleClose = () => {
    setOpen(null);
  };

  // When clicking the "Sign out" button
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/login', { replace: true }); // Return to login page
      })
      .catch((e) => {
        toast.error('An error occurred while signing out. Please refresh and try again.');
        console.log("An error occurred while signing out: ", e)
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
            <Avatar alt="photoURL" /> {/* Didn't create anything in Firebase for a user's photo, this will just be default avatar for everyone for now. */}
          </IconButton>
        </Grid>
        {/* Details listed on top prior to clicking. */}
        <Grid item>
          <Stack direction="column" alignItems="flex-start" spacing={0} sx={{ ml: 1 }}>
            <Typography sx={{ color: "#9fa5ab" }}>{userName.name}</Typography>
            <Typography sx={{ textAlign: 'right', color: "#9fa5ab", fontSize: "12px", textTransform: 'uppercase' }}>{userName.designation}</Typography>
          </Stack>
        </Grid>
      </Grid>

      {/* Popup details */}
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
          <Typography variant="subtitle2" noWrap> {userName.name} </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap> {auth?.currentUser?.email} </Typography>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <MenuItem onClick={handleLogout} sx={{ m: 1 }}> Sign out </MenuItem>
      </Popover>
    </>
  );
}