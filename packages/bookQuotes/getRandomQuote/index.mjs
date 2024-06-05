import { dbFunction } from './lib/db.js'

const dbTable = process.env.QUOTES_TABLE

export async function main() {
    const body = await dbFunction(dbTable, 'get_random_quote')
    return { body: JSON.stringify(body) }
}
