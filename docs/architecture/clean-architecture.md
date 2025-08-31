# Clean Architecture Implementation

## Overview

This document details the Clean Architecture implementation in the AI Site Generator, following Robert C. Martin's principles of clean architecture with clear separation of concerns and dependency inversion.

## Architecture Layers

### 1. Domain Layer (Innermost)

The domain layer contains the core business logic and entities that are independent of any external frameworks or technologies.

#### Entities

```typescript
// src/types/domain.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  name: string;
  content: SiteContent;
  ownerId: string;
  createdAt: Date;
  deployedAt?: Date;
  deployUrl?: string;
}

export interface SiteContent {
  html: string;
  css: string;
  js: string;
  assets: Asset[];
}
```

#### Domain Services

```typescript
// src/services/domain/site-service.ts
export class SiteDomainService {
  static validateSiteName(name: string): boolean {
    return name.length >= 3 && name.length <= 50;
  }

  static generateSiteSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  static calculateSiteSize(content: SiteContent): number {
    const htmlSize = new Blob([content.html]).size;
    const cssSize = new Blob([content.css]).size;
    const jsSize = new Blob([content.js]).size;
    const assetsSize = content.assets.reduce((total, asset) => total + (asset.size || 0), 0);
    return htmlSize + cssSize + jsSize + assetsSize;
  }
}
```

#### Use Cases

```typescript
// src/use-cases/create-site.ts
export interface CreateSiteRequest {
  name: string;
  template: string;
  ownerId: string;
}

export interface CreateSiteResponse {
  site: Site;
  success: boolean;
  errors?: string[];
}

export class CreateSiteUseCase {
  constructor(
    private siteRepository: ISiteRepository,
    private userRepository: IUserRepository,
    private aiService: IAIService
  ) {}

  async execute(request: CreateSiteRequest): Promise<CreateSiteResponse> {
    // Validate input
    if (!SiteDomainService.validateSiteName(request.name)) {
      return {
        site: null,
        success: false,
        errors: ['Site name must be between 3 and 50 characters'],
      };
    }

    // Check if user exists
    const user = await this.userRepository.findById(request.ownerId);
    if (!user) {
      return {
        site: null,
        success: false,
        errors: ['User not found'],
      };
    }

    // Generate site content using AI
    const content = await this.aiService.generateSiteContent(request.template);

    // Create site entity
    const site: Site = {
      id: generateId(),
      name: request.name,
      content,
      ownerId: request.ownerId,
      createdAt: new Date(),
    };

    // Save site
    const savedSite = await this.siteRepository.save(site);

    return {
      site: savedSite,
      success: true,
    };
  }
}
```

### 2. Application Layer

The application layer orchestrates the domain layer and contains application-specific logic.

#### Application Services

```typescript
// src/services/application/site-app-service.ts
export class SiteApplicationService {
  constructor(
    private createSiteUseCase: CreateSiteUseCase,
    private deploySiteUseCase: DeploySiteUseCase,
    private siteQueryService: SiteQueryService
  ) {}

  async createAndDeploySite(request: CreateSiteRequest): Promise<CreateSiteResponse> {
    // Create the site
    const createResult = await this.createSiteUseCase.execute(request);
    if (!createResult.success) {
      return createResult;
    }

    // Deploy the site
    const deployResult = await this.deploySiteUseCase.execute({
      siteId: createResult.site.id,
    });

    if (!deployResult.success) {
      return {
        site: createResult.site,
        success: false,
        errors: ['Site created but deployment failed', ...deployResult.errors],
      };
    }

    return {
      site: deployResult.site,
      success: true,
    };
  }

  async getUserSites(userId: string): Promise<Site[]> {
    return this.siteQueryService.getSitesByUserId(userId);
  }
}
```

#### Query Services

```typescript
// src/services/application/site-query-service.ts
export class SiteQueryService {
  constructor(private siteRepository: ISiteRepository) {}

  async getSitesByUserId(userId: string): Promise<Site[]> {
    return this.siteRepository.findByOwnerId(userId);
  }

  async getSiteWithStats(siteId: string): Promise<SiteWithStats | null> {
    const site = await this.siteRepository.findById(siteId);
    if (!site) return null;

    const stats = SiteDomainService.calculateSiteSize(site.content);

    return {
      ...site,
      stats: {
        size: stats,
        lastModified: site.updatedAt || site.createdAt,
        deployCount: site.deployedAt ? 1 : 0,
      },
    };
  }
}
```

### 3. Infrastructure Layer

The infrastructure layer contains external concerns like databases, APIs, and frameworks.

#### Repository Implementations

