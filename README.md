# Project Data Mapping (Database Schema)

This section describes the database schema based on the `prisma/schema.prisma` file. It outlines the different models (tables) and their relationships.

## Enums

*   **Sexo**: Defines the sex of cattle (`MACHO`, `HEMBRA`, `SIN_RESTRICCION`).
*   **OrderStatus**: Defines the status of an order (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
*   **Role**: Defines user roles (`USER`, `ADMIN`).

## Models

*   **User**: Represents a user in the system.
    *   Fields: `id`, `clerkId`, `nombre`, `email`, `slug`, `role`, `createdAt`, `updatedAt`.
    *   Relationships: Has many `Review`, `Order`, `Wishlist`, `CartItem`, `Contact`, and `Event` records.
*   **Company**: Represents a company or business.
    *   Fields: `id`, `nombre`, `slug`, `logo`, `descripcion`, `ubicacion`, `website`, `isFeatured`, `isPublished`, `createdAt`, `updatedAt`.
    *   Relationships: Has many `Concurso`, `Contact`, `Event`, and `Product` records.
*   **Concurso**: Represents a contest.
    *   Fields: `id`, `nombre`, `descripcion`, `slug`, `fechaInicio`, `fechaFin`, `isFeatured`, `isPublished`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `Company`. Has a many-to-many relationship with `Ganado` through `GanadoEnConcurso`. Has many `ConcursoCategoria` records.
*   **ConcursoCategoria**: Represents a category within a contest.
    *   Fields: `id`, `nombre`, `descripcion`, `orden`, `sexo`, `edadMinima`, `edadMaxima`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `Concurso`. Has many `Ganado` records.
*   **Ganado**: Represents cattle.
    *   Fields: `id`, `nombre`, `slug`, `fechaNac`, `categoria`, `subcategoria`, `establo`, `remate`, `propietario`, `descripcion`, `raza`, `sexo`, `numRegistro`, `puntaje`, `isFeatured`, `isPublished`, `isGanadora`, `premios`, `createdAt`, `updatedAt`.
    *   Relationships: Has a many-to-many relationship with `Concurso` through `GanadoEnConcurso`. Belongs to an optional `Criador`. Belongs to an optional `ConcursoCategoria`. Has many `GanadoImage` records.
*   **Criador**: Represents a breeder.
    *   Fields: `id`, `nombre`, `apellido`, `empresa`, `telefono`, `email`, `direccion`, `createdAt`, `updatedAt`.
    *   Relationships: Has many `Ganado` records.
*   **GanadoEnConcurso**: A pivot table for the many-to-many relationship between `Ganado` and `Concurso`.
    *   Fields: `id`, `ganadoId`, `concursoId`, `posicion`, `creadoAt`.
    *   Relationships: Belongs to a `Ganado` and a `Concurso`.
*   **Image**: Represents an image.
    *   Fields: `id`, `url`, `hash`, `createdAt`, `updatedAt`.
    *   Relationships: Has many `GanadoImage` records.
*   **GanadoImage**: A pivot table for the many-to-many relationship between `Ganado` and `Image`.
    *   Fields: `id`, `ganadoId`, `imageId`, `principal`, `createdAt`.
    *   Relationships: Belongs to a `Ganado` and an `Image`.
*   **Contact**: Represents a contact person (optional).
    *   Fields: `id`, `name`, `email`, `phone`, `role`, `startDate`, `companyId`, `userId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `Company`. Can be associated with multiple `User` records.
*   **Event**: Represents an event (optional).
    *   Fields: `id`, `companyId`, `companyName`, `title`, `description`, `start`, `allDay`, `timeFormat`, `endDate`, `userId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `Company`. Can be associated with multiple `User` records.
*   **Category**: Represents a product category (e-commerce).
    *   Fields: `id`, `name`, `slug`, `description`, `image`, `parentId`, `featured`, `createdAt`, `updatedAt`.
    *   Relationships: Can have a parent `Category` and many `subCategories`. Has many `Product` records.
*   **Product**: Represents a product (e-commerce).
    *   Fields: `id`, `name`, `slug`, `description`, `price`, `comparePrice`, `images`, `videos`, `ingredients`, `companyId`, `categoryId`, `isFeatured`, `isPublished`, `stock`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `Company` and a `Category`. Has many `Variant`, `Attribute`, `Review`, `OrderItem`, `Wishlist`, and `CartItem` records.
*   **Variant**: Represents a product variant (e-commerce).
    *   Fields: `id`, `name`, `price`, `sku`, `stock`, `productId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `Product`.
*   **Attribute**: Represents a product attribute (e-commerce).
    *   Fields: `id`, `name`, `value`, `imageUrl`, `productId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `Product`.
*   **Review**: Represents a product review (e-commerce).
    *   Fields: `id`, `rating`, `comment`, `userId`, `productId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `User` and a `Product`.
*   **Order**: Represents a customer order (e-commerce).
    *   Fields: `id`, `userId`, `status`, `total`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `User`. Has many `OrderItem` records.
*   **OrderItem**: Represents an item within an order (e-commerce).
    *   Fields: `id`, `quantity`, `price`, `orderId`, `productId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to an `Order` and a `Product`.
*   **Wishlist**: Represents a user's wishlist item (e-commerce).
    *   Fields: `id`, `userId`, `productId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `User` and a `Product`.
*   **CartItem**: Represents an item in a user's shopping cart (e-commerce).
    *   Fields: `id`, `quantity`, `userId`, `productId`, `createdAt`, `updatedAt`.
    *   Relationships: Belongs to a `User` and a `Product`.

