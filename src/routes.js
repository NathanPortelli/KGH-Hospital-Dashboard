import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';

import NewPatientPage from './pages/NewPatientPage';
import PatientPage from './pages/Patient';
import PatientListPage from './pages/PatientListPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import AnalyticsPage from './pages/AnalyticsPage';
import DashboardAppPage from './pages/DashboardAppPage';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'patientlist', element: <PatientListPage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'newpatient', element: <NewPatientPage /> },
        { path: 'patient', element: <PatientPage /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
