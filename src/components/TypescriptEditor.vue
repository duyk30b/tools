<script setup lang="ts">
import * as acorn from 'acorn'
import { onMounted, ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import IconCopy from './icons/IconCopy.vue'
import IconSyncAlt from './icons/IconSyncAlt.vue'

const monacoEditor = ref<InstanceType<typeof MonacoEditor>>()
const logOutputElement = ref<InstanceType<typeof HTMLElement>>()

const variableList = ref<{ name: string; value: string }[]>([])

const currentLanguage = ref<'Javascript' | 'Typescript'>('Typescript')

let oldText = ''
let jsText = ''
const tsText = ref('')

onMounted(() => {
  tsText.value = `enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Cancelled = 4
}

interface Product {
  id: number;
  name: string;
  price: number;
  tags: string[];
  available: boolean;
}

let userInfo: [string, number] = ['Alice', 30];

let productCount: number = 5;
let shopName: string = 'My Shop';
let isOpen: boolean = true;

let categories: string[] = ['Electronics', 'Books', 'Clothing'];
let prices: Array<number> = [100, 200, 150];

const product1: Product = {
  id: 1,
  name: 'Smartphone',
  price: 499.99,
  tags: ['electronics', 'mobile'],
  available: true
};

function calculateTotal(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.price, 0);
}

let productList: Product[] = [product1];
const newProduct: Product = {
  id: 3,
  name: 'T-Shirt',
  price: 19.99,
  tags: ['clothing'],
  available: true
};

productList.push(newProduct);
console.log('Updated product list:', productList);
`
})

function walk(node: acorn.Node, callback: (node: acorn.Node, depth: number) => void, depth = 0) {
  callback(node, depth)
  // Không duyệt các biến bên trong các block
  const blockScopeTypes = ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']
  if (blockScopeTypes.includes(node.type)) {
    return
  }

  for (const key in node) {
    const child = (node as any)[key]
    if (Array.isArray(child)) {
      child.forEach((n) => n && typeof n.type === 'string' && walk(n, callback, depth + 1))
    } else if (child && typeof child.type === 'string') {
      walk(child, callback, depth + 1)
    }
  }
}

function findVariables(code: string) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020 })
    const vars: any = []

    walk(ast, (node: any) => {
      if (node.type === 'VariableDeclarator' && node.id && node.id.name) {
        vars.push(node.id.name)
      }
      if (node.type === 'FunctionDeclaration' && node.id) {
        vars.push(node.id.name)
      }
      if (node.type === 'ClassDeclaration' && node.id) {
        vars.push(node.id.name)
      }
    })

    const logs: string[] = []
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(
          args
            .map((arg) => {
              try {
                return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              } catch {
                return '[Unserializable]'
              }
            })
            .join(' '),
        )
      },
    }

    const func = new Function(
      'console',
      ` ${code}
        return { ${[...vars].join(',')} };
      `,
    )
    const resultFunc = func(customConsole)

    const varList = Object.keys(resultFunc).map((key: string) => {
      let value: any = resultFunc[key]
      if (typeof value === 'object' && value !== null) {
        try {
          value = JSON.stringify(value, null, 2)
        } catch {
          value = '[Circular]'
        }
      }
      return { name: key, value }
    })

    return { varList, logs }
  } catch (error) {
    console.log('🚀 ~ ~ findVariables ~ error:', error)
  }
}

const reloadPreview = async (jsTextProp: string) => {
  jsText = jsTextProp
  const response = findVariables(jsTextProp)
  if (!response) return

  variableList.value = response.varList
  if (logOutputElement.value) {
    logOutputElement.value.textContent = response.logs.join('\n \n')
  }
}

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
        <span>Typescript</span>
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
          ref="monacoEditor"
          v-model:value="tsText"
          language="typescript"
          @javascript-output="(v) => reloadPreview(v)"
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
              <td>{{ item.name }}</td>
              <td>
                <pre>{{ item.value }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 style="margin-top: 1rem;">Console Output</h3>
      <div ref="logOutputElement" class="logs-container"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
