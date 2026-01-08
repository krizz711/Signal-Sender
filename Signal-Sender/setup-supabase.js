// Helper to construct Supabase connection string
import "dotenv/config";

const password = "JJ!meYfe%3nX?9Z";
const encodedPassword = encodeURIComponent(password);

console.log("🔧 Supabase Connection String Builder\n");

console.log("Your password:", password);
console.log("URL Encoded:", encodedPassword);
console.log("\n");

// If user provides project ref and region via command line
const projectRef = process.argv[2];
const region = process.argv[3];

if (projectRef && region) {
  // Pooler connection (recommended)
  const poolerUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  
  // Direct connection
  const directUrl = `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`;
  
  console.log("✅ Generated Connection Strings:\n");
  console.log("📌 Pooler (Recommended):");
  console.log(poolerUrl);
  console.log("\n📌 Direct:");
  console.log(directUrl);
  console.log("\n💡 Add the POOLER one to your .env file as DATABASE_URL");
} else {
  console.log("📋 To use this script:");
  console.log("   node setup-supabase.js [PROJECT-REF] [REGION]");
  console.log("\n   Example:");
  console.log("   node setup-supabase.js abcdefghijklmnop us-east-1");
  console.log("\n💡 Or just copy the URI from Supabase dashboard:");
  console.log("   Settings → Database → Connection string → URI");
  console.log("   Then replace [YOUR-PASSWORD] with your password");
}

