import { ComponentGenerator, FileSet } from '@teleporthq/teleport-lib-js'
import * as _ from 'lodash'
import * as prettier from 'prettier-standalone'

import TeleportGeneratorReact from '../index'
import JSXrenderer from '../renderers/jsx'
import COMPONENTrenderer from '../renderers/component'
import prettierOptions from '../options/prettier'

function findNextIndexedKeyInObject(object, key) {
  if (! object[key]) return key
  let i=1
  while (object[key + "_" + i] !== undefined) {
    i++
  }
  return key + "_" + i
}

export default class ReactComponentGenerator extends ComponentGenerator {
  public generator: TeleportGeneratorReact

  constructor(generator: TeleportGeneratorReact) {
    super(generator)
  }

  public processStyles(componentContent: any, styles: any): any {
    const content = JSON.parse(JSON.stringify(componentContent))

    if (content.style) {
      const styleName = findNextIndexedKeyInObject(styles, content.name || content.type)
      styles[styleName] = content.style
      content.style = [styleName]
      // @todo: handle platform
    }

    // if has children, do the same for children
    if (content.children && content.children.length > 0) {
      if (typeof content.children !== "string") {
        content.children = content.children.map( child => {
          const childStyledResults = this.processStyles(child, styles)
          styles = {
            ...styles,
            ...childStyledResults.styles
          }
          return childStyledResults.content
        })
      }
    }

    return { styles, content }
  }

  public computeDependencies(content: any): any {
    const dependencies = {}

    const { source, type, children, ...otherProps } = content

    if (source && type) {
      if (source === 'components') {
        return {
          [`components/${type}`]: [ type ]
        }
      }

      if (source === 'pages') {
        return {
          [`pages/${type}`]: [ type ]
        }
      }

      const mapping = this.generator.target.map(source, type)

      if (mapping) {
        if (mapping.library) {
          // if the library is not yet in the dependecnies, add it
          if (! dependencies[mapping.library]) dependencies[mapping.library] = []

          // if the type is not yet in the deps for the current library, add it
          if (dependencies[mapping.library].indexOf(mapping.type) < 0) dependencies[mapping.library].push(mapping.type)
        }
      } else {
        console.error(`could not map '${type}' from '${source}' for target '${this.generator.targetName}'`)
      }
    }

    // if there are childrens, get their deps and merge them with the current ones
    if (children && children.length > 0 && typeof children !== "string") {
      const childrenDependenciesArray = children.map(( child ) => this.computeDependencies(child))
      if (childrenDependenciesArray.length) {
        childrenDependenciesArray.forEach( childrenDependency => {
          Object.keys(childrenDependency).forEach( childrenDependencyLibrary => {
            if (! dependencies[childrenDependencyLibrary]) dependencies[childrenDependencyLibrary] = []

            // tslint:disable-next-line:max-line-length
            dependencies[childrenDependencyLibrary] = _.union(
              dependencies[childrenDependencyLibrary],
              childrenDependency[childrenDependencyLibrary]
            )
          })
        })
      }
    }

    return dependencies
  }

  public renderComponentJSX(content: any): any {
    const { source, type, ...props } = content

    // retieve the target type from the lib
    let mapping: any = null
    let mappedType: string = type
    if (source !== 'components' && source !== 'pages') {
      mapping = this.generator.target.map(source, type)
      if (mapping) mappedType = mapping.type
    }

    let styleNames = null

    if (props.style) styleNames = props.style
    delete props.style

    // there are cases when no children are passed via structure, so the deconstruction will fail
    let children = null
    if (props.children) children = props.children
    // remove the children from props
    delete props.children

    let childrenJSX: any = []
    if (children && children.length > 0) {
      if (typeof children === "string") childrenJSX = children
      else childrenJSX = children.map( child => this.renderComponentJSX(child) )
    }

    if (Array.isArray(childrenJSX)) {
      childrenJSX = childrenJSX.join('')
    }

    styleNames = styleNames ? styleNames.map(style => "styles." + style).join(', ') : null

    const { name, props: componentProps, ...otherProps } = props // this is to cover img uri props; aka static props

    let mappedProps = { ...componentProps, ...otherProps }

    if (mapping && typeof mapping.props === 'function') {
      mappedProps = mapping.props(mappedProps)
    }

    return JSXrenderer(mappedType, childrenJSX, styleNames, mappedProps)
  }

  // tslint:disable-next-line:no-shadowed-variable
  public generate(component: any, options: any = {}): FileSet {
    const { name } = component
    let { content } = component

    const dependencies = this.computeDependencies(content)

    const stylingResults = this.processStyles(content, {})

    const styles = stylingResults.styles
    content = stylingResults.content

    // tslint:disable-next-line:no-shadowed-variable
    const jsx = this.renderComponentJSX(content)

    const props = ( component.editableProps ? Object.keys(component.editableProps) : null )

    // tslint:disable-next-line:max-line-length
    const result = new FileSet()
    result.addFile(
      `${_.upperFirst(component.name)}.js`,
      // tslint:disable-next-line:max-line-length
      prettier.format(COMPONENTrenderer(name, jsx, dependencies, styles, props), prettierOptions)
    )

    return result
    // return COMPONENTrenderer(name, jsx, dependencies, styles, props)
  }
}
