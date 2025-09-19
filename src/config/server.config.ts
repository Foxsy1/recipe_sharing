import { Application } from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from '../middleware/error.middleware';
import { Logger } from '../utils/logger.utils';

/**
 * Configure Swagger API documentation
 */
export function configureSwagger(app: Application, port: number): void {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Recipe Sharing API',
        version: '1.0.0',
        description: 'A comprehensive API for sharing and discovering recipes',
        contact: {
          name: 'API Support',
          email: 'support@recipeapi.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: 'Development server'
        },
        {
          url: 'https://api.recipeapp.com',
          description: 'Production server'
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'User authentication and account management endpoints'
        },
        {
          name: 'User Profile',
          description: 'User profile management and social features'
        },
        {
          name: 'Recipe Management',
          description: 'Create, update, delete, and retrieve recipes'
        },
        {
          name: 'Recipe Discovery',
          description: 'Search, filter, and discover recipes'
        },
        {
          name: 'Recipe Social',
          description: 'Like, rate, share, and interact with recipes'
        },
        {
          name: 'User Favorites',
          description: 'Manage user favorite recipes'
        },
        {
          name: 'Comments',
          description: 'Recipe comments and discussions'
        },
        {
          name: 'Notifications',
          description: 'User notifications and messaging'
        },
        {
          name: 'Categories',
          description: 'Recipe categories, cuisines, and tags'
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
      }
    },
    apis: [
      process.env.NODE_ENV === 'production' 
        ? ['./dist/routes/*.js', './dist/models/*.js']
        : ['./src/routes/*.ts', './src/models/*.ts']
    ].flat()
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  
  // Debug: Log if swagger docs are generated properly
  Logger.debug(`Swagger docs generated: ${swaggerDocs ? 'Success' : 'Failed'}`, 'SWAGGER');
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .opblock-tag { margin-bottom: 20px; }
      .swagger-ui .opblock-tag-section { margin-bottom: 30px; }
      .swagger-ui .opblock { margin-bottom: 10px; }
    `,
    customSiteTitle: 'Recipe Sharing API Documentation'
  }));
  
  Logger.info('Swagger documentation configured at /api-docs', 'SWAGGER');
}

/**
 * Configure global error handling
 */
export function configureErrorHandling(app: Application): void {
  app.use(errorHandler);
}

/**
 * Initialize server configuration
 */
export function initializeServerConfig(app: Application, port: number): void {
  configureSwagger(app, port);
  configureErrorHandling(app);
}

/**
 * Start the server and display startup information
 */
export function startServer(app: Application, port: number): void {
  app.listen(port, () => {
    Logger.logServerStartup(port);
  });
}