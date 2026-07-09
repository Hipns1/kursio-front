import type { Course, CourseSummary, Exercise, Lesson, Phase } from '@/types/learning'

export let COURSES: CourseSummary[] = [
  {
    color: '#ab9df2',
    description: 'De C# básico a Clean Architecture con EF Core y CQRS',
    icon: '🏗️',
    id: 0,
    name: '.NET Backend Architecture',
    order: 1,
    slug: 'net-backend'
  }
]

export let ALL_COURSES: Course[] = []

export let PHASES: Phase[] = [
  { icon: '🔤', id: 0, name: 'C# para TypeScript devs' },
  { icon: '🏗️', id: 1, name: 'Clean Architecture' },
  { icon: '📦', id: 2, name: 'DTOs' },
  { icon: '🗄️', id: 3, name: 'Repository Pattern' },
  { icon: '⚡', id: 4, name: 'CQRS + MediatR' },
  { icon: '🛒', id: 5, name: 'Unit of Work' },
  { icon: '✅', id: 6, name: 'FluentValidation' },
  { icon: '🗃️', id: 7, name: 'EF Core' }
]

export let LESSONS: Lesson[] = [
  {
    blocks: [
      {
        t: 'p',
        v: 'En TypeScript usás Promise<T> y async/await. En C# el equivalente exacto es Task<T>. La sintaxis es casi idéntica.'
      },
      {
        cs: '// C#\npublic async Task<User> GetUser(long id) {\n    return await _repo.GetById(id);\n}',
        t: 'cmp',
        ts: '// TypeScript\nasync function getUser(id: number)\n    : Promise<User> {\n  return await userApi.fetchById(id);\n}'
      },
      { t: 'tip', v: 'Task<T> = Promise<T>. Sin valor de retorno: Task (sin genérico) = Promise<void>.' }
    ],
    id: 'L0-1',
    phase: 0,
    title: 'async/await — Task<T> es tu nuevo Promise<T>'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'C# tipea en compilación. var infiere el tipo pero una vez asignado no puede cambiar — a diferencia de any en TypeScript.'
      },
      {
        cs: 'long id = 1;\nstring name = "Ana";\nbool active = true;\nDateTime date = DateTime.UtcNow;',
        t: 'cmp',
        ts: "let id: number = 1;\nlet name: string = 'Ana';\nlet active: boolean = true;\nlet date: Date = new Date();"
      },
      {
        items: [
          'long para IDs (entero de 64 bits)',
          'string con comillas dobles, no simples',
          'bool en minúscula (no Boolean)',
          'DateTime en lugar de Date'
        ],
        t: 'list'
      },
      {
        t: 'tip',
        v: "string? con ? = puede ser null. Equivale a 'string | null' en TypeScript con strict mode."
      }
    ],
    id: 'L0-2',
    phase: 0,
    title: 'Tipos primitivos — int, string, bool, DateTime'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'En C# las propiedades usan { get; set; }. Es una auto-property — el compilador genera el campo privado por vos. Equivale a un campo público en TypeScript.'
      },
      {
        cs: 'public class SessionAudit : BaseEntity {\n    public string Username { get; set; }\n    public DateTime LoginDate { get; set; }\n    public DateTime? LogoutDate { get; set; }\n    // Id, CreatedAt, UpdatedAt heredan de BaseEntity\n}',
        t: 'cmp',
        ts: 'interface SessionAudit {\n  id: number;\n  username: string;\n  loginDate: Date;\n  logoutDate?: Date;\n}'
      },
      {
        t: 'tip',
        v: '{ get; set; } = lectura y escritura. { get; private set; } = solo lectura desde afuera. Igual que readonly en TypeScript.'
      }
    ],
    id: 'L0-3',
    phase: 0,
    title: 'Clases y propiedades — { get; set; }'
  },
  {
    blocks: [
      {
        t: 'p',
        v: "En TypeScript usás 'extends' para clases e 'implements' para interfaces. En C# el símbolo ':' hace ambas cosas."
      },
      {
        cs: 'public class User : BaseEntity, IUser { ... }\n\npublic interface IUserRepository {\n    Task<User?> GetById(long id);\n}',
        t: 'cmp',
        ts: 'class User extends BaseEntity\n    implements IUser { ... }\n\ninterface IUserRepository {\n  getById(id: number): Promise<User>;\n}'
      },
      {
        t: 'tip',
        v: "Convención del proyecto: las interfaces empiezan con 'I'. IUnitOfWork, IAsyncRepository, IDepartmentQueryRepository."
      }
    ],
    id: 'L0-4',
    phase: 0,
    title: "Interfaces y herencia — el ':' hace las dos cosas"
  },
  {
    blocks: [
      {
        t: 'p',
        v: "Los generics funcionan igual que en TypeScript. La diferencia: podés agregar constraints (restricciones de tipo) con 'where'."
      },
      {
        cs: 'public IAsyncRepository<T> Repository<T>()\n    where T : class  // T debe ser clase, no primitivo\n{\n    return new EfRepository<T>(_dbContext);\n}',
        t: 'cmp',
        ts: 'function getRepo<T extends object>() {\n  return new Repository<T>();\n}'
      },
      {
        t: 'tip',
        v: "'where T : class' excluye int, bool y otros primitivos. EfRepository necesita tipos referencia (clases/entidades) para funcionar con EF Core."
      }
    ],
    id: 'L0-5',
    phase: 0,
    title: 'Generics — where T : class'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'C# tiene tres operadores de null que complementan el ? en tipos. Son equivalentes a los operadores de TypeScript con el mismo nombre.'
      },
      {
        cs: '// C#\nstring name = user?.Name ?? "Anónimo";\nvar tags = list?.Select(i => i.Id) ?? new List<long>();\nuser ??= new User { Name = "default" };',
        t: 'cmp',
        ts: "// TypeScript\nconst name = user?.name ?? 'Anónimo';\nconst tags = list?.map(i => i.id) ?? [];\nuser ??= { name: 'default' };"
      },
      {
        t: 'tip',
        v: '?. previene NullReferenceException igual que optional chaining. ?? es más estricto que || — solo activa con null, no con 0 o false.'
      }
    ],
    id: 'L0-6',
    phase: 0,
    title: 'Null safety — ??, ?. y switch expression'
  },

  {
    blocks: [
      {
        t: 'p',
        v: 'El proyecto está dividido en 4 capas con responsabilidades claras. Las capas internas no conocen a las externas.'
      },
      {
        lang: 'flujo',
        t: 'code',
        v: 'API (Controllers)              ← recibe HTTP, delega al mediator\n  ↓ usa\nApplication (Handlers, DTOs)   ← lógica de negocio\n  ↓ depende de interfaces de\nDomain (Entidades, IRepos)     ← núcleo — no depende de nadie\n  ↑ implementado por\nInfrastructure (Repos, DB)     ← EF Core, Dapper, Npgsql'
      },
      {
        cs: '// Estructura del proyecto\nAsisya.Plantilla.Api/\nAsisya.Plantilla.Application/\nAsisya.Plantilla.Domain/\nAsisya.Plantilla.Infraestructure/',
        t: 'cmp',
        ts: '// Estructura React análoga\nsrc/\n  pages/      → API Controllers\n  hooks/      → Application Handlers\n  types/      → Domain Entities\n  services/   → Infrastructure Repos'
      },
      {
        t: 'tip',
        v: 'Regla: Infrastructure conoce a todos. Domain no conoce a nadie. Application solo conoce a Domain.'
      }
    ],
    id: 'L1-1',
    phase: 1,
    title: 'Las 4 capas — API, Application, Domain, Infrastructure'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'En React inyectás servicios con createContext + useContext. En .NET el framework los inyecta automáticamente por el constructor del handler.'
      },
      {
        cs: '// C# — automático por constructor\npublic class LoginCommandHandler {\n    private readonly IUnitOfWork _uow;\n\n    // El framework resuelve y pasa IUnitOfWork\n    public LoginCommandHandler(IUnitOfWork uow) {\n        _uow = uow;\n    }\n}',
        t: 'cmp',
        ts: '// React — manual\nconst auth = useContext(AuthContext);\n// Context.Provider wrappea la app\n// y provee la instancia a los hijos'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// Se registra en InfraestructureServiceRegistration.cs\nservices.AddScoped<IUnitOfWork, UnitOfWork>();\n//       ↑ lifetime    ↑ interfaz   ↑ implementación concreta'
      },
      {
        items: [
          'Scoped: una instancia por HTTP request — como un Provider que dura un fetch',
          'Singleton: una instancia para toda la app — como una constante global',
          'Transient: una instancia nueva cada vez que se pide'
        ],
        t: 'list'
      }
    ],
    id: 'L1-2',
    phase: 1,
    title: 'Dependency Injection — tu nuevo useContext'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'Seguí el camino de un POST /v1/auth/login de principio a fin para ver cómo interactúan las capas:'
      },
      {
        lang: 'flujo',
        t: 'code',
        v: 'HTTP POST /v1/auth/login { username, password }\n  ↓\nAuthController.Login([FromBody] LoginCommand cmd)\n  → _mediator.Send(cmd)\n  ↓\n[ValidationBehavior] valida username y password\n  → inválido → throw ValidationException → HTTP 400\n  ↓ válido\nLoginCommandHandler.Handle(cmd, ct)\n  → valida contra LDAP\n  → _unitOfWork.Repository<SessionAudit>().AddAsync(audit)\n  → _unitOfWork.CompleteAsync()  ← INSERT en DB\n  → return LoginResult con JWT\n  ↓\nController → HTTP 200 + JSON'
      },
      {
        t: 'tip',
        v: 'El Controller no sabe qué hace el Handler. El Handler no sabe que hay un HTTP request. Cada capa solo conoce su trabajo.'
      }
    ],
    id: 'L1-3',
    phase: 1,
    title: 'El flujo completo de un request'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'Cada capa expone un extension method AddXServices() para registrar sus propios servicios. Program.cs los llama en cadena sin conocer los detalles internos de cada capa.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// InfraestructureServiceRegistration.cs\npublic static IServiceCollection AddInfraestructureServices(\n    this IServiceCollection services, IConfiguration config) {\n\n    services.AddDbContext<ApplicationDbContext>(...);\n    services.AddScoped<IUnitOfWork, UnitOfWork>();\n    services.AddScoped<IDepartmentQueryRepository,\n                       DepartmentQueryRepository>();\n    return services;\n}\n\n// Program.cs — llama todo en cadena\nbuilder.Services.AddApplicationServices();\nbuilder.Services.AddInfraestructureServices(builder.Configuration);'
      },
      {
        t: 'tip',
        v: 'Agregar un nuevo servicio = agregarlo en el ServiceRegistration de su capa. Program.cs nunca se toca. La capa encapsula su propio registro.'
      }
    ],
    id: 'L1-4',
    phase: 1,
    title: 'Startup — cómo las capas se registran solas'
  },

  {
    blocks: [
      {
        t: 'p',
        v: 'Una Entidad mapea una tabla de la DB con campos internos. Un DTO es el contrato limpio que exponés al cliente. Cambiar el schema interno no debe romper la API.'
      },
      {
        cs: '// ❌ MAL\npublic async Task<ActionResult<SessionAudit>>\n    GetSession(long id)\n\n// ✅ BIEN\npublic async Task<ActionResult<SessionAuditDTO>>\n    GetSession(long id)',
        t: 'cmp',
        ts: '// ❌ MAL — expone campos internos\nreturn res.json(sessionAuditEntity);\n// incluye: createdAt, updatedAt, relaciones...\n\n// ✅ BIEN — contrato limpio\nreturn res.json({\n  id: s.id,\n  username: s.username\n});'
      },
      {
        t: 'tip',
        v: 'Cambiar el schema de la DB (agregar columna interna) no afecta al cliente si usás DTOs. Sin DTOs, cualquier cambio interno rompe la API.'
      }
    ],
    id: 'L2-1',
    phase: 2,
    title: '¿Por qué DTOs? — Nunca exponer la entidad'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'En este proyecto hay tres tipos de clases de transferencia según su propósito y dirección:'
      },
      {
        items: [
          'DTO (DepartmentDTO) — datos de lectura hacia el cliente. Sufijo DTO.',
          'Result (LoginResult, UserResult) — resultado de una operación compleja. Sufijo Result.',
          'Command (LoginCommand, CreateDepartmentCommand) — input del cliente hacia el servidor. Sufijo Command.'
        ],
        t: 'list'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// Input (cliente → servidor)\npublic class CreateDepartmentCommand\n    : IRequest<DepartmentDTO> {  // IRequest<T> = el Handler devuelve T\n    public string Name { get; set; }\n    public string? Description { get; set; }\n}\n\n// Output (servidor → cliente)\npublic class DepartmentDTO {\n    public long Id { get; set; }\n    public string Name { get; set; }\n    public string? Description { get; set; }\n}'
      },
      {
        t: 'tip',
        v: 'Los Commands implementan IRequest<TResult> — eso le dice a MediatR qué tipo va a retornar el handler correspondiente.'
      }
    ],
    id: 'L2-2',
    phase: 2,
    title: 'Tipos de DTOs — DTO, Result, Command'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'ASP.NET Core serializa automáticamente PascalCase → camelCase en JSON. No tenés que hacer conversión manual.'
      },
      {
        cs: '// Lo que está en C# (PascalCase):\npublic class LoginResult {\n    public string? AccessToken { get; set; }\n    public string? RefreshToken { get; set; }\n    public UserResult? User { get; set; }\n    public bool OtpRequired { get; set; } = false;\n}',
        t: 'cmp',
        ts: '// Lo que recibe React (camelCase):\n{\n  "accessToken": "eyJ...",\n  "refreshToken": "abc...",\n  "user": {\n    "username": "admin",\n    "email": "a@co.com"\n  },\n  "otpRequired": false\n}'
      },
      {
        t: 'tip',
        v: 'AccessToken → accessToken automáticamente. Configurado en Program.cs con JsonNamingPolicy.CamelCase.'
      }
    ],
    id: 'L2-3',
    phase: 2,
    title: 'Serialización — PascalCase en C# → camelCase en JSON'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'Para convertir una entidad en DTO hay dos enfoques. Este proyecto usa mapeo manual por explícito y seguro.'
      },
      {
        cs: '// C# — mapeo manual en el handler\nreturn new DepartmentDTO {\n    Id = department.Id,\n    Name = department.Name,\n    Description = department.Description\n    // campos internos como CreatedAt NO van\n};',
        t: 'cmp',
        ts: '// React — mapeo explícito en el servicio\nconst toDTO = (e) => ({\n  id: e.id,\n  name: e.name\n  // solo los campos que querés exponer\n});'
      },
      {
        items: [
          'Manual: explícito, visible, seguro — elegís exactamente qué exponer',
          'AutoMapper: automático por nombre de propiedad — puede incluir campos sin querer si los nombres coinciden',
          'En APIs públicas o con contratos importantes → manual siempre gana en claridad'
        ],
        t: 'list'
      }
    ],
    id: 'L2-4',
    phase: 2,
    title: 'Mapeo manual vs AutoMapper — por qué este proyecto usa manual'
  },

  {
    blocks: [
      {
        t: 'p',
        v: 'El patrón Repository abstrae el acceso a datos detrás de una interfaz. Los handlers no saben si los datos vienen de PostgreSQL, SQL Server, o una API externa.'
      },
      {
        cs: '// C# — repository abstrae la DB\npublic interface IAsyncRepository<T> where T : class {\n    Task<T?> GetById(long id);\n    Task AddAsync(T entity);\n    Task UpdateAsync(T entity);\n    Task DeleteAsync(T entity);\n}\n// El handler solo conoce la interfaz',
        t: 'cmp',
        ts: "// React — custom hook abstrae el fetch\nfunction useUsers() {\n  return useQuery(['users'],\n    () => fetch('/api/users').then(r => r.json())\n  );\n}\n// El componente no sabe de dónde vienen los datos"
      },
      {
        t: 'tip',
        v: 'Cambiar de PostgreSQL a SQL Server = cambiar EfRepository, no los handlers. Igual que cambiar el endpoint en useUsers sin tocar los componentes.'
      }
    ],
    id: 'L3-1',
    phase: 3,
    title: 'Repository Pattern — como un custom hook de datos'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'El proyecto usa dos implementaciones distintas según la operación: una para escribir y otra para leer.'
      },
      {
        lang: 'flujo',
        t: 'code',
        v: 'ESCRITURA (EF Core — SQL automático):\nHandler → IUnitOfWork → EfRepository → _dbContext.Set<T>().Add() → INSERT\n\nLECTURA (Dapper — SQL manual):\nHandler → IDepartmentQueryRepository → NpgsqlConnection + SQL → SELECT'
      },
      {
        items: [
          'EfRepository: usa EF Core. Genera el SQL por vos. Ideal para INSERT/UPDATE/DELETE.',
          'QueryRepository: usa Dapper con SQL directo. Más rápido y flexible para queries de lectura complejas.',
          'Esta separación es CQRS en la capa de datos.'
        ],
        t: 'list'
      },
      {
        t: 'tip',
        v: 'Si querés leer un Department: DepartmentQueryRepository (Dapper). Si querés crearlo: IUnitOfWork → EfRepository (EF Core).'
      }
    ],
    id: 'L3-2',
    phase: 3,
    title: 'EfRepository vs QueryRepository — escritura vs lectura'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'IAsyncRepository<T> abstrae TODAS las operaciones de escritura en una sola interfaz. EfRepository<T> la implementa para cualquier entidad.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: 'public interface IAsyncRepository<T> where T : class {\n    Task<T?> GetById(long id);\n    Task<IReadOnlyList<T>> GetAll();\n    Task AddAsync(T entity);\n    Task UpdateAsync(T entity);\n    Task DeleteAsync(T entity);\n}\n\n// UnitOfWork expone la interfaz genérica:\n// _unitOfWork.Repository<Department>()  → IAsyncRepository<Department>\n// _unitOfWork.Repository<SessionAudit>() → IAsyncRepository<SessionAudit>\n// Una sola implementación EfRepository<T> para todas las entidades'
      },
      {
        t: 'tip',
        v: "'where T : class' le dice al compilador que T es un tipo referencia (no primitivo). EF Core necesita eso para usar _dbContext.Set<T>() con el tipo."
      }
    ],
    id: 'L3-3',
    phase: 3,
    title: 'IAsyncRepository<T> — la interfaz genérica del proyecto'
  },

  {
    blocks: [
      {
        t: 'p',
        v: 'CQRS separa lecturas (Queries) de escrituras (Commands). Ya conocés esta idea de React Query / TanStack Query.'
      },
      {
        cs: '// CQRS — solo lectura\npublic class GetDepartmentsQuery\n    : IRequest<IReadOnlyList<DepartmentDTO>> { }\n\n// CQRS — solo escritura\npublic class CreateDepartmentCommand\n    : IRequest<DepartmentDTO> {\n    public string Name { get; set; }\n}',
        t: 'cmp',
        ts: "// React Query\nconst { data } = useQuery(\n  ['depts'], getDepts\n); // solo lee\n\nconst { mutate } = useMutation(\n  createDept\n); // modifica"
      },
      {
        t: 'tip',
        v: 'useQuery ↔ Query + QueryHandler. useMutation ↔ Command + CommandHandler. La separación es idéntica.'
      }
    ],
    id: 'L4-1',
    phase: 4,
    title: 'Commands vs Queries — useMutation vs useQuery'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'MediatR es un router interno: el Controller envía un Command/Query y MediatR lo dirige al Handler correcto sin que el Controller lo conozca directamente.'
      },
      {
        cs: '// MediatR — Send desacopla\nvar result = await _mediator.Send(\n    new LoginCommand { Username = "...", Password = "..." }\n);\n// El Controller no sabe qué Handler lo procesa',
        t: 'cmp',
        ts: '// Redux — dispatch desacopla\ndispatch(loginAction(creds));\n// El componente no sabe qué reducer\n// procesa la acción'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// MediatR conecta Command ↔ Handler via interfaces:\npublic class LoginCommand\n    : IRequest<LoginResult> { ... }\n//    ↑ quiero que el handler devuelva LoginResult\n\npublic class LoginCommandHandler\n    : IRequestHandler<LoginCommand, LoginResult> { ... }\n//    ↑ yo proceso LoginCommand y devuelvo LoginResult\n// MediatR los conecta automáticamente — sin registro manual'
      },
      {
        t: 'tip',
        v: 'No hay mapa manual Command→Handler. MediatR escanea el assembly al iniciar y conecta via las interfaces IRequest<T> e IRequestHandler<TReq, TRes>.'
      }
    ],
    id: 'L4-2',
    phase: 4,
    title: 'MediatR — el dispatch() de Redux'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'Antes de llegar al Handler, el Command/Query pasa por behaviors. Son exactamente el middleware de Express — podés interceptar, validar, o transformar.'
      },
      {
        lang: 'flujo',
        t: 'code',
        v: 'Controller → _mediator.Send(LoginCommand)\n  ↓\n[ValidationBehavior]\n  → si inválido → throw ValidationException → HTTP 400\n  ↓ si válido\n[LoginCommandHandler]\n  ↓\nLoginResult → Controller → HTTP 200'
      },
      {
        t: 'tip',
        v: 'next() en ValidationBehavior = llamar al Handler. Si no llamás next(), el Handler nunca se ejecuta — igual que en Express middleware.'
      }
    ],
    id: 'L4-3',
    phase: 4,
    title: 'El pipeline de MediatR — behaviors como middleware'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'Los behaviors se encadenan en orden de registro. Cada behavior puede ejecutar lógica antes y después del siguiente — exactamente como Express middleware.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// Analogía con Express:\napp.use(logger);       // LoggingBehavior\napp.use(auth);         // AuthorizationBehavior\napp.use(validation);   // ValidationBehavior\napp.use(yourHandler);  // CommandHandler\n\n// En C# el orden se controla en ApplicationServiceRegistration:\nservices.AddTransient(typeof(IPipelineBehavior<,>),\n    typeof(LoggingBehavior<,>));    // 1° — envuelve todo\nservices.AddTransient(typeof(IPipelineBehavior<,>),\n    typeof(ValidationBehavior<,>)); // 2° — valida antes del handler'
      },
      {
        t: 'tip',
        v: 'Un behavior que no llama await next() corta el pipeline. ValidationBehavior hace exactamente eso cuando hay errores — el handler nunca se ejecuta.'
      }
    ],
    id: 'L4-4',
    phase: 4,
    title: 'Behaviors como middleware — orden y encadenamiento'
  },

  {
    blocks: [
      {
        t: 'p',
        v: 'Sin Unit of Work, si guardás dos cosas por separado y la segunda falla, la primera ya quedó en la DB — datos inconsistentes.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// ❌ SIN Unit of Work — peligroso\nawait sessionRepo.Save(audit);  // INSERT inmediato\nawait userRepo.Update(user);    // si falla → audit YA está en DB ❌\n\n// ✅ CON Unit of Work — seguro\nawait _uow.Repository<SessionAudit>().AddAsync(audit);  // al carrito\nawait _uow.Repository<User>().UpdateAsync(user);        // al carrito\nawait _uow.CompleteAsync(); // checkout → TODO junto o NADA'
      },
      {
        t: 'tip',
        v: 'CompleteAsync() → SaveChangesAsync() → BEGIN TRANSACTION → todos los SQL → COMMIT. Si alguno falla → ROLLBACK automático de todos.'
      }
    ],
    id: 'L5-1',
    phase: 5,
    title: 'El problema — atomicidad de operaciones'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'Unit of Work funciona exactamente como un carrito de compras online — agregás items sin cobrar, y el checkout es atómico.'
      },
      {
        items: [
          'AddAsync(entity) → agregar producto al carrito (sin pagar todavía)',
          'UpdateAsync(entity) → modificar cantidad en el carrito',
          'DeleteAsync(entity) → quitar producto del carrito',
          'CompleteAsync() → checkout — se paga todo junto o nada',
          'Excepción antes del checkout → carrito se vacía, nada se cobró'
        ],
        t: 'list'
      },
      {
        t: 'tip',
        v: 'El carrito vive en el DbContext en memoria. El checkout es SaveChangesAsync() que ejecuta todos los SQL en una transacción real en la DB.'
      }
    ],
    id: 'L5-2',
    phase: 5,
    title: 'La analogía del carrito de compras'
  },
  {
    blocks: [
      {
        t: 'p',
        v: "El lifetime del UnitOfWork determina cuánto vive el DbContext — y qué tan grande es el 'carrito'."
      },
      {
        items: [
          'Scoped (correcto): una instancia por HTTP request. Cada request tiene su propio DbContext y transacción.',
          'Singleton (peligroso): una instancia global. Todos los usuarios comparten el mismo DbContext → race conditions imposibles de debuggear.',
          'Transient (ineficiente): nueva instancia cada vez. Los repos no comparten DbContext → no hay transacción compartida.'
        ],
        t: 'list'
      },
      {
        t: 'tip',
        v: 'Singleton DbContext en producción = bug que solo aparece con múltiples usuarios concurrentes. En dev con un solo tester nunca lo ves.'
      }
    ],
    id: 'L5-3',
    phase: 5,
    title: 'Scoped vs Singleton — por qué el lifetime importa'
  },
  {
    blocks: [
      {
        t: 'p',
        v: "En los QueryRepositories (Dapper) se usa 'using' para que la conexión a la DB se cierre y se devuelva al pool automáticamente, incluso si ocurre una excepción."
      },
      {
        cs: '// C# — using (automático, más limpio)\npublic async Task<IReadOnlyList<DepartmentDTO>> GetAllAsync() {\n    using IDbConnection conn =\n        new NpgsqlConnection(_connectionString);\n    // conn.Dispose() se llama al salir del scope\n    // (o si hay una excepción)\n    var result = await conn.QueryAsync<DepartmentDTO>(sql);\n    return result.ToList();\n}',
        t: 'cmp',
        ts: '// JavaScript — finally manual\nlet conn;\ntry {\n    conn = await pool.connect();\n    return await conn.query(sql);\n} finally {\n    conn?.release();\n}'
      },
      {
        t: 'tip',
        v: "NpgsqlConnection implementa IDisposable. Con 'using', la conexión siempre vuelve al pool de Npgsql. Sin 'using', podrías agotar el pool en producción."
      }
    ],
    id: 'L5-4',
    phase: 5,
    title: 'using statement — limpieza automática de conexiones'
  },

  {
    blocks: [
      {
        t: 'p',
        v: 'El frontend valida para dar buena UX. El backend valida porque nunca confía en el cliente — alguien puede llamar tu API con Postman sin pasar por el frontend.'
      },
      {
        items: [
          'Alguien puede llamar tu API con Postman, curl, o un script malicioso',
          'El frontend puede tener bugs que dejen pasar datos inválidos',
          'La validación backend es la última línea de defensa contra datos corruptos en la DB'
        ],
        t: 'list'
      },
      {
        t: 'tip',
        v: 'Frontend valida para comodidad del usuario. Backend valida para seguridad y consistencia de los datos.'
      }
    ],
    id: 'L6-1',
    phase: 6,
    title: '¿Por qué validar en el backend?'
  },
  {
    blocks: [
      { t: 'p', v: 'La idea es idéntica a Zod o Yup — definís reglas declarativas sobre los campos del objeto.' },
      {
        cs: '// FluentValidation (C#)\npublic class LoginCommandValidator\n    : AbstractValidator<LoginCommand> {\n    public LoginCommandValidator() {\n        RuleFor(x => x.Username)\n            .NotEmpty()\n            .Matches(RegexPatterns.Username);\n        RuleFor(x => x.Password)\n            .NotEmpty().MinimumLength(8);\n    }\n}',
        t: 'cmp',
        ts: "// Zod (TypeScript)\nconst loginSchema = z.object({\n  username: z.string().min(1, 'Requerido')\n              .regex(/^[a-z]+$/),\n  password: z.string().min(8),\n});"
      },
      {
        items: [
          'NotEmpty() = z.string().min(1)',
          'MinimumLength(n) / MaximumLength(n) = z.string().min/max(n)',
          'EmailAddress() = z.string().email()',
          'Must(x => ...) = z.refine(x => ...)',
          'When(x => ...) = validar solo si se cumple la condición'
        ],
        t: 'list'
      }
    ],
    id: 'L6-2',
    phase: 6,
    title: 'FluentValidation ≈ Zod — reglas declarativas'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'El validator no se llama manualmente. ValidationBehavior intercepta cada request en el pipeline antes del Handler. Si falla, el Handler nunca se ejecuta.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// ValidationBehavior.cs (simplificado)\npublic async Task<TResponse> Handle(\n    TRequest request,\n    RequestHandlerDelegate<TResponse> next, ...)\n{\n    var failures = _validators\n        .SelectMany(v => v.Validate(request).Errors)\n        .Where(f => f != null).ToList();\n\n    if (failures.Any())\n        throw new ValidationException(failures);\n        // → ExceptionHandlingMiddleware → HTTP 400\n\n    return await next(); // → Handler\n}'
      },
      {
        t: 'tip',
        v: 'Si no existe Validator para un Command, ValidationBehavior no hace nada y pasa directo al Handler. Solo valida cuando existe el Validator correspondiente.'
      }
    ],
    id: 'L6-3',
    phase: 6,
    title: 'ValidationBehavior — el middleware automático'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'When() y Unless() aplican reglas solo si se cumple una condición, permitiendo validaciones que dependen del valor de otros campos.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// Validar PhoneNumber solo si el canal elegido es \'phone\'\nRuleFor(x => x.PhoneNumber)\n    .NotEmpty()\n    .MinimumLength(10)\n    .When(x => x.PreferredChannel == "phone");\n\n// Lo mismo con Unless (condición negada)\nRuleFor(x => x.Email)\n    .NotEmpty().EmailAddress()\n    .Unless(x => x.PreferredChannel == "phone");\n\n// Validar entre dos campos\nRuleFor(x => x.EndDate)\n    .GreaterThan(x => x.StartDate)\n    .When(x => x.EndDate.HasValue);'
      },
      {
        t: 'tip',
        v: 'When/Unless reciben el objeto completo — podés comparar cualquier campo entre sí. Equivale a z.superRefine() en Zod pero con sintaxis más directa.'
      }
    ],
    id: 'L6-4',
    phase: 6,
    title: 'When y Unless — validaciones condicionales'
  },

  {
    blocks: [
      {
        t: 'p',
        v: 'EF Core es un ORM (Object-Relational Mapper): traduce clases de C# a tablas de PostgreSQL automáticamente. No escribís SQL para INSERT/UPDATE/DELETE.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// En código C#:\nvar dept = new Department { Name = "Tecnología" };\nawait _dbContext.Departments.AddAsync(dept);\nawait _dbContext.SaveChangesAsync();\n\n// EF Core genera automáticamente:\n// INSERT INTO public."Department" ("Name", "CreatedAt")\n// VALUES (\'Tecnología\', \'2024-01-15 10:30:00\')'
      },
      {
        t: 'tip',
        v: 'EF Core para escrituras (genera el SQL). Dapper para lecturas (SQL manual). Cada uno donde brilla.'
      }
    ],
    id: 'L7-1',
    phase: 7,
    title: 'EF Core — ORM que traduce clases a tablas'
  },
  {
    blocks: [
      {
        t: 'p',
        v: "El DbContext es el puente entre el código y la DB. Mantiene el 'change tracking' — sabe exactamente qué entidades fueron agregadas, modificadas o eliminadas."
      },
      {
        lang: 'csharp',
        t: 'code',
        v: 'public class ApplicationDbContext : DbContext {\n    // Cada DbSet<T> = una tabla\n    public DbSet<SessionAudit> SessionAudits { get; set; }\n    public DbSet<Department> Departments { get; set; }\n\n    // Se ejecuta automáticamente antes de SaveChangesAsync()\n    private void OnBeforeSaving() {\n        foreach (var entry in ChangeTracker.Entries()) {\n            if (entry.Entity is BaseEntity entity) {\n                if (entry.State == EntityState.Added)\n                    entity.CreatedAt = DateTime.UtcNow;\n                if (entry.State == EntityState.Modified)\n                    entity.UpdatedAt = DateTime.UtcNow;\n            }\n        }\n    }\n}'
      },
      {
        t: 'tip',
        v: "El DbContext es como el store de Redux — tiene el estado de todo en seguimiento. SaveChangesAsync() es el 'dispatch' que persiste los cambios en la DB."
      }
    ],
    id: 'L7-2',
    phase: 7,
    title: 'DbContext — el corazón de EF Core'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'Las migraciones trackean cambios al schema de la DB igual que git trackea cambios en el código.'
      },
      {
        items: [
          'Modificás una entidad C# (agregás un campo) → git add',
          'dotnet ef migrations add Nombre → git commit',
          'dotnet ef database update → git push (aplica el cambio a la DB)'
        ],
        t: 'list'
      },
      {
        lang: 'bash',
        t: 'code',
        v: '# 1. Crear la migración (después de cambiar una entidad)\ndotnet ef migrations add AddDepartmentsTable \\\n  --project App/Asisya.Plantilla.Infraestructure \\\n  --startup-project App/Asisya.Plantilla.Api\n\n# 2. Aplicar a la DB\ndotnet ef database update \\\n  --project App/Asisya.Plantilla.Infraestructure \\\n  --startup-project App/Asisya.Plantilla.Api'
      },
      {
        t: 'tip',
        v: 'Up() aplica los cambios. Down() los revierte — como git revert. Nunca borres una migración ya aplicada a producción.'
      }
    ],
    id: 'L7-3',
    phase: 7,
    title: 'Migraciones — commits de git para la DB'
  },
  {
    blocks: [
      { t: 'p', v: 'Este proyecto usa ambas herramientas con roles bien definidos. Cada una donde tiene ventaja.' },
      {
        items: [
          'EF Core (escrituras): genera el SQL por vos. Simple para INSERT/UPDATE/DELETE. Incluye change tracking y OnBeforeSaving().',
          'Dapper (lecturas): SQL directo y manual. Más rápido y flexible para queries complejas con JOINs, filtros, paginación.',
          'La separación es CQRS en la capa de datos: cada lado optimizado para su función.'
        ],
        t: 'list'
      },
      {
        cs: '// EF Core — escritura (simple)\nawait _uow.Repository<Dept>().AddAsync(dept);\nawait _uow.CompleteAsync();\n\n// Dapper — lectura (control total)\nconst string sql = @"\n    SELECT d.""Id"", d.""Name""\n    FROM public.""Department"" d\n    ORDER BY d.""Name""";\nvar result = await connection.QueryAsync<DepartmentDTO>(sql);',
        t: 'cmp',
        ts: '// Más cercano en Node.js:\n// EF Core → Prisma (ORM)\n// Dapper  → knex o pg directo'
      }
    ],
    id: 'L7-4',
    phase: 7,
    title: 'EF Core vs Dapper — cuándo usar cada uno'
  },
  {
    blocks: [
      {
        t: 'p',
        v: 'En lugar de configurar el mapping en OnModelCreating(), este proyecto usa clases separadas IEntityTypeConfiguration<T>. EF Core las detecta automáticamente.'
      },
      {
        lang: 'csharp',
        t: 'code',
        v: '// DepartmentConfiguration.cs — en su propio archivo\npublic class DepartmentConfiguration\n    : IEntityTypeConfiguration<Department> {\n\n    public void Configure(EntityTypeBuilder<Department> builder) {\n        builder.ToTable("Department", "public");\n        builder.HasKey(x => x.Id);\n        builder.Property(x => x.Name)\n            .IsRequired()       // NOT NULL en SQL\n            .HasMaxLength(100);\n        builder.Property(x => x.Description)\n            .HasMaxLength(500); // nullable porque no tiene IsRequired\n    }\n}\n\n// EF Core la detecta sola con:\n// modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());'
      },
      {
        t: 'tip',
        v: 'Una clase de configuración por entidad. Más limpio que tener un OnModelCreating() de 200 líneas. Agregar una entidad = agregar su archivo de configuración, sin tocar el DbContext.'
      }
    ],
    id: 'L7-5',
    phase: 7,
    title: 'IEntityTypeConfiguration — separar la config del entity'
  }
]

