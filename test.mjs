import { randomBytes, scryptSync, scrypt } from 'crypto'

const salt = 'f9d1741cb88ddbf64a0b1514961040bb'

console.log(salt, salt.length)

const hash = scrypt('some_pass', salt, 32).toString('hex')

const prev = '0c85a779002165ab4c0fd8d59e6e64f0b7640e00e21609e8571e71e8ba957556'
console.log(hash, hash.length, hash === prev)


