const express = require('express');
const app = express();
const PORT = 3000;

// --- Update this version number every time you deploy ---
const VERSION = "4.0 (Now with HTML & CSS!)"; 

app.get('/', (req, res) => {
  
  // We'll send back a full HTML page with inline CSS for styling
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CI/CD Pipeline</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #2c3e50; /* Dark blue background */
        }
        .container {
          text-align: center;
          background-color: #ffffff;
          padding: 2rem 3rem;
          border-radius: 10px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        h1 {
          color: #2c3e50; /* Dark blue text */
          margin-bottom: 0.5rem;
        }
        p {
          color: #34495e; /* Lighter blue-gray text */
          font-size: 1.1rem;
        }
        .version-badge {
          background-color: #3498db; /* Bright blue badge */
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: bold;
          display: inline-block;
          margin-top: 1.5rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>CI/CD Pipeline Succeeded!</h1>
        <p>This application was deployed automatically by Jenkins.</p>
        <div class="version-badge">
          Version: ${VERSION}
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// A simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});