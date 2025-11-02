const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  // We'll change this text later to test the pipeline
  res.send('Hello, World! This is version 1.'); 
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});