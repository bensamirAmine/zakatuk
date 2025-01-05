import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for your project',
        },
        servers: [
            {
                url: 'http://localhost:1919', // Replace with your base URL
            },
        ],
    },
    apis: ['./routes/**/*.js'], // Path to your route files
};

// Generate Swagger documentation
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Export swaggerUi and swaggerDocs
export { swaggerUi, swaggerDocs };
