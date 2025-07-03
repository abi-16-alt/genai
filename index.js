const express = require('express');
const app = express();
const port = 3000;

const jsonld = require('./data.json');
app.use(require('cors')());

// Serve JSON-LD at /data
app.get('/data', (req, res) => {
  res.json(jsonld);
});

// Serve static frontend from /public
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
