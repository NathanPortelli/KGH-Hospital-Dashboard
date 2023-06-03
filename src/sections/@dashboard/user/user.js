import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

// ----------------------------------------------------------------------

const users = [...Array(24)].map((_, index) => ({
  id: faker.datatype.uuid(),
  name: faker.name.fullName(),
  gender: sample(['F', 'M']),
  consultant: `Dr. ${faker.name.lastName()}`,
  admissiondate: faker.date.recent(),
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
    'Reh Wd 10',
    'Reh Wd 11'
  ]),
}));

export default users;
