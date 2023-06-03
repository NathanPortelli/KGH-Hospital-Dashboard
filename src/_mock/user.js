import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { sample } from 'lodash';

// ----------------------------------------------------------------------

const users = [...Array(24)].map((_, index) => ({
  id: faker.random.numeric(6),
  name: faker.name.fullName(),
  gender: sample(['F', 'M']),
  admissiondate: format(faker.date.recent(), 'dd/MM/yyyy'),
  consultant: `Dr. ${faker.name.lastName()}`,
  status: sample(['Low', 'Medium', 'High']),
  ward: sample([
    'Reh Wd 1',
    'Reh Wd 2',
    'Reh Wd 3',
    'Reh Wd 4',
    'Reh Wd 5',
    'Reh Wd 6',
    'Reh Wd 7',
    'Reh Wd 8',
    'Reh Wd 9',
    'Reh Wd 10'
  ]),
}));

export default users;
