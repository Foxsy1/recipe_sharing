# Recipe Sharing API

A comprehensive RESTful API for sharing, discovering, and interacting with recipes. Built with Node.js, TypeScript, and Express.js following enterprise-grade architectural patterns.

## Features

- **User Management**: Registration, authentication, profile management
- **Recipe Sharing**: Create, update, delete, and discover recipes
- **Advanced Search**: Filter by ingredients, cuisine, dietary restrictions, and more
- **Social Features**: Like, comment, rate, and share recipes
- **Community Interaction**: Follow users, save favorites, get notifications
- **Content Management**: Image upload, categorization, and tagging

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recipe-sharing-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
# Edit .env with your database and other configuration
```

4. Start the application:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The API will be available at `http://localhost:3000`

### API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

## Architecture

This API follows a **Modular Layered Architecture** with enterprise-grade design patterns:

- **Modular Controllers**: Domain-specific controllers with clear separation of concerns
- **Middleware Pipeline**: Authentication, validation, error handling, and logging
- **Type Safety**: Full TypeScript implementation with strict typing
- **Security**: JWT authentication, input validation, and sanitization
- **Documentation**: Comprehensive Swagger/OpenAPI 3.0 documentation

For detailed architectural information, see [Architecture Documentation](src/docs/ARCHITECTURE.md).

## API Reference

For comprehensive API documentation, see [API Reference](src/docs/API.md).

### Quick Reference

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Recipes
- `GET /api/recipes` - Get all recipes (with pagination)
- `GET /api/recipes/search` - Advanced recipe search
- `POST /api/recipes` - Create new recipe (auth required)
- `GET /api/recipes/:id` - Get recipe by ID
- `PUT /api/recipes/:id` - Update recipe (auth required)
- `DELETE /api/recipes/:id` - Delete recipe (auth required)

#### Social Features
- `POST /api/recipes/:id/like` - Like/unlike recipe
- `POST /api/recipes/:id/rate` - Rate recipe
- `POST /api/recipes/:id/share` - Share recipe
- `POST /api/users/follow/:userId` - Follow/unfollow user

#### Discovery
- `GET /api/recipes/categories` - Get all categories and tags
- `GET /api/recipes/featured` - Get featured recipes
- `GET /api/recipes/popular` - Get popular recipes
- `GET /api/recipes/cuisine/:type` - Get recipes by cuisine

For the complete API reference with request/response examples, see [API Documentation](src/docs/API.md).

## Technologies Used

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh token support
- **Validation**: Joi schema validation
- **Documentation**: Swagger/OpenAPI 3.0
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: bcrypt, CORS, helmet

## Project Structure

```
src/
├── controllers/        # Business logic (domain-specific)
├── models/            # Data models and schemas
├── routes/            # API endpoint definitions
├── middleware/        # Cross-cutting concerns
├── validation/        # Input validation schemas
├── config/            # Application configuration
├── utils/             # Shared utilities
├── docs/              # Documentation
└── types/             # TypeScript type definitions
```

## Development

### Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run test suite
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
```

### Environment Variables

Create a `.env` file with the following variables:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/recipe-sharing
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
FRONTEND_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [Architecture](src/docs/ARCHITECTURE.md) | [API Reference](src/docs/API.md)
- Issues: [GitHub Issues](https://github.com/your-repo/recipe-sharing-api/issues)
- Email: support@recipeapi.com

---

Built for the culinary community