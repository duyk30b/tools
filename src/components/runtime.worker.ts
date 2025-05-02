import { ESFunction } from '@/utils/helpers/function.helper'
import { ESObject } from '@/utils/helpers/object.helper'

self.onmessage = async (e) => {
  const { codeJs, varNameList, executionId } = e.data
  const TIMEOUT_MS = e.data.TIMEOUT_MS || 10000
  try {
    const customConsole = {
      log: (...args: any) => {
        console.log(...args)
        self.postMessage({
          type: 'Log',
          data: args.map((arg: any) => ESObject.stringify(arg)).join(' '),
          executionId,
        })
      },
    }

    const func = new Function(
      'console',
      ` ${codeJs}
        return { ${varNameList.join(',')} };
      `,
    )

    // bắt lỗi thế này thường ko ý nghĩa lắm, thường là worker đang chết trong vòng lặp rồi, có thoát ra đê chạy tiếp đc đâu
    const varListPlain: any = await ESFunction.runTimeout(func(customConsole), TIMEOUT_MS)

    self.postMessage({
      type: 'Variables',
      data: Object.keys(varListPlain).map((key) => {
        let type: string = typeof varListPlain[key]
        if (type === 'object') {
          type = Object.prototype.toString.call(varListPlain[key])
        }
        return {
          name: key,
          value: ESObject.stringify(varListPlain[key]),
          type,
        }
      }),
      executionId,
    })
  } catch (err: any) {
    console.warn('[WORKER ERROR]:', err)
    self.postMessage({ type: 'ERROR', data: ` ERROR: ${err.message}`, executionId })
  }
}
