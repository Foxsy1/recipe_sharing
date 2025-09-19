export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Recipe {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string;
    createdBy: string; // User ID
    createdAt: Date;
    updatedAt: Date;
}