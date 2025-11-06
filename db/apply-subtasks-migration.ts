import postgres from "postgres"
import { config } from "dotenv"
import { readFileSync } from "fs"
import { join } from "path"

config({ path: ".env.local" })

async function applyMigration() {
	const sql = postgres(process.env.DATABASE_URL!, {
		max: 1,
	})

	try {
		console.log("📝 Reading migration file...")
		const migrationSQL = readFileSync(
			join(__dirname, "migrations", "0003_gray_true_believers.sql"),
			"utf-8"
		)

		console.log("🚀 Applying migration...")

		// Split by statement-breakpoint comments
		const statements = migrationSQL
			.split("--> statement-breakpoint")
			.map((s) => s.trim())
			.filter((s) => s.length > 0)

		for (const statement of statements) {
			console.log(`   Executing: ${statement.substring(0, 50)}...`)
			await sql.unsafe(statement)
		}

		console.log("✅ Migration applied successfully!")
		console.log("   Created subtasks table with foreign key constraint")
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("already exists")) {
				console.log("⚠️  Table already exists, skipping...")
			} else {
				console.error("❌ Migration failed:", error.message)
				throw error
			}
		}
	} finally {
		await sql.end()
	}
}

applyMigration().catch(console.error)
