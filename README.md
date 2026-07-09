# Proyecto Frontend - React + Vite + TailwindCSS

Este proyecto es un arquetipo base para aplicaciones **React + Vite**, con integración de **TailwindCSS**, **ESLint** y **Prettier** para mantener un código limpio y consistente.

---

## Estructura y convenciones de nombres

#### Carpetas y archivos

- Todo en kebab-case.
- Ejemplo:

```bash
components/
  button-primary/
    button-primary.tsx
    button-primary.module.css
pages/
  home/
    home.tsx
```

#### Componentes

- Nombre del archivo en kebab-case.
- Exportación del componente en PascalCase.
- Ejemplo:

```bash
// archivo: button-primary.tsx
export const ButtonPrimary = () => {
  return <button>Click me</button>;
};
```

#### Funciones

- CamelCase para todas las funciones (miFuncionEjemplo → miFuncionEjemplo).
- Funciones puras / utilidades:
  - Nombre descriptivo con verbo + objeto.
  - Ejemplo: formatDate, calculateTotalPrice.
- Funciones asincrónicas:
  - Prefijo get, fetch, load para operaciones de lectura.
  - Prefijo create, update, delete para operaciones CRUD.
  - Ejemplo: getUsers, createOrder, updateProfile, deleteSession.
- Event handlers (manejadores de eventos):
  - Prefijo handle + acción.
  - Ejemplo: handleClick, handleSubmit, handleChange.
- Funciones de validación:
  - Prefijo is, has, can, should para devolver booleanos.
  - Ejemplo: isValidEmail, hasPermission, canSubmit.
- Callbacks / funciones pasadas como props:
  - Prefijo on + evento.
  - Ejemplo: onLoginSuccess, onFormSubmit.

#### Hooks personalizados

- Prefijo use- y nombre en kebab-case.
- Ejemplo: use-fetch-data.ts.

#### Contextos

- Nombre del feature + -context.
- Ejemplo: auth-context.tsx.

#### Utilidades

- Nombre descriptivo en kebab-case.
- Ejemplo: format-date.ts.

---

## Estructura de carpetas

```bash
src
├── assets
│
├── components
│   ├── footer
│   │   └── footer.tsx
│   ├── header
│   │   └── header.tsx
│   └── login
│       └── login.tsx
│
├── context
│   └── auth-context.tsx
│
├── hooks
│   └── use-fetch-data.tsx
│
├── pages
│   ├── home
│   │   └── home.tsx
│   └── products
│       └── products.tsx
│
├── services
│   ├── home
│   │   └── home.ts
│   ├── products
│   │   └── products.ts
│   └── api-config.ts
│
├── styles
│   └── main.css
│
├── utils
│   ├── consts.ts
│   ├── helpers.ts
│   └── utils.ts
│
├── App.css
├── App.tsx
├── routes.tsx
├── providers.tsx
├── index.css
└── main.tsx
```

#### src

Carpeta principal del código fuente del proyecto. Contiene todos los recursos, componentes, páginas y configuraciones necesarias para la aplicación.

#### assets

Incluye archivos estáticos como imágenes, íconos, fuentes y cualquier recurso visual que será utilizado en la aplicación.

#### components

Contiene componentes reutilizables y atómicos que pueden emplearse en diferentes partes del proyecto.

- **footer**:
  - `footer.tsx`: Componente que representa el pie de página del sitio.
- **header**:
  - `header.tsx`: Componente para la barra superior de navegación o encabezado.
- **login**:
  - `login.tsx`: Componente para la pantalla de inicio de sesión.

#### context

Aquí se maneja la **Context API** para compartir estado global en la aplicación sin necesidad de prop drilling.

- **auth-context.tsx**: Contexto específico para manejar la autenticación de usuarios.

#### hooks

Contiene **custom hooks** con lógica reutilizable para distintos componentes.

