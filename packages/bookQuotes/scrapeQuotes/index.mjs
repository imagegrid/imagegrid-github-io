import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { dbSelect, dbStore } from './lib/db.js'

const dbTable = process.env.QUOTES_TABLE
let minLikeLimit = 100
let currentMaxLikes = 0
let quoteId = 0

export async function main() {
    let page = 1
    let quotes = []

    const quotesUrl = await getQuotesPageUrl()

    // Get the quotes
    do {
        let html = await getQuotePageHtml(quotesUrl, page)
        let newQuotes = extractQuotes(html)
        currentMaxLikes = Math.max(...newQuotes.map((obj) => obj.likes))
        newQuotes = newQuotes.filter((e) => e.likes > minLikeLimit)
        quotes.push(...newQuotes)
        page++
        await sleep(1000)
    } while (currentMaxLikes >= minLikeLimit && page < 100)

    quoteId = 0

    // Store the quotes in a database
    await dbStore(dbTable, quotes)

    const body = await dbSelect(dbTable)
    return { body: JSON.stringify(body) }
}

async function getQuotesPageUrl() {
    // A direct url to author's page may change without notice.
    // Instead use search page to locate link to author's quotes

    const searchPageHtml = await getHTML(
        'https://www.goodreads.com/search?utf8=%E2%9C%93&q=William+Shakespeare&search_type=quotes&search%5Bfield%5D=author'
    )
    const dom = new JSDOM(searchPageHtml)
    const url = dom.window.document.getElementsByClassName('authorOrTitle')[0].getAttribute('href')

    return `https://goodreads.com/${url}`
}

async function getQuotePageHtml(quotesUrl, page) {
    try {
        const url = `${quotesUrl}?page=${page}`
        return await getHTML(url)
    } catch (error) {
        console.error('An error occurred:', error.message)
        throw error
    }
}

function extractQuotes(html) {
    const dom = new JSDOM(html)
    const quoteElements = Array.from(dom.window.document.querySelectorAll('.quote'))
    const quoteArray = quoteElements.map((quoteElement, index) => {
        const text = quoteElement
            .querySelector('.quoteText')
            .innerHTML.split('―')[0]
            .replace(/\n|“|”|<br\s*\/?>\s*$/g, '')
            .trim()
        const author = quoteElement.querySelectorAll('.authorOrTitle')[0]?.innerHTML.replace(',', '').trim()
        const title = quoteElement.querySelectorAll('.authorOrTitle')[1]?.innerHTML.trim()
        const quoteFooterElement = quoteElement.querySelector('.quoteFooter')
        const likesText = quoteFooterElement.querySelector('.right > .smallText').textContent
        const likes = parseInt(likesText.match(/\d+/)[0])
        quoteId++

        return {
            id: quoteId,
            text: text,
            author: author,
            title: title,
            likes: likes,
        }
    })
    return quoteArray
}

async function getHTML(url) {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const htmlContent = await response.text()
        return htmlContent
    } catch (error) {
        console.error('Error fetching data:', error)
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
