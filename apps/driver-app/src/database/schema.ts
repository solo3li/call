import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'delivery_routes',
      columns: [
        { name: 'order_id', type: 'string' },
        { name: 'polyline', type: 'string' },
        { name: 'estimated_duration', type: 'number' },
        { name: 'status', type: 'string' },
      ]
    }),
    tableSchema({
      name: 'driver_earnings',
      columns: [
        { name: 'driver_id', type: 'string' },
        { name: 'period_start', type: 'number' },
        { name: 'period_end', type: 'number' },
        { name: 'base_pay', type: 'number' },
        { name: 'tips', type: 'number' },
        { name: 'bonuses', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'offline_sync_actions',
      columns: [
        { name: 'action_type', type: 'string' },
        { name: 'payload', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'status', type: 'string' },
      ]
    })
  ]
});
