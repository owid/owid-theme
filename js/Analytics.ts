declare var window: any

export class Analytics {
    static logEvent(name: string, props?: any) {
        if (!window.amplitude)
            console.log(name, props)
        else {
            window.amplitude.getInstance().logEvent(name, props)
        }
    }
}