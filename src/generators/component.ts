import { ComponentGenerator, FileSet } from '@teleporthq/teleport-lib-js'
import upperFirst from 'lodash/upperFirst'
import union from 'lodash/union'

import TeleportGeneratorReact from '../index'
import { ComponentGeneratorOptions } from '../types'
import JSXrenderer from '../renderers/jsx'
import COMPONENTrenderer from '../renderers/component'

/**
 * Cleans path from leading and tailing "." and "/" characters
 * @param pathString
 */
function cleanPath(pathString) {
  return pathString
    .replace(/^\.\./, '')
    .replace(/^\./, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
}

/**
 * Given a source directory and a target filename, return the relative
 * file path from source to target.
 * @param source {String} directory path to start from for traversal
 * @param target {String} directory path and filename to seek from source
 * @return Relative path (e.g. "../../style.css") as {String}
 */
function getRelativePath(source, target) {
  const sep = '/'
  const targetArr = target.split(sep)
  const sourceArr = source.split(sep)
  const filename = targetArr.pop()
  const targetPath = targetArr.join(sep)
  let relativePath = ''

  while (targetPath.indexOf(sourceArr.join(sep)) === -1) {
    sourceArr.pop()
    relativePath += '..' + sep
  }

  const relPathArr = targetArr.slice(sourceArr.length)

  if (relPathArr.length) {
    relativePath += relPathArr.join(sep) + sep
  }

  return relativePath + filename
}

function findNextIndexedKeyInObject(object, key) {
  if (!object[key]) return key
  let i = 1
  while (object[key + '_' + i] !== undefined) {
    i++
  }
  return key + '_' + i
}

const defaultOption = {
  assetsPath: './static',
  assetsUrl: '/static',
  componentsPath: './components',
  isPage: false,
  pagesPath: './pages',
}

export default class ReactComponentGenerator extends ComponentGenerator {
  public generator: TeleportGeneratorReact

  constructor(generator: TeleportGeneratorReact) {
    super(generator)
  }

  public processStyles(componentContent: any, styles: any): any {
    const content = JSON.parse(JSON.stringify(componentContent))

    if (content.style) {
      const styleName = content.name || findNextIndexedKeyInObject(styles, content.name || content.type)
      styles[styleName] = content.style
      content.style = [styleName]
    }

    // if has children, do the same for children
    if (content.children && content.children.length > 0) {
      if (typeof content.children !== 'string') {
        content.children = content.children.map((child) => {
          const childStyledResults = this.processStyles(child, styles)
          styles = {
            ...styles,
            ...childStyledResults.styles,
          }
          return childStyledResults.content
        })
      }
    }

    return { styles, content }
  }

  public computeDependencies(content: any, options?: ComponentGeneratorOptions): any {
    const dependencies = {}

    const { type, children, props } = content
    let { source } = content

    // if no source is specified, default to 'components'
    if (!source) source = 'components'

    if (type) {
      if (source === 'components') {
        const { isPage, pagesPath, componentsPath } = options || defaultOption

        const cleanedPages = cleanPath(pagesPath || './pages')
        const cleanedComponents = cleanPath(componentsPath || './components')

        const relativePagesToComponentsPath = getRelativePath(cleanedPages, cleanedComponents)

        const componentsRelativePath = isPage ? relativePagesToComponentsPath : '.'

        const componentDependencies = {
          [`${componentsRelativePath}/${type}`]: [
            {
              defaultImport: true,
              type,
            },
          ],
        }

        if (props && props.children && props.children.length > 0 && typeof props.children !== 'string') {
          const childrenDependenciesArray = props.children.map((child) => {
            return this.computeDependencies(child, options)
          })

          if (childrenDependenciesArray.length) {
            childrenDependenciesArray.forEach((childrenDependency) => {
              Object.keys(childrenDependency).forEach((childrenDependencyLibrary) => {
                if (!componentDependencies[childrenDependencyLibrary]) componentDependencies[childrenDependencyLibrary] = []

                componentDependencies[childrenDependencyLibrary] = union(
                  componentDependencies[childrenDependencyLibrary],
                  childrenDependency[childrenDependencyLibrary]
                )
              })
            })
          }
        }

        return componentDependencies
      }

      const elementMapping = this.generator.target.map(source, type)
      // custom source case
      if (elementMapping) {
        if (elementMapping.source) {
          // if the library is not yet in the dependencies, add it
          if (!dependencies[elementMapping.source]) dependencies[elementMapping.source] = []

          // if the type is not yet in the deps for the current library, add it
          if (dependencies[elementMapping.source].indexOf(elementMapping.type) < 0)
            dependencies[elementMapping.source].push({
              // @ts-ignore
              defaultImport: elementMapping.defaultImport,
              type: elementMapping.type,
            })
        }
      } else {
        // tslint:disable:no-console
        // console.error(`could not map '${type}' from '${source}' for target '${this.generator.targetName}'`)
      }
    }

    // if there are childrens, get their deps and merge them with the current ones
    if (children && children.length > 0 && typeof children !== 'string') {
      const childrenDependenciesArray = children.map((child) => this.computeDependencies(child, options))
      if (childrenDependenciesArray.length) {
        childrenDependenciesArray.forEach((childrenDependency) => {
          Object.keys(childrenDependency).forEach((childrenDependencyLibrary) => {
            if (!dependencies[childrenDependencyLibrary]) dependencies[childrenDependencyLibrary] = []

            dependencies[childrenDependencyLibrary] = union(dependencies[childrenDependencyLibrary], childrenDependency[childrenDependencyLibrary])
          })
        })
      }
    }

    return dependencies
  }

  public renderComponentJSX(content: any, options: ComponentGeneratorOptions): any {
    const { source, type, ...props } = content

    // retieve the target type from the lib
    let mapping: any = null
    let mappedType: string = type
    if (source !== 'components') {
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
      if (typeof children === 'string') {
        if (children.indexOf('$props.') === 0) {
          const propKey = children.replace('$props.', '')
          childrenJSX = `{this.props.${propKey}}`
        } else {
          // override Html default behavior regarding left and right trimming
          if (children.indexOf(' ') === 0) children = '&nbsp;' + children

          if (children.substr(children.length - 1) === ' ') children += '&nbsp;'

          // check for < and > and replace with their html entities otherwise
          childrenJSX = children.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }
      } else {
        childrenJSX = children.map((child) => this.renderComponentJSX(child, options))
      }
    }

    styleNames = styleNames ? styleNames.map((style) => 'styles.' + style).join(', ') : null

    const { name, props: componentProps, ...otherProps } = props // this is to cover img uri props; aka static props

    let mappedProps = { ...componentProps, ...otherProps }

    if (mapping && typeof mapping.props === 'function') {
      mappedProps = mapping.props(mappedProps)
    }

    if (mappedProps.children && Array.isArray(mappedProps.children)) {
      childrenJSX = mappedProps.children.map((child) => this.renderComponentJSX(child, options))
      delete mappedProps.children
    }

    if (Array.isArray(childrenJSX)) {
      childrenJSX = childrenJSX.join('')
    }

    return JSXrenderer(mappedType, childrenJSX, styleNames, mappedProps, options)
  }

  public generate(component: any, options: ComponentGeneratorOptions): FileSet {
    const { name } = component
    let { content } = component

    const dependencies = this.computeDependencies(content, options)

    const stylingResults = this.processStyles(content, {})

    const styles = stylingResults.styles
    content = stylingResults.content

    const jsx = this.renderComponentJSX(content, options)

    const props = component.editableProps ? Object.keys(component.editableProps) : null

    const result = new FileSet()
    result.addFile(`${upperFirst(component.name)}.js`, COMPONENTrenderer(name, jsx, dependencies, styles, props, options))

    return result
  }
}
