import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Typography, Button, Card, CardHeader, Box } from '@mui/material';
// components
import { useChart } from '../../../components/chart';
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

// Creates charts for use in Dashboard main page
// Left mainly as provided by React MUI

AppChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClick: PropTypes.func,
};

export default function AppChart({ title, subheader, chartLabels, chartData, onClick, ...other }) {
  const chartOptions = useChart({
    plotOptions: { bar: { columnWidth: '75%' } },
    fill: { type: chartData.map((i) => i.fill) },
    labels: chartLabels,
    xaxis: {
      type: 'text',
      labels: {
        show: true,
        rotate: -45,
        offsetY: 10,
        style: {
          fontSize: '12px',
          fontWeight: 400,
          cssClass: 'apex-xaxis-label',
        },
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          fontSize: '12px',
          fontWeight: 400,
          cssClass: 'apex-yaxis-label',
        },
        formatter: (value) => `${value.toFixed(0)} patients`,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} patients`;
          }
          return y;
        },
      },
    },
    chart: {
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    grid: {
      padding: {
        bottom: 20,
      },
    },
  });

  return (
    <Card {...other}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <CardHeader title={title} subheader={subheader} />
        {/* Show the button only if onClick is provided */}
        {onClick && (
          <Button variant='contained' onClick={onClick} sx={{ mr: 2, mt: 2, cursor: 'pointer' }}>
            <Iconify icon="material-symbols:info" sx={{ marginRight: '8px' }} />
            <Typography> More Info </Typography> {/* Link to Dialog popup with more information about the chart, provided in Dashboard main page */}
          </Button>
        )}
      </Box>
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={chartData} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
