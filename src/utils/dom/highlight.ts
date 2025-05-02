export class ESDom {
  static highlightCode = (code: string) => {
    const escape = String(code).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const str = escape

    return str.replace(
      new RegExp(
        [
          '"(?:\\\\.|[^"\\\\])*?"\\s*:', // Bắt "key": (với dấu ":" ở cuối)
          '"(?:\\\\.|[^"\\\\])*?"', // Bắt chuỗi bình thường "value"
          `'(?:\\\\.|[^'\\\\])*'`, // chuỗi đơn
          '`(?:\\\\.|[^`\\\\])*`', // template string
          '\\b(true|false|null|undefined|const|let|var|class|function|return|if|else|for|while|do|switch|case|break|static|async|await|Promise|new)\\b',
          '[{}\\[\\]()]', // nhớ escape [] và \
          '\\b-?\\d+(\\.\\d+)?\\b', // Số (nguyên hoặc thập phân, bao gồm dấu -)
          '\\/(\\\\\\/|[^\\/\\n])+\\/[gimsuy]*', // regex literal
        ].join('|'),
        'g',
      ),
      (match: any) => {
        let cls = ''
        if (/^".*":\s*$/.test(match)) {
          cls = 'property'
        } else if (
          /^'(?:\\.|[^'\\])*'$/.test(match) ||
          /^"(?:\\.|[^"\\])*"$/.test(match) ||
          /^`(?:\\.|[^`\\])*`$/.test(match)
        ) {
          cls = 'string'
        } else if (/^(true|false)$/.test(match)) {
          cls = 'boolean'
        } else if (/^(null|undefined)$/.test(match)) {
          cls = 'null'
        } else if (/^(const|let|var)$/.test(match)) {
          cls = 'variable'
        } else if (
          /^(class|function|return|if|else|for|while|do|switch|case|break|static|async|await|Promise|new)$/.test(match)
        ) {
          cls = 'keyword'
        } else if (/^[{}\[\]()]$/.test(match)) {
          cls = 'bracket'
        } else if (/^\-?\d+(\.\d+)?$/.test(match)) {
          cls = 'number'
        } else if (/^\/(\\\/|[^\/\n])+\/[gimsuy]*$/.test(match)) {
          cls = 'regex'
        }
        return `<span class="${cls}">${match}</span>`
      },
    )
  }
}
