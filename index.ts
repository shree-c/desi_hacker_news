import express from 'express'
import main_router from './routes/main.js'
import env from 'env-var'
import error_map from './lib/error_map.js'

const PORT = env.get('PORT').required().asPortNumber()

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use('/', main_router)

app.use((err, req, res, next) => {
  res.send(error_map[err.message] || 'internal server error')
})
app.listen(PORT, () => console.log(`listining at ${PORT}`))
