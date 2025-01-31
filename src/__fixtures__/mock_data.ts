import type { Event } from '../types';

export const mockEvents: Event[] = [
  {
    id: 'event1',
    name: 'Manchester United vs Liverpool',
    market: 'Match Winner',
    selections: [
      {
        id: 'sel1',
        name: 'Manchester United (1)',
        price: 2.5
      },
      {
        id: 'sel2',
        name: 'Draw (X)',
        price: 3.4
      },
      {
        id: 'sel3',
        name: 'Liverpool (2)',
        price: 2.8
      }
    ],
    timestamp: Date.now(),
    suspended: false
  },
  {
    id: 'event2',
    name: 'Arsenal vs Chelsea',
    market: 'Match Winner',
    selections: [
      {
        id: 'sel4',
        name: 'Arsenal (1)',
        price: 2.1
      },
      {
        id: 'sel5',
        name: 'Draw (X)',
        price: 3.2
      },
      {
        id: 'sel6',
        name: 'Chelsea (2)',
        price: 3.6
      }
    ],
    timestamp: Date.now(),
    suspended: false
  }
];