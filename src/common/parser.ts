function parseArray(json: string): Array<any> {
    try {
        return Array.from(JSON.parse(json))
    } catch (e) {
        console.error(e)
    }
    return []
}

function parseMap(json: string): Map<string, any> {
    try {
        return new Map(Object.entries(JSON.parse(json)))
    } catch (e) {
        console.error(e)
    }
    return new Map()
}

function stringifyMap(map: Map<any, any>): string {
    return JSON.stringify(convertMapToObject(map))
}

function convertMapToObject(map: Map<any, any>): object {
    let object = Object.create(null)
    map.forEach((value, key) => {
        if (value instanceof Map) object[key] = convertMapToObject(value)
        else object[key] = value
    })
    return object
}


export {parseArray, parseMap, stringifyMap, convertMapToObject}