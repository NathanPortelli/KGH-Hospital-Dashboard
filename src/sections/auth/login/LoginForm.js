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
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleClick = () => {
    navigate('/dashboard', { replace: true });
  };

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user; // test
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorCode = error.code;
      let errorMessage = '';
  
      switch (errorCode) {
        case 'auth/user-not-found':
          errorMessage = 'This account does not exist.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        default:
          errorMessage = 'An error occurred. Please try again later.';
          break;
      }
      toast.error(errorMessage);
    }
  };
  
  return (
    <>
      <Stack spacing={3} sx={{ my: 2 }}>
        <TextField name="email" label="Email address" onChange={(e) => setEmail(e.target.value)} />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          onChange={(e) => setPass(e.target.value)}
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

      {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack> */}

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={signIn}>
        Login
      </LoadingButton>
    </>
  );
}
