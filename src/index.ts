import { Generator, FileSet } from '@teleporthq/teleport-lib-js'
import ReactComponentGenerator from './generators/component'
import ReactProjectGenerator from './generators/project'

export default class TeleportGeneratorReact extends Generator {
  // @todo: can we avoid redeclaring componentGenerator and projectGenerator since they exist on Generator?
  public componentGenerator: ReactComponentGenerator
  public projectGenerator: ReactProjectGenerator

  constructor() {
    super('react-generator', 'react')

    this.componentGenerator = new ReactComponentGenerator(this)
    this.projectGenerator = new ReactProjectGenerator(this, this.componentGenerator)
  }

  public generateComponent<T, U>(component: T, options: U): FileSet {
    return this.componentGenerator.generate(component, options)
  }

  public generateProject(component: any, options: any): FileSet {
    return this.projectGenerator.generate(component, options)
  }
}
