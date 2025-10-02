// eslint-disable-next-line @typescript-eslint/no-explicit-any
import postgres from 'postgres'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const connectionString = process.env.DATABASE_URL || ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sql = postgres(connectionString) as postgres.Sql<Record<string, any>>

export default sql
