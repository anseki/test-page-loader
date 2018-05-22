/* eslint-env node, es6 */

'use strict';

const
  DOC_ROOT = __dirname,
  PORT = 8080,

  logger = (() => {
    const log4js = require('log4js');
    log4js.configure({
      appenders: {
        out: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: '%[[%r]%] %m' // Super simple format
          }
        }
      },
      categories: {default: {appenders: ['out'], level: 'info'}}
    });
    return log4js.getLogger('node-static-alias');
  })(),

  staticAlias = new (require('node-static-alias')).Server(DOC_ROOT, {
    cache: false,
    headers: {'Cache-Control': 'no-cache, must-revalidate'},
    alias: [
      {
        match: '/test-page-loader.js',
        serve: '../test-page-loader.js',
        allowOutside: true
      }
    ],
    logger
  });

require('http').createServer((request, response) => {
  request.addListener('end', () => {
    staticAlias.serve(request, response, error => {
      if (error) {
        response.writeHead(error.status, error.headers);
        logger.error('(%s) %s', request.url, response.statusCode);
        if (error.status === 404) {
          response.end('Not Found');
        }
      } else {
        logger.info('(%s) %s', request.url, response.statusCode);
      }
    });
  }).resume();
}).listen(PORT);

console.log(`START: http://localhost:${PORT}/\nROOT: ${DOC_ROOT}`);
console.log('(^C to stop)');
