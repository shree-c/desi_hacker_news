import { Request, Response, NextFunction } from 'express'
import { add_post } from '../lib/sql_functions/transactions.js'

export async function create_post(req: Request, res: Response, next: NextFunction) {
  add_post(req.body)
  res.send('done')
}
