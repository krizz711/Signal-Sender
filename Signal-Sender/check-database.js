// Quick script to check database connection
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

console.log("🔍 Checking database configuration...\n");

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not set!");
  console.log("\n📝 Please create a .env file with:");
  console.log("   DATABASE_URL=your_postgresql_connection_string");
  console.log("\n💡 Options:");
  console.log("   1. Use your Replit database:");
  console.log("      DATABASE_URL=postgresql://postgres:password@helium/heliumdb?sslmode=disable");
  console.log("\n   2. Use a free cloud database:");
  console.log("      - Supabase: https://supabase.com");
  console.log("      - Neon: https://neon.tech");
  process.exit(1);
}

console.log("✅ DATABASE_URL is set");
console.log(`   Connection: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

console.log("🔌 Testing database connection...");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("SELECT NOW() as current_time, version() as pg_version")
  .then((result) => {
    console.log("✅ Database connection successful!");
    console.log(`   PostgreSQL Version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
    console.log(`   Current Time: ${result.rows[0].current_time}\n`);
    
    // Check if tables exist
    return pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('recipients', 'alert_logs')
      ORDER BY table_name;
    `);
  })
  .then((result) => {
    const tables = result.rows.map(r => r.table_name);
    
    if (tables.length === 0) {
      console.log("⚠️  Database tables not found!");
      console.log("   Run: npm run db:push");
    } else if (tables.length === 2) {
      console.log("✅ Database tables exist:");
      tables.forEach(t => console.log(`   - ${t}`));
      console.log("\n🎉 Database is fully provisioned and ready!");
    } else {
      console.log("⚠️  Some tables are missing:");
      const expected = ['recipients', 'alert_logs'];
      expected.forEach(t => {
        if (tables.includes(t)) {
          console.log(`   ✅ ${t}`);
        } else {
          console.log(`   ❌ ${t} (missing)`);
        }
      });
      console.log("\n   Run: npm run db:push");
    }
    
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Database connection failed!");
    console.error(`   Error: ${error.message}\n`);
    console.log("💡 Troubleshooting:");
    console.log("   1. Verify your DATABASE_URL is correct");
    console.log("   2. Check if the database server is running");
    console.log("   3. Verify network connectivity to the database");
    pool.end();
    process.exit(1);
  });

