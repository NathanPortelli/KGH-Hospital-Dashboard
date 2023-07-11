import { Dashboard, RecentActors, Equalizer, PersonAddAlt } from '@mui/icons-material';

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: <Dashboard />,
  },
  {
    title: 'predictive analytics',
    path: '/dashboard/analytics',
    icon: <Equalizer/>,
  },
  {
    title: 'add patient',
    path: '/dashboard/newpatient',
    icon: <PersonAddAlt/>,
  },
  {
    title: 'patient list',
    path: '/dashboard/patientlist',
    icon: <RecentActors />,
  },

];

export default navConfig;
