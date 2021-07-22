import {setInterval} from "timers";

let histories = new Set<string>()

let timer = setInterval(() => {
    histories.clear()
}, 1000)

function randomId(title: string): string {
    let id = ''
    let check: boolean = true
    do {
        id = `${title}-${(Math.random() * 10e8).toFixed()}`
        check = (histories.has(id) || (document.getElementById(id) != null))
    } while (check)
    timer.refresh()
    histories.add(id)
    return id
}

export {randomId}