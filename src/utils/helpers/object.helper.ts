export class ESObject {
  static stringify(data: any) {
    if (typeof data === 'number' || typeof data === 'boolean' || typeof data === 'undefined') {
      return data
    }
    if (typeof data === 'string') {
      return `"${data}"`
    }
    if (typeof data === 'function') {
      return data.toString()
    }
    if (typeof data === 'object') {
      if (data == null) {
        return data
      }
      if (data.name === 'Error') {
        return `Error: ${data.message}`
      }
      try {
        return JSON.stringify(data, null, 2)
      } catch {
        return '[Circular]'
      }
    }
    return data.toString()
  }
}
