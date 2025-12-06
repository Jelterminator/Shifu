// Test TypeScript strict mode
export interface User {
  id: number;
  name: string;
  email?: string;
}

export function getUser(id: number): User | null {
  const users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob' }, // email is optional
  ];

  const user = users.find(u => u.id === id);

  // Strict null check: TypeScript knows user could be undefined
  return user ?? null;
}

// Test noImplicitReturns
export function processValue(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  // This would error without return: noImplicitReturns
  throw new Error('Invalid value type');
}

// Test strictPropertyInitialization
export class Example {
  private readonly name: string; // Must be initialized
  private readonly age?: number; // Optional is fine

  constructor(name: string, age?: number) {
    this.name = name; // Initialized here
    this.age = age; // Use the parameter to avoid unused variable error
  }

  public getName(): string {
    return this.name; // Now we use 'name'
  }

  public getAge(): number | undefined {
    return this.age; // Now we use 'age'
  }
}
