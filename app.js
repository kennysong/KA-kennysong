var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();

app.use(express.static(__dirname + '/static'));
app.use(morgan('combined'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/templates/index.html');
});

app.listen(process.env.PORT || 5000);