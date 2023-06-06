import { useEffect, useState } from 'react';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
// ----------------------------------------------------------------------

const account = {
  displayName: 'Francesca Muscat',
  email: 'francesca.muscat@gov.mt',
  // photoURL: '/assets/images/avatars/avatar_default.jpg',
};

export default account;
