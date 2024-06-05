import { dbSelect } from './lib/db.js'

const dbTable = process.env.QUOTES_TABLE

export async function main() {
    const body = await dbSelect(dbTable)
    return { body: JSON.stringify(body) }
}
