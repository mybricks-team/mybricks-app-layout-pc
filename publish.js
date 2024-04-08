const shelljs = require("shelljs")
const pkgJson = require("./package.json")
const fs = require("fs")
const path = require('path')
const args = process.argv.slice(2)
const isOffline = !!args.find((a) => a === "offline")
const noServiceUpdate = !!args.find((a) => a === "--noServiceUpdate")
const origin =
  args.find((a) => a.startsWith("--origin=")) ??
  "--origin=https://my.mybricks.world"

const ClearFiles = ['mybricks-app-layout-pc', 'mybricks-app-layout-pc-vue2']

const publishReactAppOffline = () => {
  return new Promise((resolve) => {
    const buildCommand = `cd pages && npm run build:react-offline`
    shelljs.exec(buildCommand, () => {
      const syncCommand = `node sync_offline.js react`
      shelljs.exec(syncCommand, resolve)
    })
  })
}

const publishReactAppOnline = () => {
  return new Promise((resolve) => {
    const buildCommand = `cd pages && npm run build:react`
    shelljs.exec(buildCommand, () => {
      const syncCommand = `npm publish --registry=https://registry.npmjs.org && node sync.js ${origin} --appType=react ${noServiceUpdate ? "--noServiceUpdate" : ""
        }`
      shelljs.exec(syncCommand, resolve)
    })
  })
}


const clearZipPkg = () => {
  const dirPath = path.resolve(__dirname)
  const files = fs.readdirSync(dirPath)
  files.forEach(file => {
    if (ClearFiles.some(filename => file.includes(filename)) && file.endsWith('.zip')) {
      fs.unlinkSync(path.join(dirPath, file))
    }
  })
}

const execChain = (fns) => {
  fns.reduce((chain, fn) => chain.then(fn), Promise.resolve())
}

if (isOffline) {
  execChain([
    clearZipPkg,
    publishReactAppOffline,
  ])
} else {
  execChain([
    publishReactAppOnline,
  ])
}
