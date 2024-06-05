import express from 'express'
import { main as scrapeQuotes } from './packages/bookQuotes/scrapeQuotes/index.mjs'
import { main as getQuotes } from './packages/bookQuotes/getQuotes/index.mjs'
import { main as getRandomQuote } from './packages/bookQuotes/getRandomQuote/index.mjs'
const app = express()
const port = 3000

app.post('/quotes/scrape', async (req, res) => {
    await scrapeQuotes()
    res.send('Quotes Stored Successfully')
})

app.get('/quotes', async (req, res) => {
    let quotes = await getQuotes()
    res.send(quotes.body)
})

app.get('/quotes/random', async (req, res) => {
    const quotes = await getRandomQuote()
    res.send(quotes.body)
})

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`)
})
