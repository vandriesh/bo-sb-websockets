import { Request, Response } from 'express';
import type { Event } from '../../types';

// Transform the mock data to match the new structure
const transformedMockEvents: Event[] = [
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
    suspended: false
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
    suspended: false
  }
];

export const getEvents = (_req: Request, res: Response) => {
  res.json(transformedMockEvents);
};