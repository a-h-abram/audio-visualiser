#!/usr/bin/env nodejs

const express = require('express');
const twig = require('twig');
const bodyParser = require('body-parser');
const app = express();
const webRoutes = require('./src/routes/web/index');

app.set("twig options", {
    allow_async: false, // Allow asynchronous compiling
    strict_variables: false
});

app.set('views', __dirname + '/src/views');
app.engine('html', twig.__express);

app.set('view cache', false);

app.use('/audio-visualiser', webRoutes);

app.use(express.static('public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/views', express.static(__dirname + '/src/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(8080,function(){
    console.log("Audio Visualiser: Run at Port 8080");
});