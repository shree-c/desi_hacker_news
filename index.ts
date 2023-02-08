import express from 'express'
import main_router from './routes/main.js'
import env from 'env-var'

const PORT = env.get('PORT').required().asPortNumber()

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use('/', main_router)

app.listen(PORT, () => console.log(`listining at ${PORT}`))
