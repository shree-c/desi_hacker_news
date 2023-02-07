import express from 'express'
import main_router from './routes/main.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use('/', main_router)

app.listen(4000, () => console.log('listining'))
