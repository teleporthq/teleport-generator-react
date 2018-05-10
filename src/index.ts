import teleport from './teleport'
import ReactComponentGenerator from './generators/component'
import ReactProjectGenerator from './generators/project'

const { Generator } = teleport

export default class TeleportGeneratorReact extends Generator {
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
