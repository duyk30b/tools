<!-- src/components/MonacoEditor.vue -->
<template>
  <div ref="containerRef" class="monaco-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps<{
  value: string
  language?: 'javascript' | 'typescript' | 'html' | 'css'
  theme?: 'vs-dark' | 'vs-light'
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'javascript-output', value: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (containerRef.value) {
    editor = monaco.editor.create(containerRef.value, {
      value: props.value,
      language: props.language || 'html',
      theme: props.theme || 'vs-dark',
      readOnly: props.readOnly ?? false,
      automaticLayout: true,
      formatOnType: true,
      minimap: { enabled: false },
      tabSize: 2,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      padding: {
        top: 24,
        bottom: 12,
      },
    })

    editor.addAction({
      id: `format-monaco`,
      label: 'Format Document',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      run: function () {
        return editor!.getAction('editor.action.formatDocument')?.run()
      },
    })

    editor.onDidChangeModelContent(() => {
      emit('update:value', editor!.getValue())

      if (props.language === 'typescript') {
        const model = editor!.getModel()
        monaco.languages.typescript
          .getTypeScriptWorker()
          .then((worker) => worker(model!.uri))
          .then((client) => {
            client.getEmitOutput(model!.uri.toString()).then((result) => {
              const jsOutput = result.outputFiles.find((file) => file.name.endsWith('.js'))
              if (jsOutput) {
                emit('javascript-output', jsOutput.text)
              } else {
                console.warn('No JS output generated.')
              }
            })
          })
      }
    })
  }
})

watch(
  () => props.value,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue)
    }
  },
)

onBeforeUnmount(() => {
  editor?.dispose()
})
</script>

<style scoped>
.monaco-container {
  width: 100%;
  height: 100%;
}
</style>