```typescript
// src/infrastructure/repositories/site-repository.ts
export class SiteRepository implements ISiteRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Site | null> {
    const result = await this.db.sites.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!result) return null;

    return this.mapToDomain(result);
  }

  async findByOwnerId(ownerId: string): Promise<Site[]> {
    const results = await this.db.sites.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return results.map(this.mapToDomain);
  }

  async save(site: Site): Promise<Site> {
    const data = this.mapFromDomain(site);

    const result = await this.db.sites.upsert({
      where: { id: site.id },
      update: data,
      create: data,
    });

    return this.mapToDomain(result);
  }

  private mapToDomain(dbSite: any): Site {
    return {
      id: dbSite.id,
      name: dbSite.name,
      content: dbSite.content,
      ownerId: dbSite.ownerId,
      createdAt: dbSite.createdAt,
      updatedAt: dbSite.updatedAt,
      deployedAt: dbSite.deployedAt,
      deployUrl: dbSite.deployUrl,
    };
  }

  private mapFromDomain(site: Site): any {
    return {
      id: site.id,
      name: site.name,
      content: site.content,
      ownerId: site.ownerId,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt,
      deployedAt: site.deployedAt,
      deployUrl: site.deployUrl,
    };
  }
}
```

#### External Service Adapters

```typescript
// src/infrastructure/services/ai-service-adapter.ts
export class AIServiceAdapter implements IAIService {
  constructor(private aiProvider: AIProvider) {}

  async generateText(messages: AIMessage[], options?: GenerateOptions): Promise<GenerateResult> {
    try {
      const response = await this.aiProvider.generate(messages, options);
      return {
        text: response.text,
        usage: response.usage,
        finishReason: response.finishReason,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw new AIServiceError('AI service unavailable', 'SERVICE_UNAVAILABLE', error);
      }
      throw new AIServiceError('AI generation failed', 'GENERATION_FAILED', error);
    }
  }

  async *generateStream(
    messages: AIMessage[],
    options?: GenerateOptions
  ): AsyncIterable<StreamChunk> {
    try {
      for await (const chunk of this.aiProvider.stream(messages, options)) {
        yield {
          text: chunk.text,
          done: chunk.done,
          usage: chunk.usage,
        };
      }
    } catch (error) {
      throw new AIServiceError('AI streaming failed', 'STREAMING_FAILED', error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.aiProvider.healthCheck();
      return true;
    } catch {
      return false;
    }
  }

  getProviderType(): string {
    return this.aiProvider.type;
  }
}
```

### 4. Presentation Layer

The presentation layer contains UI components and user interaction logic.

#### React Components

```typescript
// src/components/site/SiteCreator.tsx
interface SiteCreatorProps {
  onSiteCreated: (site: Site) => void;
}

export function SiteCreator({ onSiteCreated }: SiteCreatorProps) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !template.trim()) return;

    setIsCreating(true);
    try {
      const result = await siteApplicationService.createAndDeploySite({
        name: name.trim(),
        template: template.trim(),
        ownerId: currentUser.id
      });

      if (result.success) {
        onSiteCreated(result.site);
      } else {
        alert('Failed to create site: ' + result.errors?.join(', '));
      }
    } catch (error) {
      alert('An error occurred while creating the site');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="site-creator">
      <input
        type="text"
        placeholder="Site name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        placeholder="Describe your site..."
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
      />

      <button
        onClick={handleCreate}
        disabled={isCreating || !name.trim() || !template.trim()}
      >
        {isCreating ? 'Creating...' : 'Create Site'}
      </button>
    </div>
  );
}
```

#### Custom Hooks

```typescript
// src/hooks/useSiteCreator.ts
export function useSiteCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSite = useCallback(async (name: string, template: string) => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await siteApplicationService.createAndDeploySite({
        name,
        template,
        ownerId: currentUser.id,
      });

      if (!result.success) {
        setError(result.errors?.join(', ') || 'Failed to create site');
        return null;
      }

      return result.site;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createSite,
    isCreating,
    error,
  };
}
```

## Dependency Injection

### Service Container

