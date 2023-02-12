import EventEmitter from 'events';
import { db_clear_cookie } from '../lib/sql_functions/transactions.js';

export function handle_controller_events(emitter: EventEmitter): void {
  emitter.on('clearCookie', (un) => {
    db_clear_cookie(un)
    console.log('cleared cookie')
  })
}
