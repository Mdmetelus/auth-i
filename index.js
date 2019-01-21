const server = require('./server');


const port = process.env.PORT || 4949;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on === \n=== http://localhost:${port} ===\n`);
});
