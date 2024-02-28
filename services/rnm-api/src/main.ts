// This could be express, fastify, or any other web framework
// but for this example we are using the built-in http module
import * as http from 'http';
import { URL } from 'url';
import { GetCharacterController } from './rick-and-morty';

// Export so that it can be used by the client
export type { GetCharacterController } from './rick-and-morty';

const hostname = '127.0.0.1';
const port = 3333;

const getCharacterController = new GetCharacterController();

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || '', `http://${req.headers.host}`);

  if (reqUrl.pathname === '/character' && req.method === 'GET') {
    try {
      // Extract query parameters
      const queryParameters = Object.fromEntries(reqUrl.searchParams.entries());

      // Call the controller's execute method
      const response = await getCharacterController.execute({
        queryParameters,
      });

      res.statusCode = response.statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
      res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow GET requests
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow requests with Content-Type header

      res.end(JSON.stringify(response.body));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
      res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow GET requests
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow requests with Content-Type header

      res.end(
        JSON.stringify({ message: 'Internal server error', type: 'error' })
      );
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET'); // Allow GET requests
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow requests with Content-Type header

    res.end(JSON.stringify({ message: 'Not Found', type: 'error' }));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
