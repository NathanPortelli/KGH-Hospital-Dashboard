import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoadingButton } from '@mui/lab';
import { signInWithEmailAndPassword  } from 'firebase/auth';
import { auth } from '../../../config/firebase';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // For 'show password' icon button

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const signIn = async (event) => {
    event.preventDefault();
    try {
      // Checks email and password with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      navigate('/dashboard', { replace: true }); // If login is successful, sends user to dashboard main page
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = '';
  
      switch (errorCode) {
        case 'auth/user-not-found': // Email was not found in authentication
          errorMessage = 'This account does not exist.';
          break;
        case 'auth/wrong-password': // Email is correct but its password was not
          errorMessage = 'Incorrect password. Please input the correct password and try again.';
          break;
        default:
          errorMessage = 'An error occurred. Please try again later.';
          break;
      }
      toast.error(errorMessage);
    }
  };
  
  return (
    <form onSubmit={signIn}>
      <Stack spacing={3} sx={{ my: 2 }}>
        <TextField name="email" label="Email address" onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'} // Shows password .s as default, unless user click the 'show password' icon
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained">
        Login
      </LoadingButton>
    </form>
  );
}