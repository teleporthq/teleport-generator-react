import { Generator } from '@teleporthq/teleport-lib-js'

import StyledJSXReactComponentRenderer from './styled-jsx'
import ReactJSSReactComponentRenderer from './react-jss'
import CSSModulesReactComponentRenderer from './css-modules'

export default class TeleportGeneratorReact extends Generator {
  constructor() {
    const componentRenderers = {
      'css-modules': new CSSModulesReactComponentRenderer(),
      default: new ReactJSSReactComponentRenderer(),
      'react-jss': new ReactJSSReactComponentRenderer(),
      'styled-jsx': new StyledJSXReactComponentRenderer(),
    }

    super('react-generator', 'react', componentRenderers)
  }
}
