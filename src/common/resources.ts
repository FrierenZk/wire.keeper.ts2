import {readdirSync, readFileSync} from 'fs'
import {prefixPath} from "./path";
import {app} from "electron";

let stringMap: Map<string, Map<string, string>> = new Map()

let langs: Array<string> = []

let language = 'en-US'

if (app) {
    app.on('ready', () => {
        language = app.getLocale()
        console.log(language)
    })
} else if (navigator) {
    if (navigator.language.length > 0)
        language = navigator.language
    console.log(language)
}

readdirSync(prefixPath('./data/lang'),).forEach(value => {
    if (value.endsWith('.json')) langs.push(value.replace('.json', ''))
})

function loadLang(lang: string) {
    if (!lang.includes(lang)) return console.error('Can not load lang=' + lang + ' file')
    try {
        let map = new Map<string, string>()
        JSON.parse(readFileSync(prefixPath('./data/lang/' + lang + '.json')).toString(), (key, value) => {
            map.set(key, value)
        })
        stringMap.set(lang, map)
    } catch (e) {
        console.error(e)
    }
}

loadLang('en-US')

function withWarn(id: string, warn: string): string {
    console.warn(warn)
    return id
}

function defaultWithWarn(id: string, warn: string, ...args: string[]): string {
    console.warn(warn)
    return readDefault(id, ...args)
}

function readLocal(id: string, ...args: string[]): string { // Size of args should not over 10.
    if (!langs.includes(language)) return defaultWithWarn(id, 'Not support ' + language + ' yet', ...args)
    if (!stringMap.has(language)) loadLang(language)
    let strings = stringMap.get(language)
    if (strings == null) return defaultWithWarn(id, 'Load configuration failed with ' + language, ...args)
    if (!strings.has(id)) return defaultWithWarn(id, 'Can not find ' + id + ' in ' + language, ...args)
    return replaceAll(strings.get(id)!!, ...args)
}

function readDefault(id: string, ...args: string[]): string { // Size of args should not over 10.
    if (!stringMap.has('en-US')) return withWarn(id, 'Load configuration failed with en-US')
    let text = stringMap.get('en-US')?.get(id)
    if (text) return replaceAll(text, ...args)
    else return withWarn(id, 'Can not find ' + id + ' in en-US')
}

function replaceAll(text: string, ...args: string[]): string {
    args.forEach((value, index) => {
        text = text.replace('$' + index.toString(), value)
    })
    return text
}

export {readLocal, readDefault}