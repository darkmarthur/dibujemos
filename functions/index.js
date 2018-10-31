const functions = require('firebase-functions');

/**
 * Module dependencies.
 */

var express = require('express');
var errorHandler = require('express-error-handler');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var connections = 0;

var app = express();
var server = http.createServer(app);
io = io.listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/demo', (req, res) => {
  res.render('index', { title: 'Dibujemos' });
});

exports.demoapp = functions.https.onRequest(app);


// io.set('log level', 1);

// Escuchamos conexiones entrantes
io.sockets.on('connection', (socket) => {
  connections++;
  console.log('connected', connections);
  socket.broadcast.emit('connections', {connections:connections});

  // Detectamos eventos de mouse
  socket.on('mousemove', (data) => {
    // transmitimos el movimiento a todos los clientes conectados
    socket.broadcast.emit('move', data);
  });

  socket.on('disconnect', () => {
    connections--;
    console.log('connected', connections);
    socket.broadcast.emit('connections', {connections:connections});
  });
});


server.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
