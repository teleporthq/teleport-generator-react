import { Generator, Target } from '@teleporthq/teleport-lib-js'
import ReactComponentGenerator from './generators/component'
import ReactProjectGenerator from './generators/project'

export default class TeleportGeneratorReact extends Generator {
  // @todo: can we avoid redeclaring target and targetName since they exist on Generator?
  public target: Target
  public targetName: string
  public componentGenerator: ReactComponentGenerator
  public projectGenerator: ReactProjectGenerator

  constructor() {
    super('react-generator', 'react')

    this.componentGenerator = new ReactComponentGenerator(this)
    this.projectGenerator = new ReactProjectGenerator(this, this.componentGenerator)
  }

  public generateComponent(component: any, options: any): string {
    return this.componentGenerator.generate(component, options)
  }

  public generateProject(component: any, options: any): string {
    return this.projectGenerator.generate(component, options)
  }
}
