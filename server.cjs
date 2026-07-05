// Entry file for Hostinger Business Node.js Hosting
// Configured for Node 22.x, Express, and MySQL

// Require the backend Express application
// The backend app already handles serving the API and the React 'dist' static files.
const app = require('./backend/index.js');

// Hostinger (via Passenger) or local testing will provide process.env.PORT
const PORT = process.env.PORT || 5000;

// Start the server
// Note: Passenger often hijacks the HTTP module so listen isn't strictly required, 
// but it is best practice and ensures it works locally and on Hostinger's newer setups.
app.listen(PORT, () => {
    console.log(`\n🚀 Hostinger Server Entry Point running on port ${PORT}`);
    console.log(`Ensure 'npm run build' has been run to generate the 'dist' folder for frontend serving.\n`);
});
