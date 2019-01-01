declare var window: any

export class Analytics {
    static logEvent(name: string, props?: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!window.amplitude) {
                console.log(name, props)
                resolve()
            } else {
                window.amplitude.getInstance().logEvent(name, props, () => {
                    resolve()
                })
            }
        })
    }
}