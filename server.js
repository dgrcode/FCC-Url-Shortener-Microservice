//"use strict";
const express = require("express");
const dblogic = require("./dblogic");

const app = express();

app.get('/', (req, res) => {
    res.end('Goto /new/:url to insert a new url, or go to /$shortUrl$ to be redirected to the corresponding page');
});

app.get('/new/:url', (req, res) => {
    //add url
    dblogic.addUrl(req.params.url, (pos) => {
        // it will call it with the final position
        console.log('Se añade la url en la pos: ' + pos);
        res.end('short url: ' + pos);
    });
});

app.get('/:pos', (req, res) => {
    //go to pos
});

app.use( (req,res) => {
    console.log('Entra en el middleware');
    res.end('Nada por aquí');
} );

app.listen(process.env.PORT);
console.log('App listening on port ' + process.env.PORT);

module.exports = app; // for testing