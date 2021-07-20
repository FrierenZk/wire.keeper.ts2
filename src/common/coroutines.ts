import {clearInterval, setInterval, setTimeout} from "timers";

export async function waitUntil(callback: (...args: any[]) => boolean, ms: number): Promise<boolean> {
    return await new Promise(r => {
        let t: NodeJS.Timeout | null = null
        setTimeout(() => {
            if (t != null) clearInterval(t)
            r(false)
        }, ms)
        t = setInterval(() => {
            if (callback()) {
                setTimeout(() => {
                    if (t) clearInterval(t)
                }, 10)
                r(true)
            }
        }, 10)
    })
}