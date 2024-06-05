import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, serviceRoleKey)

export async function dbTruncate(tableName) {
    // Delete all rows from the table
    const { data, error } = await supabase.from(tableName).delete().neq('id', 0)
    if (error) throw new Error(`Error truncating table ${tableName}: ${error.message}`)
    console.log(`Table ${tableName} truncated successfully`)
}

export async function dbStore(tableName, newData) {
    const upsertData = [...newData].map((e) => {
        return {
            id: e.id,
            text: e.text,
            author: e.author,
            title: e.title,
            likes: e.likes,
        }
    })
    // Insert new data into the table
    const { data, error } = await supabase.from(tableName).upsert(upsertData)
    if (error) throw new Error(`Error inserting data into ${tableName}: ${error.message}`)
    console.log('Data inserted successfully')
}

export async function dbSelect(tableName, query) {
    const { data, error } = await supabase.from(tableName).select(query)
    if (error) throw new Error(`Error selecting data from ${tableName}: ${error.message}`)
    return data
}

export async function dbFunction(tableName, functionName) {
    const { data, error } = await supabase.rpc(functionName)
    if (error) throw new Error(`Error selecting data from ${tableName}: ${error.message}`)
    return data
}
