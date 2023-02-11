import { scrypt, randomBytes, BinaryLike } from 'crypto'
//error handling is needed

export function generateSalt(size: number): Promise<BinaryLike> {
  return new Promise((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err)
        reject(err)
      resolve(buf.toString('hex'))
    })
  })
}

export function generatePasswordHash(pass: string, salt: string | BinaryLike): Promise<string | Error> {
  return new Promise(async (resolve, reject) => {
    scrypt(pass, salt, 32, (err, key) => {
      if (err)
        reject(err)
      resolve(key.toString('hex') + salt)
    })
  })
}

export function check_password(pass: string, hash: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const salt = hash.slice(64)
    const pass_hash = hash.slice(0, 64)
    const generated_hash = await generatePasswordHash(pass, salt)
    if (pass_hash === generated_hash)
      resolve(true)
    else
      resolve(false)
  })
}
