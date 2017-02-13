//"use strict";
const express = require("express");
const dblogic = require("./dblogic");

const app = express();

app.get('/', (req, res) => {
  res.end('Goto /new/:url to insert a new url, or go to /$shortUrl$ to be redirected to the corresponding page');
});

app.get('/new/:url', (req, res) => {
  //add url
  dblogic.addUrl(req.params.url)
  .then(key => {
    // it will call it with the final keyition
    console.log('url key: ' + key);
    let obj = {original_url: req.params.url, short_url: "https://dgr-url-shortener.herokuapp.com/" + key}
    res.json(obj);
    res.end();
  })
  .catch(err => {
    console.log("there was an error adding the url:");
    console.log(err);
    res.end("There was an error. Please try again");
  })
});

/**
 * Add a specific route to `/favicon.ico` to avoid getting a request and
 * interpreting it as a `/:key request`, with `key` = "favicon.ico"
 */
app.get('/favicon.ico', (req, res) => {
  // do nothing
  res.end();
});

app.get('/:key', (req, res, next) => {
  console.log('Se llama a get /:key con key: ' + req.params.key);
  dblogic.getUrl(req.params.key).
  then(url => {
    // it should redirect to the url
    //res.end('url stored: ' + url);
    res.redirect("http://" +url);
  })
  .catch(err => {
    console.log("there was an error retrieving the url:");
    console.log(err);
    res.end("There was an error. Please, check that the key is correct");
  });
});

app.use( (req,res) => {
  console.log('Entra en el middleware');
  res.end('Nada por aquí');
} );

app.listen(process.env.PORT);
console.log('App listening on port ' + process.env.PORT);

module.exports = app; // for testing