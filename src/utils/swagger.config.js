import swaggerJsDoc from 'swagger-jsdoc';

export const getSwaggerSpec = () => {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Eco-Watch API',
                version: '1.0.0',
                description: 'API documentation for the Eco-Watch project'
            },
            servers: [
                {
                    url: `${process.env.SWAGGER_URL}/api/v1`
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
        },
        apis: ['./src/routers/*.js']
    };

    return swaggerJsDoc(options);
};
