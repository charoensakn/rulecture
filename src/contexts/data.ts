import { createContext } from 'react';
import { Material } from '../db/MaterialFs';
import { Notification } from '../db/NotificationFs';

export const DataContext = createContext<{
  materials: Material[];
  notifications: Notification[];
}>({
  materials: [],
  notifications: [],
});
