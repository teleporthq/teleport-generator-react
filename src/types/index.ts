export interface ProjectGeneratorOptions {
  componentsPath?: string
  pagesPath?: string
  assetsPath?: string
  assetsUrl?: string
  generatePackageFile?: boolean
}

export interface ComponentGeneratorOptions {
  isPage?: boolean
  componentsPath?: string
  pagesPath?: string
  assetsPath?: string
  assetsUrl?: string
}
