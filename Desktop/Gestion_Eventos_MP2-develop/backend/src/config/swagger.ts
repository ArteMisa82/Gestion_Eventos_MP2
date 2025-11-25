import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Eventos - UTA',
      version: '1.0.0',
      description: 'Documentación de la API REST para el sistema de gestión de eventos académicos de la Universidad Técnica de Ambato',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'soporte@uta.edu.ec'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido del login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error description'
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id_usu: {
              type: 'string',
              example: '1'
            },
            nom_usu: {
              type: 'string',
              example: 'Juan'
            },
            ape_usu: {
              type: 'string',
              example: 'Pérez'
            },
            ced_usu: {
              type: 'string',
              example: '1234567890'
            },
            cor_usu: {
              type: 'string',
              example: 'juan.perez@uta.edu.ec'
            },
            tel_usu: {
              type: 'string',
              example: '0987654321'
            },
            niv_usu: {
              type: 'string',
              example: 'Pregrado'
            }
          }
        },
        Evento: {
          type: 'object',
          properties: {
            id_evt: {
              type: 'string',
              example: '1'
            },
            nom_evt: {
              type: 'string',
              example: 'Curso de TypeScript'
            },
            fec_evt: {
              type: 'string',
              format: 'date',
              example: '2025-12-01'
            },
            lug_evt: {
              type: 'string',
              example: 'Auditorio Principal'
            },
            mod_evt: {
              type: 'string',
              example: 'Presencial'
            },
            ima_evt: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/image.jpg'
            }
          }
        },
        DetalleEvento: {
          type: 'object',
          properties: {
            id_det: {
              type: 'string',
              example: '1'
            },
            hor_det: {
              type: 'number',
              example: 40
            },
            are_det: {
              type: 'string',
              example: 'SOFTWARE'
            },
            cat_det: {
              type: 'string',
              example: 'CURSO'
            },
            tip_evt: {
              type: 'string',
              example: 'CURSO'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
