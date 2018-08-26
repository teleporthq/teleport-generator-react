import { ProjectGeneratorOptions } from '../types'

export default function packageRenderer(project: any, options?: ProjectGeneratorOptions): any {
  const pkg = {
    author: project.userSlug || 'Unknown',
    dependencies: {
      next: '^5.1.0',
      react: '^16.3.0',
      'react-dom': '^16.3.0',
    },
    description: project.description || '',
    license: 'ISC',
    name: project.slug,
    scripts: {
      build: 'next build',
      dev: 'next',
      start: 'next start',
    },
    version: project.version || '0.0.1',
  }
  return JSON.stringify(pkg, null, 2)
}
