var express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
  fs.readdir(__dirname, (err, list) => {
      if (err) {
          console.log('Empty dirname', err);
          res.json(err);
      } else {
          res.json(list);
      }
  });
});

module.exports = app;