export let EXERCISES: Exercise[] = [
  {
    correct: 0,
    explanation:
      'Task<T> es exactamente el equivalente. La sintaxis async/await funciona casi igual en ambos lenguajes.',
    id: 'F0-001',
    options: ['Task<T>', 'Async<T>', 'Future<T>', 'Thread<T>'],
    phase: 0,
    question: '¿Cuál es el equivalente en C# de Promise<T> en TypeScript?',
    type: 'multiple-choice'
  },
  {
    correct: 1,
    explanation:
      "El ? indica que la variable puede ser null — exactamente como 'string | null' en TypeScript con strict mode.",
    id: 'F0-002',
    options: [
      'El campo es obligatorio',
      'El campo puede ser null (nullable reference type)',
      'Es un tipo especial de string',
      'Equivale a undefined en TypeScript'
    ],
    phase: 0,
    question: "¿Qué significa el ? en 'string? token = null' en C#?",
    type: 'multiple-choice'
  },
  {
    code: 'var count = 42;',
    explanation:
      'C# infiere int para enteros literales. A diferencia de TypeScript, no es any — el tipo es fijo en compilación.',
    id: 'F0-003',
    keywords: ['int'],
    phase: 0,
    question: '¿Qué tipo infiere C# para esta variable? (escribí solo el tipo)',
    type: 'know-output'
  },
  {
    code: 'public class LoginService {\n    public any username = "admin";\n    public async Task Login() { ... }\n}',
    explanation:
      "C# no tiene tipo 'any'. Usarías 'string username'. En casos extremos existe 'object' o 'dynamic', pero nunca 'any'.",
    id: 'F0-004',
    phase: 0,
    question: 'Este código C# tiene un error. ¿Cuál es el problema y cómo lo corregirías?',
    type: 'find-bug'
  },
  {
    correct: 0,
    explanation: "En C#, ':' sirve tanto para herencia de clases como para implementar interfaces.",
    id: 'F0-005',
    options: [
      'class User : BaseEntity',
      'class User implements BaseEntity',
      'class User inherits BaseEntity',
      'class User extends BaseEntity'
    ],
    phase: 0,
    question: "¿Cuál es el equivalente en C# de 'class User extends BaseEntity' en TypeScript?",
    type: 'multiple-choice'
  },
  {
    blanks: ['long', 'string', 'DateTime', 'DateTime'],
    code: 'public class SessionAudit {\n    public ___ Id { get; set; }\n    public ___ Username { get; set; }\n    public ___ LoginDate { get; set; }\n    public ___? LogoutDate { get; set; }\n}',
    explanation: 'long para IDs, string para texto, DateTime para fechas, DateTime? para fecha nullable.',
    id: 'F0-006',
    phase: 0,
    question: 'Completá los tipos faltantes en esta clase C#:',
    type: 'complete-code'
  },
  {
    code: 'public async Task<User> GetCurrentUser() {\n    return _userRepo.GetById(_currentUserId);\n}',
    explanation:
      "Falta 'await'. Sin await, el método retorna el Task<User> sin esperarlo — el llamador recibe una tarea sin completar. Debe ser: return await _userRepo.GetById(_currentUserId);",
    id: 'F0-007',
    phase: 0,
    question: 'Este método async compila pero tiene un bug en tiempo de ejecución. ¿Cuál es el problema?',
    type: 'find-bug'
  },
  {
    code: 'public User GetUser(long id) {\n    return _repo.GetById(id).Result; // .Result bloquea el thread\n}',
    explanation:
      "El método debe ser 'public async Task<User> GetUser(long id)' y usar 'return await _repo.GetById(id)' en vez de .Result. .Result es bloqueante y puede causar deadlocks en ASP.NET Core.",
    id: 'F0-008',
    phase: 0,
    question: 'Convertí este código bloqueante a la versión async/await correcta:',
    type: 'improve-code'
  },

  {
    correct: 2,
    explanation:
      'La capa API (Controllers) es la puerta de entrada. Recibe el request, crea un Command/Query, y lo despacha via mediator.',
    id: 'F1-001',
    options: ['Domain', 'Application', 'API (Controllers)', 'Infrastructure'],
    phase: 1,
    question: '¿Cuál capa es responsable de recibir el HTTP request?',
    type: 'multiple-choice'
  },
  {
    code: '// Application/Features/Auth/Login/Commands/LoginCommandHandler.cs\nusing Npgsql;\n\npublic class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResult> {\n    public async Task<LoginResult> Handle(LoginCommand req, CancellationToken ct) {\n        using var conn = new NpgsqlConnection("Host=localhost;Database=mydb");\n        // lógica directa con la DB...\n    }\n}',
    explanation:
      'Application Layer no debería conocer Npgsql (Infrastructure). Debería recibir IUnitOfWork o un repositorio via DI.',
    id: 'F1-002',
    phase: 1,
    question: 'Este handler viola Clean Architecture. ¿Por qué? ¿Cómo lo corregirías?',
    type: 'find-bug'
  },
  {
    correct: 1,
    explanation:
      'AddScoped = una instancia por request HTTP. Como un Context.Provider en React, pero automático para toda la app.',
    id: 'F1-003',
    options: [
      'Crea una instancia de UnitOfWork al arrancar la app y la reutiliza siempre',
      'Cuando alguien pida IUnitOfWork, crea un UnitOfWork nuevo por cada HTTP request',
      'Reemplaza todas las referencias a IUnitOfWork en el código automáticamente',
      'Registra UnitOfWork como clase abstracta global'
    ],
    phase: 1,
    question: '¿Qué hace services.AddScoped<IUnitOfWork, UnitOfWork>()?',
    type: 'multiple-choice'
  },
  {
    correct: 2,
    explanation:
      "Si el handler hiciera 'new EfRepository()', estaría acoplado a esa implementación. Con DI, solo conoce la interfaz y funciona con cualquier implementación — incluidos mocks para tests.",
    id: 'F1-004',
    options: [
      'Es solo una convención sin razón técnica',
      "C# no permite usar 'new' dentro de handlers",
      'Para que Application Layer no dependa de implementaciones concretas de Infrastructure',
      'Para ahorrar memoria RAM'
    ],
    phase: 1,
    question: "¿Por qué los handlers reciben dependencias en el constructor en vez de crearlas con 'new'?",
    type: 'multiple-choice'
  },
  {
    explanation:
      'API (Controller) → Application (Handler) → Infrastructure (Repository) → DB. Las capas internas no conocen a las externas.',
    id: 'F1-005',
    keywords: ['api', 'application', 'infrastructure', 'controller', 'handler', 'repository'],
    phase: 1,
    question:
      'Describí el flujo de capas de una request POST /v1/auth/login (de afuera hacia adentro, separadas por →)',
    type: 'know-output'
  },
  {
    code: '[HttpPost("departments")]\npublic async Task<ActionResult> Create([FromBody] CreateDepartmentCommand cmd) {\n    var existing = await _dbContext.Departments\n        .FirstOrDefaultAsync(d => d.Name == cmd.Name);\n    if (existing != null) return Conflict("Ya existe");\n\n    var dept = new Department { Name = cmd.Name };\n    _dbContext.Departments.Add(dept);\n    await _dbContext.SaveChangesAsync();\n    return Created($"v1/departments/{dept.Id}", dept); // devuelve entidad\n}',
    explanation:
      'Dos problemas: (1) El Controller accede directamente a DbContext (Infrastructure) — viola separación de capas. (2) Contiene lógica de negocio. El Controller debe solo hacer: var result = await _mediator.Send(cmd); return Created(..., result). Todo lo demás va en el Handler.',
    id: 'F1-006',
    phase: 1,
    question: 'Este Controller viola Clean Architecture. Identificá todos los problemas:',
    type: 'find-bug'
  },
  {
    code: 'public class GetDepartmentsQueryHandler\n    : IRequestHandler<GetDepartmentsQuery, List<DepartmentDTO>> {\n\n    private readonly ApplicationDbContext _dbContext;\n\n    public GetDepartmentsQueryHandler(ApplicationDbContext dbContext) {\n        _dbContext = dbContext;\n    }\n\n    public async Task<List<DepartmentDTO>> Handle(\n        GetDepartmentsQuery request, CancellationToken ct) {\n        return await _dbContext.Departments\n            .Select(d => new DepartmentDTO { Id = d.Id, Name = d.Name })\n            .ToListAsync();\n    }\n}',
    explanation:
      'El handler debe recibir IDepartmentQueryRepository por DI en el constructor. Handle() retorna await _departmentQueryRepository.GetAllAsync(). Así Application Layer no conoce EF Core ni ApplicationDbContext.',
    id: 'F1-007',
    phase: 1,
    question: 'Reescribí este handler para que no dependa de ApplicationDbContext (elimina la violación de capas):',
    type: 'improve-code'
  },

  {
    correct: 1,
    explanation:
      'Las entidades = modelo interno de datos. Los DTOs = contratos con el exterior. Nunca exponés una entidad directamente.',
    id: 'F2-001',
    options: [
      'Las entidades tienen métodos, los DTOs no tienen ninguna lógica',
      'Las entidades mapean tablas de DB y nunca se exponen al cliente; los DTOs son contratos de comunicación',
      'Los DTOs son más rápidos de procesar',
      'Las entidades viven en Infrastructure, los DTOs en API'
    ],
    phase: 2,
    question: '¿Cuál es la diferencia principal entre una Entidad y un DTO?',
    type: 'multiple-choice'
  },
  {
    code: '[HttpGet("{id}")]\npublic async Task<ActionResult<SessionAudit>> GetSession(long id) {\n    var session = await _unitOfWork.Repository<SessionAudit>().GetById(id);\n    return Ok(session); // devuelve la entidad directa\n}',
    explanation:
      'Devolver la entidad expone campos internos de la DB. Siempre hay que mapear a un DTO antes de retornar.',
    id: 'F2-002',
    phase: 2,
    question: 'Este endpoint tiene un problema de diseño. ¿Cuál es?',
    type: 'find-bug'
  },
  {
    code: 'public class LoginResult {\n    public string? AccessToken { get; set; }\n    public string? RefreshToken { get; set; }\n    public UserResult? User { get; set; }\n    public bool OtpRequired { get; set; } = false;\n}\npublic class UserResult {\n    public string Username { get; set; }\n    public string Email { get; set; }\n}',
    explanation:
      'ASP.NET serializa a camelCase: { accessToken, refreshToken, user: { username, email }, otpRequired }.',
    id: 'F2-003',
    keywords: ['accesstoken', 'refreshtoken', 'user', 'otprequired', 'username', 'email'],
    phase: 2,
    question: '¿Cómo quedaría el JSON que recibe el cliente dado este LoginResult? Escribí la estructura:',
    type: 'know-output'
  },
  {
    blanks: ['long', 'string', 'decimal', 'string'],
    code: 'public class ProductDTO {\n    public ___ Id { get; set; }\n    public ___ Name { get; set; }\n    public ___ Price { get; set; }\n    public ___? Description { get; set; }\n}',
    explanation:
      'Id → long (como BaseEntity), Name → string, Price → decimal (exactitud monetaria), Description → string? (opcional).',
    id: 'F2-004',
    phase: 2,
    question: 'Completá los tipos faltantes en este DTO para una entidad Product:',
    type: 'complete-code'
  },
  {
    explanation:
      'DepartmentDTO tiene Id (long), Name (string), Description (string?) con { get; set; }. CreateDepartmentDTO solo tiene Name y Description — sin Id porque es el input, no lleva ID. Ambas en namespace Asisya.Plantilla.Domain.Dto.Departments. Sin herencia de BaseEntity (son DTOs, no entidades).',
    id: 'F2-005',
    phase: 2,
    question: `Code-Along — creá los dos DTOs del feature Departments:

Archivo 1: App/Asisya.Plantilla.Domain/Dto/Departments/DepartmentDTO.cs
• Propiedades: Id (long), Name (string), Description (string?)

Archivo 2: App/Asisya.Plantilla.Domain/Dto/Departments/CreateDepartmentDTO.cs
• Propiedades: Name (string), Description (string?)

Pegá ambos archivos completos con namespace correcto.`,
    type: 'code-along'
  },
  {
    code: 'public class UserDTO {\n    public long Id { get; set; }\n    public string Username { get; set; }\n    public string Email { get; set; }\n    public string PasswordHash { get; set; }  // ← ojo\n    public DateTime CreatedAt { get; set; }\n    public DateTime? UpdatedAt { get; set; }\n}',
    explanation:
      'PasswordHash nunca debe ir en un DTO que llega al cliente — expone un dato interno sensible (aunque esté hasheado). CreatedAt y UpdatedAt tampoco deberían exponerse en la mayoría de endpoints — son metadatos internos de auditoría.',
    id: 'F2-006',
    phase: 2,
    question: 'Este DTO tiene un problema de diseño grave. ¿Cuál es?',
    type: 'find-bug'
  },

  {
    correct: 1,
    explanation:
      'AddAsync solo registra en el tracking del DbContext. El INSERT real ocurre cuando UnitOfWork llama SaveChangesAsync() en CompleteAsync().',
    id: 'F3-001',
    options: [
      'Guarda la entidad en la DB inmediatamente con un INSERT',
      "Agrega la entidad al DbContext en estado 'Added', lista para guardarse cuando se llame CompleteAsync",
      'Valida la entidad contra FluentValidation',
      'Crea la tabla en la DB si no existe'
    ],
    phase: 3,
    question: '¿Qué hace exactamente EfRepository.AddAsync(entity)?',
    type: 'multiple-choice'
  },
  {
    code: 'public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, RoleResult> {\n    private readonly ApplicationDbContext _dbContext;\n\n    public CreateRoleCommandHandler(ApplicationDbContext dbContext) {\n        _dbContext = dbContext;\n    }\n\n    public async Task<RoleResult> Handle(CreateRoleCommand request, CancellationToken ct) {\n        var role = new Role { Name = request.Name };\n        _dbContext.Roles.Add(role);\n        await _dbContext.SaveChangesAsync();\n        return new RoleResult { Id = role.Id, Name = role.Name };\n    }\n}',
    explanation:
      'El handler de Application Layer no debería conocer ApplicationDbContext (Infrastructure). Debería usar IUnitOfWork.',
    id: 'F3-002',
    phase: 3,
    question: 'Este handler tiene un problema de arquitectura. ¿Cuál es?',
    type: 'find-bug'
  },
  {
    correct: 2,
    explanation:
      'EF Core genera SQL automático (bien para escrituras). Dapper da control total del SQL para optimizar lecturas complejas.',
    id: 'F3-003',
    options: [
      'Porque EF Core no soporta PostgreSQL',
      'Porque Dapper es más fácil de configurar',
      'Porque Dapper ejecuta SQL directo, más rápido y flexible para queries de lectura complejas',
      'Porque Dapper maneja transacciones y EF Core no'
    ],
    phase: 3,
    question: '¿Por qué este proyecto usa Dapper para las lecturas en vez de EF Core?',
    type: 'multiple-choice'
  },
  {
    code: 'public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, List<RoleResult>> {\n    private readonly ApplicationDbContext _dbContext;\n\n    public GetRolesQueryHandler(ApplicationDbContext dbContext) {\n        _dbContext = dbContext;\n    }\n\n    public async Task<List<RoleResult>> Handle(GetRolesQuery request, CancellationToken ct) {\n        return await _dbContext.Roles\n            .Select(r => new RoleResult { Id = r.Id, Name = r.Name })\n            .ToListAsync();\n    }\n}',
    explanation:
      'Debería recibir IRoleQueryRepository via DI y llamar a GetAllAsync(). Así el handler no conoce Infrastructure ni EF Core.',
    id: 'F3-004',
    phase: 3,
    question:
      'Mejorá este QueryHandler para que use el patrón correcto del proyecto (eliminá la dependencia de ApplicationDbContext):',
    type: 'improve-code'
  },
  {
    explanation:
      "IDepartmentQueryRepository: interfaz con GetAllAsync(). DepartmentQueryRepository: constructor recibe IConfiguration y guarda el connection string. GetAllAsync() usa 'using IDbConnection conn = new NpgsqlConnection(_connectionString)' y 'await conn.QueryAsync<DepartmentDTO>(sql)'. El SQL selecciona Id, Name, Description de la tabla Department.",
    id: 'F3-005',
    phase: 3,
    question: `Code-Along — creá el repositorio de lectura para Departments:

Archivo 1: App/Asisya.Plantilla.Infraestructure/Interfaces/Departments/IDepartmentQueryRepository.cs
• Método: Task<IReadOnlyList<DepartmentDTO>> GetAllAsync()

Archivo 2: App/Asisya.Plantilla.Infraestructure/Repository/Departments/DepartmentQueryRepository.cs
• Recibir IConfiguration en el constructor, extraer connection string
• Usar NpgsqlConnection + Dapper para el SELECT

Pegá ambos archivos completos.`,
    type: 'code-along'
  },
  {
    code: 'public class GetDepartmentsQueryHandler\n    : IRequestHandler<GetDepartmentsQuery, IReadOnlyList<DepartmentDTO>> {\n\n    private readonly ApplicationDbContext _dbContext;\n\n    public GetDepartmentsQueryHandler(ApplicationDbContext db) {\n        _dbContext = db;\n    }\n\n    public async Task<IReadOnlyList<DepartmentDTO>> Handle(\n        GetDepartmentsQuery request, CancellationToken ct) {\n        return await _dbContext.Departments\n            .Select(d => new DepartmentDTO { Id=d.Id, Name=d.Name })\n            .ToListAsync();\n    }\n}',
    explanation:
      'El handler debe recibir IDepartmentQueryRepository por DI. Handle() retorna await _repo.GetAllAsync(). Sin ApplicationDbContext, sin EF Core, sin LINQ. La lectura es responsabilidad del QueryRepository (Dapper).',
    id: 'F3-006',
    phase: 3,
    question:
      'Este QueryHandler usa EF Core para leer datos. Reescribilo usando el patrón correcto del proyecto (QueryRepository con Dapper):',
    type: 'improve-code'
  },

  {
    correct: 1,
    explanation:
      'CQRS separa responsabilidades: Commands cambian el estado. Queries solo leen. Permite optimizar cada lado independientemente.',
    id: 'F4-001',
    options: [
      'Un Command usa POST y una Query usa GET',
      'Un Command modifica el estado del sistema; una Query solo lee datos sin modificar nada',
      'Un Command es procesado más rápido',
      'Son sinónimos, solo cambia el nombre por convención'
    ],
    phase: 4,
    question: '¿Cuál es la diferencia fundamental entre un Command y una Query en CQRS?',
    type: 'multiple-choice'
  },
  {
    correct: 1,
    explanation:
      'MediatR es un router interno. Como el dispatch() de Redux — manda el mensaje al handler correcto sin que el caller lo conozca.',
    id: 'F4-002',
    options: [
      'Guarda el comando en una cola para procesarlo después',
      'Busca automáticamente el IRequestHandler<LoginCommand, LoginResult> registrado y ejecuta Handle()',
      'Envía el comando por HTTP a otro servicio',
      'Solo valida el comando con FluentValidation'
    ],
    phase: 4,
    question: '¿Qué hace MediatR cuando ejecutás _mediator.Send(loginCommand)?',
    type: 'multiple-choice'
  },
  {
    code: '[HttpPost("login")]\npublic async Task<ActionResult> Login([FromBody] LoginCommand cmd) {\n    var user = await _ldapService.ValidateUserAsync(cmd.Username, cmd.Password);\n    if (user == null) return Unauthorized();\n\n    var audit = new SessionAudit { Username = cmd.Username, LoginDate = DateTime.UtcNow };\n    await _dbContext.SessionAudits.AddAsync(audit);\n    await _dbContext.SaveChangesAsync();\n\n    var token = GenerateJwtToken(user);\n    return Ok(new { token });\n}',
    explanation:
      'El Controller tiene toda la lógica de negocio. Solo debería hacer _mediator.Send(cmd). Todo lo demás va en LoginCommandHandler.',
    id: 'F4-003',
    phase: 4,
    question: 'Este Controller tiene un problema serio de arquitectura. Identificalo y explicá cómo debería quedar:',
    type: 'find-bug'
  },
  {
    blanks: ['IRequestHandler', 'Task', 'await'],
    code: 'public class GetRolesQueryHandler\n    : ___<GetRolesQuery, IReadOnlyList<RoleResult>> {\n\n    private readonly IRoleQueryRepository _repo;\n    public GetRolesQueryHandler(IRoleQueryRepository repo) { _repo = repo; }\n\n    public async ___<IReadOnlyList<RoleResult>> Handle(\n        GetRolesQuery request, CancellationToken ct) {\n        return ___ _repo.GetAllAsync();\n    }\n}',
    explanation:
      'IRequestHandler<TRequest, TResponse> es la interfaz que MediatR busca. Task<T> es el retorno async. await espera la llamada al repositorio.',
    id: 'F4-004',
    phase: 4,
    question: 'Completá los blancos de este QueryHandler:',
    type: 'complete-code'
  },
  {
    correct: 1,
    explanation:
      'useQuery = solo lee → Query + QueryHandler. useMutation = modifica → Command + CommandHandler. La separación es idéntica.',
    id: 'F4-005',
    options: [
      'Command + CommandHandler',
      'Query + QueryHandler',
      '_mediator.Send() en el Controller',
      'IUnitOfWork.Repository()'
    ],
    phase: 4,
    question: "¿Cuál es el equivalente en CQRS de 'useQuery' de React Query / TanStack?",
    type: 'multiple-choice'
  },
  {
    explanation:
      'Command: implementa IRequest<DepartmentDTO>, tiene Name y Description. Handler: inyecta IUnitOfWork. En Handle(): crea new Department{Name, Description}, llama AddAsync(), luego CompleteAsync(), retorna new DepartmentDTO{Id=dept.Id, Name, Description}. Después de CompleteAsync, dept.Id tiene el valor generado por la DB.',
    id: 'F4-006',
    phase: 4,
    question: `Code-Along — creá el Command y Handler para crear un Department:

Archivo 1: App/Asisya.Plantilla.Application/Features/Departments/Commands/CreateDepartmentCommand.cs
• Implementa IRequest<DepartmentDTO>
• Propiedades: Name (string), Description (string?)

Archivo 2: App/Asisya.Plantilla.Application/Features/Departments/Commands/CreateDepartmentCommandHandler.cs
• Implementa IRequestHandler<CreateDepartmentCommand, DepartmentDTO>
• Inyecta IUnitOfWork por constructor
• Crea Department, AddAsync, CompleteAsync, retorna DepartmentDTO

Pegá ambos archivos completos.`,
    type: 'code-along'
  },
  {
    code: 'public class GetActiveDepartmentsQueryHandler\n    : IRequestHandler<GetActiveDepartmentsQuery, IReadOnlyList<DepartmentDTO>> {\n\n    public async Task<IReadOnlyList<DepartmentDTO>> Handle(\n        GetActiveDepartmentsQuery request, CancellationToken ct) {\n\n        // Registrar auditoría de la consulta\n        await _unitOfWork.Repository<QueryLog>()\n            .AddAsync(new QueryLog { Name = "GetActiveDepartments" });\n        await _unitOfWork.CompleteAsync();  // ← INSERT en DB\n\n        return await _deptRepo.GetAllAsync();\n    }\n}',
    explanation:
      'Una Query NUNCA debe modificar el estado del sistema — viola la Q de CQRS. Las Queries son read-only. Para auditoría de consultas, usar un Behavior de MediatR (como LoggingBehavior) o un middleware separado. El QueryHandler solo puede leer datos.',
    id: 'F4-007',
    phase: 4,
    question: 'Esta Query viola el principio fundamental de CQRS. ¿Cuál es el problema?',
    type: 'find-bug'
  },

  {
    correct: 2,
    explanation:
      "AddAsync/UpdateAsync/DeleteAsync solo registran en el DbContext (el 'carrito'). CompleteAsync es el 'checkout' — ahí se ejecutan los SQL reales.",
    id: 'F5-001',
    options: [
      'Cuando se llama AddAsync(entity)',
      'Cuando se llama UpdateAsync(entity)',
      'Cuando se llama CompleteAsync() que internamente ejecuta SaveChangesAsync()',
      'Automáticamente cuando el HTTP request termina'
    ],
    phase: 5,
    question: '¿En qué momento exacto se guardan los datos en la base de datos?',
    type: 'multiple-choice'
  },
  {
    code: 'public async Task<DepartmentDTO> Handle(\n    CreateDepartmentCommand request, CancellationToken ct) {\n\n    var department = new Department { Name = request.Name };\n    await _unitOfWork.Repository<Department>().AddAsync(department);\n\n    return new DepartmentDTO { Id = department.Id, Name = department.Name };\n}',
    explanation:
      'Falta _unitOfWork.CompleteAsync(). Sin esto, la entidad se registra en el DbContext pero nunca se persiste en la DB.',
    id: 'F5-002',
    phase: 5,
    question: 'Este handler tiene un bug crítico. Los datos nunca llegan a la DB. ¿Por qué?',
    type: 'find-bug'
  },
  {
    code: 'await _unitOfWork.Repository<SessionAudit>().AddAsync(sessionAudit);\nthrow new Exception("Error inesperado");\nawait _unitOfWork.CompleteAsync(); // nunca llega aquí',
    explanation:
      'Nada se guarda. CompleteAsync nunca se ejecuta → no hay transacción commiteada. Es el comportamiento correcto: todo o nada.',
    id: 'F5-003',
    keywords: ['nada', 'no se guarda', 'rollback', 'no llega', 'no persiste'],
    phase: 5,
    question: '¿Qué pasa con los datos en la DB cuando ocurre una excepción entre AddAsync y CompleteAsync?',
    type: 'know-output'
  },
  {
    correct: 1,
    explanation:
      'Un DbContext Singleton compartiría tracking de entidades entre requests de distintos usuarios → bugs imposibles de debuggear.',
    id: 'F5-004',
    options: [
      'Es solo una convención sin razón técnica',
      'Si fuera Singleton, todos los usuarios compartirían el mismo DbContext causando race conditions',
      'Porque Singleton consume más memoria',
      'Porque Scoped permite más conexiones simultáneas'
    ],
    phase: 5,
    question: '¿Por qué IUnitOfWork se registra como Scoped y no como Singleton?',
    type: 'multiple-choice'
  },
  {
    explanation:
      'Orden obligatorio: AddAsync() → CompleteAsync() → mapear DTO. Después de CompleteAsync(), la entidad tiene el Id asignado por la DB. Si se retorna el DTO antes de CompleteAsync, el Id es 0. Si se omite CompleteAsync, nada se guarda en la DB.',
    id: 'F5-005',
    phase: 5,
    question: `Code-Along — completá CreateDepartmentCommandHandler con el manejo correcto de Unit of Work:

El handler debe:
1. Recibir IUnitOfWork por DI en el constructor
2. Crear una entidad Department con los datos del command
3. Llamar _unitOfWork.Repository<Department>().AddAsync()
4. Llamar _unitOfWork.CompleteAsync() para persistir todo
5. Retornar DepartmentDTO con el Id generado por la DB

Pegá el handler completo.`,
    type: 'code-along'
  },
  {
    code: 'public async Task<bool> Handle(TransferBudgetCommand cmd, CancellationToken ct) {\n    await _fromUnitOfWork.Repository<Dept>().UpdateAsync(from);\n    await _fromUnitOfWork.CompleteAsync(); // ← commit 1\n\n    await _toUnitOfWork.Repository<Dept>().UpdateAsync(to);\n    await _toUnitOfWork.CompleteAsync();   // ← commit 2\n    return true;\n}',
    explanation:
      'Se usan DOS instancias de UnitOfWork distintas. Cada una tiene su propia transacción. Si el segundo CompleteAsync falla, el primero ya fue commiteado → los fondos desaparecen. Debe usarse UN solo UnitOfWork: ambos UpdateAsync antes de un único CompleteAsync().',
    id: 'F5-006',
    phase: 5,
    question: 'Este handler crea dos operaciones que deberían ser atómicas pero no lo son. ¿Por qué falla?',
    type: 'find-bug'
  },

  {
    correct: 2,
    explanation:
      'ValidationBehavior intercepta cada request antes del Handler. Si hay errores, lanza excepción y el Handler nunca se ejecuta.',
    id: 'F6-001',
    options: [
      'Después del Handler, para verificar el resultado',
      'Dentro del Handler, cuando se llama explícitamente',
      'Antes del Handler, en ValidationBehavior (automáticamente)',
      'En el Controller, antes de llamar a _mediator.Send()'
    ],
    phase: 6,
    question: '¿En qué punto del pipeline de MediatR se ejecuta el validator?',
    type: 'multiple-choice'
  },
  {
    code: 'RuleFor(x => x.PhoneNumber)\n    .NotEmpty()\n    .MinimumLength(10)\n    .When(x => x.PhoneNumber == null); // ← ojo aquí',
    explanation:
      '.When(x => x.PhoneNumber == null) aplica las reglas solo cuando el teléfono ES null — exactamente al revés. Debería ser != null.',
    id: 'F6-002',
    phase: 6,
    question: 'Este validator tiene un bug lógico. ¿Cuál es el problema?',
    type: 'find-bug'
  },
  {
    blanks: ['NotEmpty', 'MaximumLength', 'NotEmpty', 'EmailAddress'],
    code: 'public class CreateProductCommandValidator\n    : AbstractValidator<CreateProductCommand> {\n\n    public CreateProductCommandValidator() {\n        RuleFor(x => x.Name)\n            .___()            .___(50);\n\n        RuleFor(x => x.Email)\n            .___();\n            .___();\n    }\n}',
    explanation:
      'NotEmpty() = obligatorio. MaximumLength(50) = límite. EmailAddress() valida formato — como z.string().email() en Zod.',
    id: 'F6-003',
    phase: 6,
    question: 'Completá el validator: Name obligatorio máx 50 chars. Email obligatorio y formato válido.',
    type: 'complete-code'
  },
  {
    correct: 0,
    explanation: '.Must(x => condition) permite validaciones custom, igual que z.refine(x => condition) en Zod.',
    id: 'F6-004',
    options: ['.Must(condition)', '.Matches(regex)', '.Custom(validator)', '.Validate(rules)'],
    phase: 6,
    question: '¿Cuál es el equivalente en FluentValidation de z.refine() de Zod?',
    type: 'multiple-choice'
  },
  {
    explanation:
      'El validator hereda de AbstractValidator<CreateDepartmentCommand>. RuleFor(x => x.Name).NotEmpty().MaximumLength(100). RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null). Todo en el constructor. Namespace: Asisya.Plantilla.Application.Features.Departments.Commands.',
    id: 'F6-005',
    phase: 6,
    question: `Code-Along — creá el Validator para CreateDepartmentCommand:

Archivo: App/Asisya.Plantilla.Application/Features/Departments/Commands/CreateDepartmentCommandValidator.cs

Reglas:
• Name: obligatorio (NotEmpty), máximo 100 caracteres (MaximumLength)
• Description: si se provee, máximo 500 caracteres

Pegá el archivo completo.`,
    type: 'code-along'
  },
  {
    code: 'public class CreateUserCommandValidator\n    : AbstractValidator<CreateUserCommand> {\n    public CreateUserCommandValidator() {\n        RuleFor(x => x.Email)\n            .NotEmpty()\n            .EmailAddress()\n            .When(x => x.Email != null); // ← problema 1\n\n        RuleFor(x => x.Age)\n            .GreaterThan(0)\n            .LessThan(150)\n            .Unless(x => x.Age > 0); // ← problema 2\n    }\n}',
    explanation:
      'Problema 1: .When(x => x.Email != null) hace que NotEmpty() se aplique SOLO cuando Email no es null — significa que Email null pasa la validación. Corrección: quitar el When. Problema 2: .Unless(x => x.Age > 0) aplica las reglas SOLO cuando Age <= 0, que es el caso inválido — al revés. Corrección: quitar el Unless o invertirlo.',
    id: 'F6-006',
    phase: 6,
    question: 'Este validator tiene bugs lógicos graves. Corregilo y explicá qué hace mal el original:',
    type: 'improve-code'
  },

  {
    correct: 1,
    explanation:
      'SaveChangesAsync() toma todos los cambios trackeados y los ejecuta en una transacción. Si algo falla → rollback automático.',
    id: 'F7-001',
    options: [
      'Valida los datos antes de guardar',
      'Ejecuta todos los INSERT/UPDATE/DELETE pendientes en una sola transacción',
      'Guarda solo el último cambio registrado',
      'Sincroniza el schema del código con la DB'
    ],
    phase: 7,
    question: '¿Qué hace SaveChangesAsync() en EF Core?',
    type: 'multiple-choice'
  },
  {
    code: 'public class Product {\n    public long Id { get; set; }\n    public string Name { get; set; }\n    public decimal Price { get; set; }\n    public DateTime CreatedAt { get; set; }\n    public DateTime? UpdatedAt { get; set; }\n}',
    explanation:
      'No hereda de BaseEntity. En este proyecto, BaseEntity provee Id, CreatedAt, UpdatedAt y OnBeforeSaving() los puebla automáticamente.',
    id: 'F7-002',
    phase: 7,
    question: 'Esta entidad tiene un problema en el contexto de este proyecto. ¿Cuál es?',
    type: 'find-bug'
  },
  {
    correct: 2,
    explanation:
      'Una migración = snapshot de cambios al schema. Up() aplica, Down() revierte — como commit y revert en git.',
    id: 'F7-003',
    options: ['git stash', 'npm install', 'git commit (para el schema de la DB)', 'git merge'],
    phase: 7,
    question: 'Las migraciones de EF Core son análogas a:',
    type: 'multiple-choice'
  },
  {
    code: 'var dept = new Department { Name = "IT" };\nawait _unitOfWork.Repository<Department>().AddAsync(dept);\nawait _unitOfWork.CompleteAsync();',
    explanation:
      "EF Core genera un INSERT INTO 'Department'. OnBeforeSaving() agrega CreatedAt = DateTime.UtcNow automáticamente.",
    id: 'F7-004',
    keywords: ['insert', 'into', 'department', 'values', 'it'],
    phase: 7,
    question: '¿Qué tipo de operación SQL genera EF Core con este código? (describí la operación, no el SQL exacto)',
    type: 'know-output'
  },
  {
    explanation:
      "Department hereda de BaseEntity — hereda Id, CreatedAt, UpdatedAt. DepartmentConfiguration implementa IEntityTypeConfiguration<Department>: ToTable('Department','public'), Property(Name).IsRequired().HasMaxLength(100), Property(Description).HasMaxLength(500). En ApplicationDbContext: public DbSet<Department> Departments { get; set; }",
    id: 'F7-005',
    phase: 7,
    question: `Code-Along — creá la entidad y configuración para Department:

Archivo 1: App/Asisya.Plantilla.Domain/Entities/Departments/Department.cs
• Hereda de BaseEntity
• Propiedades: Name (string), Description (string?)

Archivo 2: App/Asisya.Plantilla.Infraestructure/Persistence/Configurations/DepartmentConfiguration.cs
• Tabla 'Department' en schema 'public'
• Name: requerido, máx 100 chars
• Description: máx 500 chars

Además mencioná la línea que agregaste en ApplicationDbContext.cs

Pegá todo.`,
    type: 'code-along'
  },
  {
    code: 'public class ProductConfiguration\n    : IEntityTypeConfiguration<Product> {\n    public void Configure(EntityTypeBuilder<Product> builder) {\n        builder.ToTable("products");       // sin schema\n        builder.HasKey(x => x.ProductId); // campo inexistente en BaseEntity\n        builder.Property(x => x.Name)     // sin IsRequired\n            .HasMaxLength(500);           // demasiado para un nombre\n        builder.Property(x => x.Price)\n            .HasColumnType("varchar(50)"); // precio como string\n    }\n}',
    explanation:
      "4 errores: (1) ToTable sin schema → debe ser ToTable('Product','public'). (2) HasKey(ProductId) → BaseEntity usa 'Id'. (3) Name sin .IsRequired() y MaxLength(500) excesivo para un nombre — usar 100. (4) Price como varchar — los precios son decimal/numeric, nunca string.",
    id: 'F7-006',
    phase: 7,
    question: 'Esta configuración de EF Core tiene múltiples errores. Corregí todos:',
    type: 'improve-code'
  }
]

export function setContentArrays(phases: Phase[], lessons: Lesson[], exercises: Exercise[]): void {
  PHASES = phases
  LESSONS = lessons
  EXERCISES = exercises
}

export function setCoursesData(courses: Course[]): void {
  ALL_COURSES = courses
  COURSES = courses.map((c) => ({
    color: c.color,
    description: c.description,
    icon: c.icon,
    id: c.id,
    name: c.name,
    order: c.order,
    prerequisites: c.prerequisites,
    slug: c.slug
  }))
}

export function activateCourse(slug: string): void {
  const course = ALL_COURSES.find((c) => c.slug === slug)
  if (!course) return
  PHASES = course.phases.map((p) => ({ dbId: p.dbId, icon: p.icon, id: p.id, name: p.name }))
  LESSONS = course.phases.flatMap((p) => p.lessons)
  EXERCISES = course.phases.flatMap((p) => p.exercises)
}
