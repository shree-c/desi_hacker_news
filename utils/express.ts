import { Request, Response, NextFunction } from 'express'

export async function async_handler(fn: ((req: Request, res: Response) => Promise<void>) | ((req: Request, res: Response) => void) | ((req: Request, res: Response, next: NextFunction) => void) | ((req: Request, res: Response, next: NextFunction) => Promise<void>)) {
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      if (fn.constructor.name === 'AsyncFunction')
        fn(req, res, next)
      else
        await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
