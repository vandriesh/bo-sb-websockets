import type { Event } from '../types';
import { IdRanges } from '../common/socket/protocol';

export const mockEvents: Event[] = [
  {
    id: 1,
    name: 'Manchester United vs Liverpool',
    markets: [
      {
        id: 1000,
        name: 'Match Result',
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
        ]
      }
    ],
    timestamp: Date.now(),
    suspended: false,
    status: 'live',
    startTime: '2024-03-10T15:00:00Z',
    score: {
      home: 2,
      away: 1
    },
    timeElapsed: 67
  },
  {
    id: 2,
    name: 'Arsenal vs Chelsea',
    markets: [
      {
        id: 1001,
        name: 'Match Result',
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
        ]
      }
    ],
    timestamp: Date.now(),
    suspended: false,
    status: 'live',
    startTime: '2024-03-10T14:30:00Z',
    score: {
      home: 0,
      away: 0
    },
    timeElapsed: 23
  },
  {
    id: 3,
    name: 'Manchester City vs Tottenham',
    markets: [
      {
        id: 1002,
        name: 'Match Result',
        selections: [
          {
            id: 10007,
            name: 'Manchester City (1)',
            price: 1.8
          },
          {
            id: 10008,
            name: 'Draw (X)',
            price: 3.5
          },
          {
            id: 10009,
            name: 'Tottenham (2)',
            price: 4.2
          }
        ]
      }
    ],
    timestamp: Date.now(),
    suspended: false,
    status: 'upcoming',
    startTime: '2024-03-10T17:30:00Z'
  },
  {
    id: 4,
    name: 'Newcastle vs Aston Villa',
    markets: [
      {
        id: 1003,
        name: 'Match Result',
        selections: [
          {
            id: 10010,
            name: 'Newcastle (1)',
            price: 2.2
          },
          {
            id: 10011,
            name: 'Draw (X)',
            price: 3.3
          },
          {
            id: 10012,
            name: 'Aston Villa (2)',
            price: 3.1
          }
        ]
      }
    ],
    timestamp: Date.now(),
    suspended: false,
    status: 'upcoming',
    startTime: '2024-03-10T20:00:00Z'
  }
];