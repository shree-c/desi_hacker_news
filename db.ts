import Database from 'better-sqlite3'
import env from 'env-var'
import * as dotenv from 'dotenv'

dotenv.config()

const DB_PATH: string = env.get('DB_PATH').required().asString()

const db = new Database(DB_PATH)

export default db
