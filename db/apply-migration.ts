import postgres from "postgres"
import * as dotenv from "dotenv"
import * as path from "path"
import * as fs from "fs"

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const sql = postgres(process.env.DATABASE_URL!, {
	max: 1,
})

async function applyMigration() {
	try {
		console.log("Applying migration")

		const migrationPath = path.join(
			__dirname,
			"migrations",
			"0007_ancient_star_brand.sql"
		)
		const migrationSQL = fs.readFileSync(migrationPath, "utf-8")

		// Split by statement-breakpoint and execute each statement
		const statements = migrationSQL
			.split("--> statement-breakpoint")
			.map((s) => s.trim())
			.filter((s) => s.length > 0)

		for (const statement of statements) {
			console.log(`Executing: ${statement.substring(0, 50)}...`)
			await sql.unsafe(statement)
		}

		console.log("✅ Migration applied successfully!")
	} catch (error) {
		console.error("❌ Migration failed:", error)
		process.exit(1)
	} finally {
		await sql.end()
	}
}

applyMigration()
