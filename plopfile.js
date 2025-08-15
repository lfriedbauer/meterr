/**
 * Plop Code Generator Configuration
 * Generate boilerplate code instantly
 * Run: pnpm plop <generator-name>
 */

module.exports = (plop) => {
  // Set custom helpers
  plop.setHelper('titleCase', (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  });

  // 1. API Route Generator
  plop.setGenerator('api', {
    description: 'Generate a complete API route with validation and tests',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'API route name (e.g., "users", "tokens"):',
        validate: (value) => {
          if (!value) return 'Name is required';
          if (!/^[a-z-]+$/.test(value)) return 'Use lowercase with hyphens only';
          return true;
        },
      },
      {
        type: 'list',
        name: 'method',
        message: 'HTTP methods to support:',
        choices: ['GET', 'POST', 'GET,POST', 'GET,POST,PUT,DELETE'],
        default: 'GET,POST',
      },
      {
        type: 'confirm',
        name: 'needsAuth',
        message: 'Requires authentication?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'needsValidation',
        message: 'Add Zod validation?',
        default: true,
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'apps/app/app/api/{{dashCase name}}/route.ts',
        templateFile: 'templates/api-route.hbs',
      },
      {
        type: 'add',
        path: 'apps/app/app/api/{{dashCase name}}/route.test.ts',
        templateFile: 'templates/api-route-test.hbs',
      },
      {
        type: 'add',
        path: 'apps/app/app/api/{{dashCase name}}/schema.ts',
        templateFile: 'templates/api-schema.hbs',
        skip: (data) => (!data.needsValidation ? 'Skipping validation schema' : undefined),
      },
    ],
  });

  // 2. React Component Generator
  plop.setGenerator('component', {
    description: 'Generate a React component with tests and stories',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., "TokenCounter"):',
        validate: (value) => {
          if (!value) return 'Name is required';
          if (!/^[A-Z][a-zA-Z]*$/.test(value)) return 'Use PascalCase';
          return true;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Component type:',
        choices: ['functional', 'client', 'server'],
        default: 'functional',
      },
      {
        type: 'confirm',
        name: 'withState',
        message: 'Include state management?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'withTests',
        message: 'Include tests?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withStory',
        message: 'Include Storybook story?',
        default: false,
      },
    ],
    actions: (data) => {
      const actions = [
        {
          type: 'add',
          path: 'packages/@meterr/ui/src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
          templateFile: 'templates/component.hbs',
        },
        {
          type: 'add',
          path: 'packages/@meterr/ui/src/components/{{pascalCase name}}/index.ts',
          templateFile: 'templates/component-index.hbs',
        },
      ];

      if (data.withTests) {
        actions.push({
          type: 'add',
          path: 'packages/@meterr/ui/src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
          templateFile: 'templates/component-test.hbs',
        });
      }

      if (data.withStory) {
        actions.push({
          type: 'add',
          path: 'packages/@meterr/ui/src/components/{{pascalCase name}}/{{pascalCase name}}.stories.tsx',
          templateFile: 'templates/component-story.hbs',
        });
      }

      return actions;
    },
  });

  // 3. Database Model Generator
  plop.setGenerator('model', {
    description: 'Generate a database model with TypeScript types',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Model name (singular, e.g., "user", "token"):',
        validate: (value) => {
          if (!value) return 'Name is required';
          if (!/^[a-z]+$/.test(value)) return 'Use lowercase singular';
          return true;
        },
      },
      {
        type: 'input',
        name: 'fields',
        message: 'Fields (comma-separated, e.g., "name:string,email:string,age:number"):',
      },
      {
        type: 'confirm',
        name: 'withTimestamps',
        message: 'Include timestamps (createdAt, updatedAt)?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withCRUD',
        message: 'Generate CRUD operations?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [
        {
          type: 'add',
          path: 'packages/@meterr/database/src/models/{{camelCase name}}.ts',
          templateFile: 'templates/model.hbs',
        },
        {
          type: 'add',
          path: 'packages/@meterr/database/src/types/{{camelCase name}}.ts',
          templateFile: 'templates/model-types.hbs',
        },
      ];

      if (data.withCRUD) {
        actions.push({
          type: 'add',
          path: 'packages/@meterr/database/src/queries/{{camelCase name}}.ts',
          templateFile: 'templates/model-queries.hbs',
        });
      }

      return actions;
    },
  });

  // 4. Custom Hook Generator
  plop.setGenerator('hook', {
    description: 'Generate a custom React hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (without "use" prefix, e.g., "TokenData"):',
        validate: (value) => {
          if (!value) return 'Name is required';
          if (!/^[A-Z][a-zA-Z]*$/.test(value)) return 'Use PascalCase';
          return true;
        },
      },
      {
        type: 'list',
        name: 'type',
        message: 'Hook type:',
        choices: ['state', 'fetch', 'subscription', 'custom'],
        default: 'fetch',
      },
      {
        type: 'confirm',
        name: 'withTests',
        message: 'Include tests?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [
        {
          type: 'add',
          path: 'packages/@meterr/ui/src/hooks/use{{pascalCase name}}.ts',
          templateFile: 'templates/hook.hbs',
        },
      ];

      if (data.withTests) {
        actions.push({
          type: 'add',
          path: 'packages/@meterr/ui/src/hooks/use{{pascalCase name}}.test.ts',
          templateFile: 'templates/hook-test.hbs',
        });
      }

      return actions;
    },
  });

  // 5. Full Feature Generator (combines multiple generators)
  plop.setGenerator('feature', {
    description: 'Generate a complete feature (API + UI + DB)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (e.g., "billing", "analytics"):',
        validate: (value) => {
          if (!value) return 'Name is required';
          if (!/^[a-z-]+$/.test(value)) return 'Use lowercase with hyphens';
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'withDatabase',
        message: 'Include database model?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withAPI',
        message: 'Include API routes?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'withUI',
        message: 'Include UI components?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [];

      if (data.withDatabase) {
        actions.push({
          type: 'add',
          path: 'packages/@meterr/database/src/models/{{camelCase name}}.ts',
          templateFile: 'templates/model.hbs',
        });
      }

      if (data.withAPI) {
        actions.push({
          type: 'add',
          path: 'apps/app/app/api/{{dashCase name}}/route.ts',
          templateFile: 'templates/api-route.hbs',
        });
      }

      if (data.withUI) {
        actions.push({
          type: 'add',
          path: 'apps/app/app/{{dashCase name}}/page.tsx',
          templateFile: 'templates/page.hbs',
        });
        actions.push({
          type: 'add',
          path: 'packages/@meterr/ui/src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
          templateFile: 'templates/component.hbs',
        });
      }

      return actions;
    },
  });
};
