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
}
