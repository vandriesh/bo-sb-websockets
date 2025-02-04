import type { Event } from '../types';
import { IdRanges } from '../common/socket/protocol';

export const mockEvents: Event[] = [
  {
    id: 1,
    name: 'Manchester United vs Liverpool',
    market: 1000,
    selections: [
      {
        id: 10001,
        name: 'Manchester United (1)',
        price: 2.5
      },
      {
        id: 10002,
        name: 'Draw (X)',
        price: 3.4
      },
      {
        id: 10003,
        name: 'Liverpool (2)',
        price: 2.8
      }
    ],
    timestamp: Date.now(),
    suspended: false
  },
  {
    id: 2,
    name: 'Arsenal vs Chelsea',
    market: 1000,
    selections: [
      {
        id: 10004,
        name: 'Arsenal (1)',
        price: 2.1
      },
      {
        id: 10005,
        name: 'Draw (X)',
        price: 3.2
      },
      {
        id: 10006,
        name: 'Chelsea (2)',
        price: 3.6
      }
    ],
    timestamp: Date.now(),
    suspended: false
  }
];