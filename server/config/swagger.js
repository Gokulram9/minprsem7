const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Court Case Scheduling & Legal Aid Portal API Docs',
    version: '1.0.0',
    description: 'API Documentation for the Advanced Legal Aid & Courtroom Portal system.',
    contact: {
      name: 'Super Admin Support Desk',
      email: 'gokulrams.cs23@bitsathy.ac.in'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ['./server/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