- **use-fetch-data.tsx**: Hook para realizar peticiones de datos y reutilizar la lógica de fetching.

#### pages

Almacena las vistas principales del proyecto, cada carpeta corresponde a una página.

- **home**:
  - `home.tsx`: Página principal de la aplicación.
- **products**:
  - `products.tsx`: Página para listar o mostrar el detalle de los productos.

#### services

Incluye toda la lógica para consumir APIs y manejar la capa de servicios.

- **home**:
  - `home.ts`: Funciones para consumir APIs relacionadas con Home.
- **products**:
  - `products.ts`: Funciones para consumir APIs relacionadas con Products.
- **api-config.ts**: Archivo central con la configuración general para las APIs (URLs, endpoints, headers, etc.).

#### styles

Contiene estilos globales del proyecto.

- **main.css**: Archivo principal para estilos que afectan a toda la aplicación.

#### utils

Incluye funciones y utilidades auxiliares que pueden ser usadas en diferentes módulos.

- **consts.ts**: Constantes globales (ej. mensajes, valores fijos).
- **helpers.ts**: Funciones auxiliares para tareas específicas.
- **utils.ts**: Funciones generales para uso común en el proyecto.

#### App.css

Estilos específicos para el componente raíz `App.tsx`.

#### App.tsx

Componente raíz del proyecto React, punto de montaje principal donde se cargan las páginas y componentes globales.

#### index.css

Estilos base/globales, por ejemplo, tipografías, resets o normalización de estilos.

#### main.tsx

Punto de entrada de la aplicación React. Renderiza el componente raíz y monta la aplicación en el DOM.

#### routes.tsx

Definición central de las rutas de la aplicación (con **React Router**). Suele exportar el árbol de rutas, layouts y rutas protegidas.

- **Responsabilidades**:
  - Declarar rutas públicas/privadas (`/<login>`, `/home`, `/products/:id`).
- **Ejemplo de contenido**:
  - Creación del `RouterProvider` o `createBrowserRouter`.
  - Enlaces a componentes de `pages/` y wrappers de autenticación del `context/`.

#### providers.tsx

Punto único para registrar **providers** de alto nivel usados en toda la app.

- **Responsabilidades**:
  - Exponer un componente `<AppProviders>` que envuelva a `App` o al router.
- **Beneficios**:
  - Centraliza dependencias globales.
  - Facilita pruebas (tests) y mantiene `main.tsx` y `App.tsx` más limpios.

---

## Tecnologías utilizadas

- **React + Vite** → Desarrollo rápido con Hot Module Replacement.
- **TailwindCSS** → Utilidades para estilos modernos y responsivos.
- **ESLint** → Linter configurado con reglas para TypeScript, React y estilo de código.
- **Prettier** → Formateo automático con integración de TailwindCSS.

---

## Instalación y configuración

```bash
1. Clona el repositorio:
git clone https://github.com/usuario/nombre-repo.git
cd nombre-repo

2. Instala las dependencias:
pnpm install

3. Inicia el servidor de desarrollo:
pnpm dev

4. Compila para producción:
pnpm run build

5. Ejecuta la aplicación:
pnpm run preview
```

---

## Variables de entorno

- Crear un archivo `.env` basado en `.env.example` con las variables necesarias:
- VITE_PUBLIC_URL=/ejemplo.dev/
- VITE_API_URL=https://api.ejemplo.com

---

## Estilos con TailwindCSS

- Configurado con prettier-plugin-tailwindcss para ordenar automáticamente las clases.
- Archivos CSS globales en src/styles/main.css.

---

## Linter y formateo

- ESLint → reglas estrictas para mantener la calidad del código.
- Prettier → se ejecuta con prettier --write . para formatear automáticamente.
- Configuración recomendada para VSCode:
- Instalar extensiones: ESLint, Prettier, Tailwind CSS IntelliSense.
- Habilitar "editor.formatOnSave": true en tu configuración.
