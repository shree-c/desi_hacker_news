import { randomUUID } from 'crypto'
import { db_store_cookie_for_username, 
  db_get_user_from_auth_token } from './sql_functions/transactions.js'

export function gen_cookie(un: string, d: Date): string {
  const cookie = randomUUID()
  db_store_cookie_for_username(un, d.getTime() + '', cookie)
  return cookie
}

export function get_username_from_auth_token(auth_token: string): any {
  const auth_object = db_get_user_from_auth_token(auth_token)
  if (auth_object)
    return auth_object.username
  else
    throw new Error('E-10')
}

