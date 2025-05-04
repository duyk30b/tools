<script setup lang="ts">
import { ESDom } from '@/utils/dom/highlight'
import * as acorn from 'acorn'
import * as acornWalk from 'acorn-walk'
import { nextTick, ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import IconCopy from './icons/IconCopy.vue'
import IconSyncAlt from './icons/IconSyncAlt.vue'
import WorkerScript from './runtime.worker.ts?worker'
import { ESFunction } from '@/utils/helpers/function.helper'

let worker: Worker | null = null

const monacoEditorRef = ref<InstanceType<typeof MonacoEditor>>()
const logsContainerRef = ref<InstanceType<typeof HTMLElement>>()

const variableList = ref<{ name: string; value: string; type: string }[]>([])
const logsList = ref<string[]>([])

const currentLanguage = ref<'Javascript' | 'Typescript'>('Typescript')

let oldText = ''
let jsText = ''
const tsText = ref('')

const getWorker = (): Worker => {
  if (!worker) {
    worker = (WorkerScript as any)()
    worker?.addEventListener('error', () => {
      worker?.terminate()
      worker = null
    })
    worker?.addEventListener('messageerror', () => {
      worker?.terminate()
      worker = null
    })
  }
  return worker!
}

const showVariablesFomWorker = (varListString: any[]) => {
  variableList.value = varListString.map((i: any) => {
    return {
      type: i.type,
      name: i.name,
      value: ESDom.highlightCode(String(i.value)),
    }
  })
}

const showLogsFomWorker = (logsString: string[]) => {
  // logsList.value = logsString // không dùng do vẫn trỏ vào địa chỉ cũ làm VueJS tưởng không cập nhật
  logsList.value = JSON.parse(JSON.stringify(logsString))
  nextTick(() => {
    if (logsContainerRef.value) {
      const el = logsContainerRef.value
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
        el.scrollTop = el.scrollHeight
      }
    }
  })
}

let executionId = 0
const logsOutput: Record<string, any[]> = {} // lưu log tương ứng với mỗi id khác nhau
const runCodeInWorker = (codeJs: string, varNameList: string[], TIMEOUT_MS = 4000) => {
  const myExecutionId = executionId + 1
  executionId = executionId + 1

  const currentWorker = getWorker()
  const timer = setTimeout(() => {
    currentWorker?.terminate()
    worker = null
    console.warn('Worker execution timeout !!!')
  }, TIMEOUT_MS)

  const onMessage = (e: MessageEvent) => {
    const message: { executionId: number; type: 'Log' | 'Variables' | 'ERROR'; data: any } = e.data
    // do có rất nhiều thằng cùng bắn vào 'message' nên chỉ xử lý message của mình do đã đánh dấu messageId
    if (message.type === 'ERROR') {
      worker?.removeEventListener('message', onMessage)
      logsOutput[message.executionId] = [message.data]
      showLogsFomWorker(logsOutput[message.executionId])
      showVariablesFomWorker([])
      return
    }

    if (message.executionId !== myExecutionId) return
    clearTimeout(timer)
    if (message.executionId < executionId) {
      delete logsOutput[message.executionId] // xóa logs bản cũ đi thôi
      return
    } else {
      if (message.type === 'Variables') {
        showVariablesFomWorker(message.data)
      }
      if (!logsOutput[message.executionId]) {
        logsOutput[message.executionId] = []
      }
      if (message.type === 'Log') {
        logsOutput[message.executionId].push(message.data)
      }
      showLogsFomWorker(logsOutput[message.executionId])
    }
  }

  worker?.addEventListener('message', onMessage)

  const message = { codeJs, varNameList, executionId, TIMEOUT_MS }
  worker?.postMessage(message)
}

const findVariables = async (codeJS: string) => {
  try {
    codeJS = codeJS.replace(/^export\s+/gm, '')
    const ast = acorn.parse(codeJS, { ecmaVersion: 'latest' })

    let foundInfinite = false
    acornWalk.simple(ast, {
      ForStatement(node: any) {
        if (!node.test) foundInfinite = true // for(;;)
      },
      WhileStatement(node: any) {
        if (node.test.type === 'Literal' && node.test.value === true) {
          foundInfinite = true // while(true)
        }
      },
      DoWhileStatement(node: any) {
        if (node.test.type === 'Literal' && node.test.value === true) {
          foundInfinite = true // do{}while(true)
        }
      },
    })
    if (foundInfinite) {
      console.warn('Phát hiện có vòng lặp vô tận: ', codeJS)
      return
    }

    const varNameList: string[] = []
    for (const node of ast.body) {
      if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations) {
          if ((decl.id as any)?.name) {
            varNameList.push((decl.id as any).name)
          }
        }
      } else if (node.type === 'FunctionDeclaration' && node.id?.name) {
        varNameList.push(node.id.name)
      } else if (node.type === 'ClassDeclaration' && node.id?.name) {
        varNameList.push(node.id.name)
      }
    }

    runCodeInWorker(codeJS, varNameList)
  } catch (error) {
    console.log('🚀 ~ ~ findVariables ~ error:', error)
  }
}

