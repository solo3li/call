import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
// Import models when created
// import DeliveryRoute from './models/DeliveryRoute';
// import DriverEarnings from './models/DriverEarnings';
// import OfflineSyncAction from './models/OfflineSyncAction';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'driverApp',
  // jsi: true, // Uncomment if using JSI for faster DB access
  onSetUpError: error => {
    console.error('Database setup failed', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    // DeliveryRoute, DriverEarnings, OfflineSyncAction
  ],
});
