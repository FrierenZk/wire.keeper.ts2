import {existsSync, mkdirSync} from 'fs'
import {join, dirname, basename} from 'path'

function prefixPath(path: string): string {
    return join(__dirname, '../../', path)
}

function mkdirIfNotExist(path: string) { // No prefix more
    let dirPath = path.startsWith(join(__dirname, '../../')) ? path : prefixPath(path)
    let slices = []
    while (!existsSync(dirPath)) {
        slices.push(basename(dirPath))
        dirPath = dirname(dirPath)
    }
    while (slices.length > 0) {
        dirPath = join(dirPath, slices.shift()!)
        mkdirSync(dirPath)
        console.log(`Directory "${dirPath}" has been created`)
    }
}

export {prefixPath, mkdirIfNotExist}