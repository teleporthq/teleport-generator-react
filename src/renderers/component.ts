import upperFirst from 'lodash/upperFirst'
import { ComponentGeneratorOptions } from '../types'

const renderDependency = (libraryName, types, options: ComponentGeneratorOptions) => {
  // there can be only one default import;
  // if multiple, the last one will be used;
  // @todo: discuss how to handle the case where multiple default imports are present
  let defaultType = null
  const deconstructedTypes = []
  if (Array.isArray(types) && types.length > 0) {
    types.map((type) => {
      // if the type is a string
      if (typeof type === 'string') {
        // and it is from components
        if (libraryName.indexOf('../components') === 0 || libraryName.indexOf('./') === 0) {
          // treat it as a default import
          defaultType = type
        } else {
          // otherwise add it to the deconstruction imports
          deconstructedTypes.push(type)
        }
      } else {
        if (type.defaultImport) {
          defaultType = type.type
        } else {
          deconstructedTypes.push(type.type)
        }
      }
    })
  }

  const importArray = []
  if (defaultType) importArray.push(defaultType)
  if (deconstructedTypes.length > 0) {
    importArray.push(`{ ${deconstructedTypes.join(', ')} }`)
  }

  return `import ${importArray.join(', ')} from '${libraryName}'`
}

export default function component(name: string, jsx: string, dependencies: any = {}, styles, props, options?: ComponentGeneratorOptions): any {
  const dependenciesArray = Object.keys(dependencies).map((libraryName) => renderDependency(libraryName, dependencies[libraryName], options))

  let propsString = ''
  if (props && props.length > 0) {
    propsString = `const { ${props.join(', ')} } = this.props`
  }

  let stylesString = ''
  if (styles) {
    const styleNames = Object.keys(styles)
    if (styleNames && styleNames.length) {
      const stylesArray = []
      styleNames.map((styleName) => {
        let styleLinesArray = JSON.stringify(styles[styleName], null, 4).split('\n')
        // filter out the empty lines
        styleLinesArray = styleLinesArray.filter((styleLine) => styleLine.length)
        // add the first line in the same line as the name; it will be the opening "{" of the definition
        stylesArray.push(`${styleName}: ${styleLinesArray[0]}`)
        // add the rest of the lines, except the last
        styleLinesArray.slice(1, styleLinesArray.length - 1).map((stylePropertyString) => {
          stylesArray.push(stylePropertyString)
        })
        // add the last line, as it needs an extra coma at the end
        stylesArray.push(`${styleLinesArray[styleLinesArray.length - 1]},`)
      })

      stylesString = `
        const styles = {
          ${stylesArray.join('\n  ')}
        }
      `
    }
  }

  return `
    import React, { Component } from 'react'
    ${dependenciesArray.join(`\n    `)}

    export default class ${upperFirst(name)} extends Component {
      render () {
        ${propsString}
        return (
          ${jsx}
        )
      }
    }

    ${stylesString}
  `
}
