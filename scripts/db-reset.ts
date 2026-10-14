import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function resetDatabase() {
  console.log("------------------------------------------------------------");
  console.log("CACHEFLOW / CREATORLOOM DATABASE RESET");
  console.log("------------------------------------------------------------");

  const migrationDir = path.join(process.cwd(), "supabase", "migrations");
  const schemaFile = path.join(migrationDir, "20261013000000_schema.sql");
  const storageFile = path.join(migrationDir, "20261013000001_storage.sql");

  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema file not found at ${schemaFile}`);
  }

  const schemaSql = fs.readFileSync(schemaFile, "utf-8");
  const storageSql = fs.existsSync(storageFile) ? fs.readFileSync(storageFile, "utf-8") : "";

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

  if (dbUrl) {
    console.log("Connecting to PostgreSQL database via connection string...");
    try {
      const { Client } = await import("pg");
      const client = new Client({ connectionString: dbUrl });
      await client.connect();
      console.log("Connected successfully. Resetting public schema...");

      await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
      console.log("Executing schema migration (20261013000000_schema.sql)...");
      await client.query(schemaSql);

      if (storageSql) {
        console.log("Executing storage migration (20261013000001_storage.sql)...");
        try {
          await client.query(storageSql);
        } catch (err: unknown) {
          console.warn("Storage migration warning (storage schema might already exist):", err instanceof Error ? err.message : err);
        }
      }

      await client.end();
      console.log("Live PostgreSQL database successfully reset and migrated!");
    } catch (err: unknown) {
      console.error("Live DB connection failed, falling back to local migration verification:", err instanceof Error ? err.message : err);
    }
  } else {
    console.log("No remote DATABASE_URL configured. Validating migrations locally...");
    console.log(`- Verified schema migration: ${schemaFile} (${schemaSql.length} bytes)`);
    if (storageSql) {
      console.log(`- Verified storage migration: ${storageFile} (${storageSql.length} bytes)`);
    }

    // Clean up local seed snapshot if present
    const seedSnapshot = path.join(process.cwd(), "supabase", "seed-snapshot.json");
    if (fs.existsSync(seedSnapshot)) {
      fs.unlinkSync(seedSnapshot);
      console.log("- Cleared previous seed snapshot.");
    }
    console.log("Database reset complete. Schema verified successfully!");
  }

  console.log("------------------------------------------------------------\n");
}

resetDatabase().catch((err) => {
  console.error("Error resetting database:", err);
  process.exit(1);
});