```typescript
// src/infrastructure/container.ts
export class ServiceContainer {
  private services = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory();
  }

  // Singleton registration
  registerSingleton<T>(key: string, instance: T): void {
    this.services.set(key, () => instance);
  }
}

// Usage
const container = new ServiceContainer();

// Register infrastructure services
container.registerSingleton('Database', new Database());
container.register('AIService', () => new AIServiceAdapter(new GoogleAIProvider()));

// Register repositories
container.register('ISiteRepository', () => {
  const db = container.resolve<Database>('Database');
  return new SiteRepository(db);
});

// Register domain services
container.register('SiteDomainService', () => new SiteDomainService());

// Register use cases
container.register('CreateSiteUseCase', () => {
  const siteRepo = container.resolve<ISiteRepository>('ISiteRepository');
  const userRepo = container.resolve<IUserRepository>('IUserRepository');
  const aiService = container.resolve<IAIService>('AIService');

  return new CreateSiteUseCase(siteRepo, userRepo, aiService);
});

// Register application services
container.register('SiteApplicationService', () => {
  const createSiteUseCase = container.resolve<CreateSiteUseCase>('CreateSiteUseCase');
  const deploySiteUseCase = container.resolve<DeploySiteUseCase>('DeploySiteUseCase');
  const siteQueryService = container.resolve<SiteQueryService>('SiteQueryService');

  return new SiteApplicationService(createSiteUseCase, deploySiteUseCase, siteQueryService);
});
```

### React Integration

```typescript
// src/contexts/ServiceContext.tsx
const ServiceContext = createContext<ServiceContainer | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<ServiceContainer>();

  if (!containerRef.current) {
    containerRef.current = createServiceContainer();
  }

  return (
    <ServiceContext.Provider value={containerRef.current}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useService<T>(key: string): T {
  const container = useContext(ServiceContext);
  if (!container) {
    throw new Error('useService must be used within ServiceProvider');
  }
  return container.resolve<T>(key);
}

// Usage in components
function SiteCreator() {
  const siteService = useService<SiteApplicationService>('SiteApplicationService');

  // Use service...
}
```

## Benefits of Clean Architecture

### 1. Testability

```typescript
// Easy to test domain logic with mocked dependencies
describe('CreateSiteUseCase', () => {
  let useCase: CreateSiteUseCase;
  let mockSiteRepo: jest.Mocked<ISiteRepository>;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockAIService: jest.Mocked<IAIService>;

  beforeEach(() => {
    mockSiteRepo = createMock<ISiteRepository>();
    mockUserRepo = createMock<IUserRepository>();
    mockAIService = createMock<IAIService>();

    useCase = new CreateSiteUseCase(mockSiteRepo, mockUserRepo, mockAIService);
  });

  it('should create site successfully', async () => {
    // Arrange
    const request: CreateSiteRequest = {
      name: 'My Site',
      template: 'Create a blog',
      ownerId: 'user123',
    };

    mockUserRepo.findById.mockResolvedValue({ id: 'user123', name: 'User' });
    mockAIService.generateSiteContent.mockResolvedValue({
      html: '<html></html>',
      css: 'body{}',
      js: 'console.log()',
      assets: [],
    });
    mockSiteRepo.save.mockResolvedValue({
      id: 'site123',
      ...request,
      content: mockAIService.generateSiteContent(),
      createdAt: new Date(),
    });

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.success).toBe(true);
    expect(result.site).toBeDefined();
    expect(mockSiteRepo.save).toHaveBeenCalled();
  });
});
```

### 2. Maintainability

- **Separation of Concerns**: Each layer has a specific responsibility
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Interface Segregation**: Clients depend only on interfaces they need
- **Single Responsibility**: Each class has one reason to change

### 3. Flexibility

```typescript
// Easy to swap implementations
const container = new ServiceContainer();

// Use Google AI
container.register('AIService', () => new GoogleAIServiceAdapter());

// Later, switch to OpenAI
container.register('AIService', () => new OpenAIAdapter());

// Or use a mock for testing
container.register('AIService', () => new MockAIService());
```

### 4. Scalability

- **Independent Layers**: Each layer can be scaled independently
- **Modular Design**: New features can be added without affecting existing code
- **Clear Boundaries**: Changes in one layer don't affect others

## Implementation Guidelines

### 1. Dependency Direction

- **Domain Layer**: No dependencies on other layers
- **Application Layer**: Depends only on Domain layer
- **Infrastructure Layer**: Depends on Application and Domain layers
- **Presentation Layer**: Depends on all other layers

### 2. Interface Definition

- Define interfaces in the layer that uses them (Dependency Inversion)
- Keep interfaces small and focused (Interface Segregation)
- Use descriptive names that reflect capabilities

### 3. Error Handling

- Define custom error types in the Domain layer
- Handle errors at appropriate layers
- Don't let infrastructure errors leak into domain logic

### 4. Data Flow

- Use Data Transfer Objects (DTOs) for cross-layer communication
- Keep domain entities pure and focused
- Transform data at layer boundaries

---

_This Clean Architecture implementation guide is automatically generated and kept in sync with the codebase. Last updated: August 31, 2025_
