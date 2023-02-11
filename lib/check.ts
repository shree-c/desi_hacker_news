import { check_password } from './auth/user.js'
import { db_does_user_exist, db_fetch_user } from './sql_functions/transactions.js'

export function check_username_rules(un): void {
  if (un.length < 2 && un.length > 20) {
    throw new Error('E-1')
  } else if (!/^[a-zA-Z0-9_\-]{2,20}$/.test(un)) {
    throw new Error('E-2')
  }
}

export function check_username_should_not_exist(un: string): void {
  if (db_does_user_exist(un)) {
    throw new Error('E-4')
  }
}

export function check_password_rule(pass: string): void {
  if (pass.length < 8 || pass.length > 20) {
    throw new Error('E-5')
  }
}

export function check_username_exists(un: string): void {
  if (!db_does_user_exist(un)) {
    throw new Error('E-6')
  }
}

export async function check_pass_for_username(un: string, pass: string) {
  const user = db_fetch_user(un)
  if (!user) {
    throw new Error('E-6')
  } else {
    if (await check_password(user.password, pass)) {
      throw new Error('E-7')
    }
  }
}
