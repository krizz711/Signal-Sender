// Helper script to properly encode password in connection string
const password = "JJ!meYfe%3nX?9Z";

// URL encode the password (special characters need encoding)
const encodedPassword = encodeURIComponent(password);

console.log("Original password:", password);
console.log("URL Encoded:", encodedPassword);
console.log("\nYour DATABASE_URL should be:");
console.log(`DATABASE_URL=postgresql://postgres:${encodedPassword}@helium/heliumdb?sslmode=disable`);

