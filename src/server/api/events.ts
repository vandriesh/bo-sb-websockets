import { Request, Response } from 'express';
import { mockEvents } from '../../__fixtures__/mock_data';

export const getEvents = (_req: Request, res: Response) => {
  res.json(mockEvents);
};