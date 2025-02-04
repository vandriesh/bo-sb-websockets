import { Request, Response } from 'express';
import { mockEvents } from '../../__fixtures__/mock_data';

export const getEvents = (_req: Request, res: Response) => {
  console.log('📦 [API] Sending events:', mockEvents);
  res.json(mockEvents);
};