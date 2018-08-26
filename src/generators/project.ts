import { ProjectGenerator, FileSet } from '@teleporthq/teleport-lib-js'
import TeleportGeneratorReact from '../index'
import packageRenderer from '../renderers/package'
import ReactComponentGenerator from './component'
import { ProjectGeneratorOptions } from '../types'

export default class ReactProjectGenerator extends ProjectGenerator {
  public generator: TeleportGeneratorReact
  public componentGenerator: ReactComponentGenerator

  constructor(generator: TeleportGeneratorReact, componentGenerator: ReactComponentGenerator) {
    super(generator)
    this.componentGenerator = componentGenerator
  }

  public generate(project: any, options?: ProjectGeneratorOptions): FileSet {
    const { components, pages } = project
    const componentsPath = options && options.componentsPath ? options.componentsPath : './components'
    const pagesPath = options && options.pagesPath ? options.pagesPath : './pages'
    const assetsPath = options && options.assetsPath ? options.assetsPath : './static'
    const assetsUrl = options && options.assetsUrl ? options.assetsUrl : '/static'

    const result = new FileSet()

    if (options && options.generatePackageFile) {
      result.addFile('package.json', packageRenderer(project, options))
    }

    if (components) {
      Object.keys(components).map((componentName) => {
        const component = components[componentName]
        const componentResults = this.componentGenerator.generate(component, { componentsPath, assetsUrl, assetsPath })

        componentResults.getFileNames().map(
          (fileName: string): void => {
            result.addFile(`${componentsPath}/${fileName}`, componentResults.getContent(fileName))
          }
        )
      })
    }

    if (pages) {
      Object.keys(pages).map((pageName) => {
        const page = pages[pageName]
        const pageResults = this.componentGenerator.generate(page, { pagesPath, componentsPath, assetsUrl, assetsPath, isPage: true })
        pageResults.getFileNames().map((fileName) => {
          result.addFile(`${pagesPath}/${fileName}`, pageResults.getContent(fileName))
        })
      })
    }

    return result
  }
}
