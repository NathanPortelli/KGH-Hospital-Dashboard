import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box } from '@mui/material';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

AppChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default function AppChart({ title, subheader, chartLabels, chartData, ...other }) {
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
    <Card {...other} sx={{transition: 'background-color 0.2s ease', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)', },}}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={chartData} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