const reloadPreview = async (jsTextProp: string) => {
  jsText = jsTextProp
  findVariables(jsTextProp)
}

const handleUpdateJSText = ESFunction.debounce(reloadPreview, 200)

const switchLanguage = () => {
  if (currentLanguage.value === 'Typescript') {
    currentLanguage.value = 'Javascript'
    oldText = tsText.value
    tsText.value = jsText
  } else {
    currentLanguage.value = 'Typescript'
    tsText.value = oldText
  }
}

const copy = () => {
  navigator.clipboard.writeText(tsText.value).then(() => {
    // alert("Copied to clipboard!" + code);
  })
}
</script>

<template>
  <div class="typescript-editor">
    <div class="editor-container">
      <div class="editor-header">
        <span>TypescriptEditor</span>
        <button @click="switchLanguage" style="margin-left: auto">
          <span :style="currentLanguage === 'Javascript' ? '' : 'opacity: 0.3'">Javascript</span>
          <IconSyncAlt />
          <span :style="currentLanguage === 'Typescript' ? '' : 'opacity: 0.3'">Typescript </span>
        </button>

        <button @click="copy">
          <IconCopy />
          <span>Copy</span>
        </button>
      </div>
      <div class="editor-content">
        <MonacoEditor
          ref="monacoEditorRef"
          v-model:value="tsText"
          language="typescript"
          @javascript-output="(v) => handleUpdateJSText(v)"
        />
      </div>
    </div>
    <div class="preview">
      <h3>Global Variable</h3>
      <div class="variable-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in variableList" :key="index">
              <td>
                <div style="color: #9cdcfe">{{ item.name }}</div>
                <div style="color: gray; font-size: 0.8em">{{ item.type }}</div>
              </td>
              <td>
                <div v-html="item.value"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 style="margin-top: 1rem">Console Output</h3>
      <div class="logs-container" ref="logsContainerRef">
        <div v-for="(log, index) in logsList" :key="index">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.typescript-editor {
  width: 100%;
  height: 100%;
  display: flex;
  .editor-container {
    width: 50%;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;

    .editor-header {
      background-color: #2d2d2d;
      display: flex;
      align-items: center;
      padding: 8px 12px;
      font-size: 14px;
      color: #ccc;
      border-bottom: 1px solid #3a3a3a;
      gap: 1em;

      button {
        display: flex;
        align-items: center;
        gap: 0.5em;
        user-select: none;
        color: white;
        border: none;
        cursor: pointer;
        background-color: inherit;
        border-radius: 2px;
        padding: 4px 8px;
        transition:
          background-color 0.2s ease,
          box-shadow 0.2s ease,
          transform 0.1s ease;

        &:hover {
          background-color: #3a3a3a;
        }
        &:focus {
          outline: none;
          background-color: #444;
          box-shadow: 0 0 0 2px #60a5fa80; /* Light blue focus ring */
        }
        &:active {
          transform: scale(0.97);
        }
      }
    }

    .editor-content {
      background-color: orange;
      width: 100%;
      flex: 1;
    }
  }

  .preview {
    width: 50%;
    height: 100%;
    padding: 20px;
    background-color: #252526;
    box-sizing: border-box;
    color: white;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .variable-container {
      height: 60%;
      flex: 3;
      font-size: 14px;
      font-family: monospace;
      overflow: auto;
      border: 1px solid #444;
      table {
        width: 100%;
        border-collapse: collapse;
        th {
          border: 1px solid #444;
          text-align: left;
          background-color: #333;
          padding: 8px;
        }
        td {
          border: 1px solid #444;
          text-align: left;
          padding: 0 8px;
          div {
            white-space: pre;
          }

          .boolean {
            color: #00a7bd;
          }
          .null {
            color: #d88200; /* cam nhạt */
          }
          .variable {
            color: #009688; /* teal đậm */
            color: gray; /* teal đậm */
          }
          .keyword {
            // color: #d16ba5; /* hồng tím nổi bật */
            color: #569cd6; /* hồng tím nổi bật */
          }
          .property {
            // color: #26c6da; /* cyan nhạt */
            color: #569cd6;
          }
          .number {
            color: #f4a261; /* cam sáng */
          }
          .string {
            color: #409444; /* xanh lá pastel đậm */
          }
          .bracket {
            color: #cfd8dc; /* xám xanh nhạt */
            font-weight: bold;
          }
          .key {
            color: #9fa8da; /* tím nhạt dễ đọc */
          }
          .regex {
            color: violet; /* xám rất nhạt, dùng cho fallback */
          }
          .default {
            color: #eceff1; /* xám rất nhạt, dùng cho fallback */
          }
        }
      }
    }
    .logs-container {
      height: 40%;
      flex: 2;
      overflow: auto;
      background-color: #1e1e1e;
      border: 1px solid #444;
      padding: 12px;
      font-family: monospace;
      font-size: 14px;
      color: #9cdcfe;
      white-space: pre-wrap;
      border-radius: 4px;
      box-shadow: inset 0 0 8px #00000055;
    }
  }
}
</style>
