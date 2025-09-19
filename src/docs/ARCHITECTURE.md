# Recipe Sharing API - Architecture Documentation

This document provides comprehensive documentation of the architectural patterns, design principles, and implementation details of the Recipe Sharing API.

## Table of Contents
1. [Core Architecture Patterns](#core-architecture-patterns)
2. [Enterprise Architecture Patterns](#enterprise-architecture-patterns)
3. [Design Principles](#design-principles)
4. [Directory Structure](#directory-structure)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Implementation Patterns](#implementation-patterns)
7. [Security Architecture](#security-architecture)
8. [Quality Metrics](#quality-metrics)
9. [Architectural Decision Records](#architectural-decision-records)

## Core Architecture Patterns

### 1. Modular Layered Architecture (MLA)
The application is structured in distinct layers with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│              Presentation Layer         │
│         (Routes + Middleware)           │
├─────────────────────────────────────────┤
│             Business Layer              │
│            (Controllers)                │
├─────────────────────────────────────────┤
│              Service Layer              │
│        (Models + Utilities)             │
├─────────────────────────────────────────┤
│             Data Access Layer           │
│           (MongoDB + Mongoose)          │
└─────────────────────────────────────────┘
```

### 2. Module Pattern & Separation of Concerns
Each domain is split into focused, single-responsibility modules:

**Controllers** (Business Logic):
- `recipe-crud.controller.ts` - Create, Read, Update, Delete operations
- `recipe-search.controller.ts` - Search and filtering logic  
- `recipe-engagement.controller.ts` - Ratings, likes, social interactions
- `recipe-management.controller.ts` - User recipe management
- `recipe-category.controller.ts` - Categorization and tagging
- `recipe-social.controller.ts` - Sharing functionality

**Models** (Data Layer):
- `recipe-types.model.ts` - TypeScript interfaces and types
- `recipe-schema.model.ts` - Mongoose schema definitions
- `recipe-methods.model.ts` - Instance and static methods
- `recipe.model.ts` - Main model orchestrator

**Configuration** (Infrastructure):
- `middleware.config.ts` - Express middleware setup
- `routes.config.ts` - Route configuration
- `database.config.ts` - Database connection
- `server.config.ts` - Server and Swagger configuration

### 3. Repository Pattern (via Mongoose ODM)
Data access is abstracted through Mongoose models with:
- **Static Methods**: `findPublished()`, `searchRecipes()`, `getFeatured()`
- **Instance Methods**: `calculateAverageRating()`, `addRating()`, `incrementViews()`
- **Virtual Properties**: `averageRating`, `likesCount`, `commentsCount`

### 4. Middleware Pattern
Cross-cutting concerns handled through Express middleware:
- **Authentication**: JWT-based auth with `protect` middleware
- **Validation**: Schema validation using Joi with `validate` middleware  
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Professional logging with context and levels
- **File Upload**: Multer-based image upload handling

### 5. Factory Pattern
Configuration modules use factory functions:
```typescript
export function initializeMiddleware(app: Application): void
export function configureAPIRoutes(app: Application): void
export function initializeDatabase(): Promise<void>
```

### 6. Dependency Injection Pattern
Modules receive dependencies rather than creating them:
```typescript
// Routes receive controller functions
import { createRecipe, getAllRecipes } from '../controllers/recipes.controller';

// Controllers receive models and utilities
import { Recipe } from '../models/recipe.model';
import { catchAsync } from '../middleware/error.middleware';
```

### 7. Strategy Pattern
Different validation strategies for different contexts:
```typescript
export const recipeValidationSchemas = {
  recipeCreate: createRecipeSchema,
  recipeUpdate: updateRecipeSchema,
  recipeSearch: searchRecipeSchema
};
```

## Enterprise Architecture Patterns

### Layered Pattern
The application follows a strict layered architecture where each layer has distinct responsibilities and communicates only with adjacent layers.

**Implementation:**
- **Presentation Layer**: Express routes and middleware
- **Business Layer**: Controller modules with domain-specific logic
- **Service Layer**: Utility functions and business services
- **Data Access Layer**: Mongoose models and database operations

### Client-Server Pattern
The API implements a peer-to-peer architecture where clients request services and the server provides them.

**Implementation:**
- **Server**: Express.js application serving REST endpoints
- **Clients**: Web applications, mobile apps, or other services consuming the API
- **Protocol**: HTTP/HTTPS with JSON data exchange
- **Authentication**: JWT-based stateless authentication

### Command Query Responsibility Segregation (CQRS) Pattern
The API demonstrates CQRS principles by separating read and write operations.

**Implementation:**
- **Commands**: Recipe creation, updates, and deletions in `recipe-crud.controller.ts`
- **Queries**: Recipe searching, filtering, and retrieval in `recipe-search.controller.ts`
- **Read Models**: Optimized queries with pagination and filtering
- **Write Models**: Validation-focused operations with business rules

### Model-View-Controller (MVC) Pattern
The API implements a modified MVC pattern adapted for REST APIs:

**Implementation:**
- **Models**: Mongoose schemas and business logic (`models/` directory)
- **Controllers**: Request handlers and business orchestration (`controllers/` directory)  
- **Views**: JSON response structures and API documentation (Swagger)

### Microservices-Ready Pattern
The modular architecture demonstrates microservices principles within a monolithic structure.

**Implementation:**
- **Domain Separation**: Recipe, User, Comment, and Notification modules
- **Independent Controllers**: Each domain has separate CRUD, search, and management controllers
- **Loose Coupling**: Interfaces and dependency injection between modules
- **Service Discovery Ready**: Modular exports support service extraction

## Design Principles Applied

### SOLID Principles

**Single Responsibility Principle (SRP)**
- Each controller handles one specific domain
- Each middleware has one specific purpose
- Each model file has one concern

**Open/Closed Principle (OCP)**
- New features can be added via new controller modules
- Validation schemas can be extended without modification
- New middleware can be added without changing existing middleware

**Liskov Substitution Principle (LSP)**
- Custom error classes extend base Error class properly
- All controllers follow the same interface pattern

**Interface Segregation Principle (ISP)**
- TypeScript interfaces are specific to their use cases
- Middleware interfaces are focused on their specific concerns

**Dependency Inversion Principle (DIP)**
- Controllers depend on abstractions not implementations
- Database access is abstracted through Mongoose models

### Additional Principles

**DRY (Don't Repeat Yourself)**
- Common functionality extracted to utilities
- Shared validation logic in reusable schemas
- Common error handling patterns in middleware

**Convention over Configuration**
- Standardized naming conventions
- Consistent API response format
- Uniform error handling across all endpoints

## Directory Structure Pattern

```
src/
├── app.ts                          # Application entry point
├── config/                         # Infrastructure configuration
├── controllers/                    # Business logic layer
├── middleware/                     # Cross-cutting concerns
├── models/                         # Data access layer
├── routes/                         # API endpoint definitions
├── validation/                     # Input validation schemas
├── utils/                          # Shared utilities
├── types/                          # Global TypeScript definitions
└── docs/                          # Documentation files
```

## Data Flow Architecture

```
Client Request → Routes → Middleware → Controllers → Models → Database
     ↓             ↓          ↓           ↓          ↓         ↓
  Swagger UI   Validation   Auth      Business   Data      MongoDB
                Error      JWT       Logic    Access    Persistence
               Handling   Security   Layer    Layer
     ↑             ↑          ↑           ↑          ↑         ↑
Response ← Error Handler ← Logger ← Controller ← Model ← Database
```

## Implementation Patterns

### Error Handling Pattern
```typescript
export class CustomError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
}

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
```

### Controller Pattern
```typescript
export const controllerFunction = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  // 1. Extract and validate input
  // 2. Business logic execution  
  // 3. Consistent response format
  return res.status(200).json({
    status: 'success',
    data: { resource },
    message: 'Operation completed successfully'
  });
});
```

### Professional Logging Pattern
```typescript
Logger.info('Recipe created successfully', 'RECIPE_SERVICE', { recipeId, userId });
Logger.error('Database connection failed', 'DATABASE', error);
```

## Security Architecture

### Authentication Strategy Pattern
- **JWT Strategy**: Stateless token-based authentication
- **Refresh Token Strategy**: Long-lived tokens for session management  
- **Role-Based Access Control**: User permissions and authorization

### Input Sanitization Pattern
- **Schema Validation**: Joi-based input validation
- **XSS Protection**: Input sanitization and output encoding
- **SQL Injection Prevention**: MongoDB parameterized queries

### Error Handling Security Pattern
- **Information Hiding**: Generic error messages in production
- **Error Logging**: Detailed errors logged securely server-side
- **Graceful Degradation**: Fallback responses for security errors

## Quality Metrics

| Quality Attribute | Implementation | Evidence |
|-------------------|----------------|----------|
| **Modularity** | High cohesion, loose coupling | 25+ focused controller modules, clear domain boundaries |
| **Maintainability** | SOLID principles, clean code | Single responsibility per module, consistent patterns |
| **Scalability** | Stateless design, efficient queries | JWT auth, pagination, database indexing ready |
| **Testability** | Dependency injection, pure functions | Mockable dependencies, isolated business logic |
| **Security** | Defense in depth | JWT + validation + sanitization + error handling |
| **Performance** | Optimized data access | Lean queries, virtual properties, efficient aggregations |
| **Documentation** | Self-documenting code | TypeScript types, Swagger docs, clear naming |
| **Extensibility** | Open/closed principle | Plugin-ready middleware, modular controllers |

## Architectural Decision Records (ADRs)

### ADR-001: Modular Controller Architecture
- **Decision**: Split controllers by domain and concern rather than traditional CRUD
- **Rationale**: Better maintainability, easier testing, clearer responsibilities
- **Consequences**: More files but much clearer organization and easier feature development

### ADR-002: TypeScript Interface Segregation
- **Decision**: Separate model interfaces by concern (entity, model, value objects)
- **Rationale**: Follow ISP, reduce coupling, improve type safety
- **Consequences**: More type files but better type safety and IntelliSense

### ADR-003: Configuration Factory Pattern
- **Decision**: Use factory functions for application initialization
- **Rationale**: Better testability, clearer dependencies, easier environment-specific config
- **Consequences**: More abstraction but much cleaner application startup

### ADR-004: Middleware Pipeline Architecture
- **Decision**: Compose functionality through Express middleware pipeline
- **Rationale**: Cross-cutting concerns, reusability, clear separation
- **Consequences**: Learning curve but excellent maintainability and reusability

## Conclusion

This architecture provides a solid foundation for a production-ready API that can handle growth in features, users, and complexity while maintaining code quality and developer productivity. The implementation demonstrates enterprise-grade software engineering practices with proper separation of concerns, scalable design patterns, and comprehensive security measures.