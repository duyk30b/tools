export class ESFunction {
  static sleep = async (time: number) => {
    return await new Promise((resolve) =>
      setTimeout(() => {
        resolve(time)
      }, time),
    )
  }

  static runTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${timeout}ms`)), timeout),
    )
    return Promise.race([promise, timeoutPromise])
  }

  static debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: ReturnType<typeof setTimeout> | null

    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout)

      timeout = setTimeout(() => {
        func(...args)
        timeout = null
      }, delay)
    }
  }

  static throttle = (func: (...args: any[]) => void, delay: number) => {
    let lastCall = 0

    return function (...args: any[]) {
      const now = new Date().getTime()

      if (now - lastCall >= delay) {
        lastCall = now
        return func(...args)
      }
    }
  }
}
