export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'azure-devops-task-id': [2, 'always']
  },
  plugins: [
    {
      rules: {
        'azure-devops-task-id': ({ raw }) => {
          const pattern = /AB#\d+$/
          return [
            pattern.test(raw.trim()),
            'El mensaje de commit debe terminar con un ID de tarea de Azure DevOps (ejemplo: "feat: add login AB#123")'
          ]
        }
      }
    }
  ]
}
