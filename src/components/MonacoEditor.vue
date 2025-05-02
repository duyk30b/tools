<!-- src/components/MonacoEditor.vue -->
<template>
  <div ref="containerRef" class="monaco-container"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

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

    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow, () =>
      editor!.trigger('', 'editor.action.copyLinesDownAction', null),
    )

    editor.onDidChangeModelContent(() => {
      const editorValue = editor!.getValue()
      emit('update:value', editorValue)

      if (props.language === 'typescript') {
        const model = editor!.getModel()
        monaco.languages.typescript
          .getTypeScriptWorker()
          .then((worker) => worker(model!.uri))
          .then(async (client) => {
            // const diagnostics = await client.getSemanticDiagnostics(model!.uri.toString())
            // if (diagnostics.length > 0) {
            //   return console.warn('TypeScript errors found, skip convert.', diagnostics)
            // }
            const result = await client.getEmitOutput(model!.uri.toString())
            const jsOutput = result.outputFiles.find((file) => file.name.endsWith('.js'))
            if (jsOutput) {
              emit('javascript-output', jsOutput.text)
            } else {
              console.warn('No JS output generated.')
            }
          })
      }
    })

    // Danh sách action
    // const actions = editor.getSupportedActions()
    // actions.forEach((action) => {
    //   console.log(`ID: ${action.id}, Label: ${action.label}`)
    // })

    // Danh sách phím tắt
    // const keybindings = editor._standaloneKeybindingService._getResolver()._defaultKeybindings
    // keybindings.forEach((binding) => {
    //   const chords = binding.resolvedKeybinding._chords
    //   const keys = chords.map(
    //     (chord) =>
    //       chord._ctrlKey +
    //       '+' +
    //       chord._shiftKey +
    //       '+' +
    //       chord._altKey +
    //       '+' +
    //       chord._metaKey +
    //       '+' +
    //       chord._keyCode,
    //   )
    //   console.log({
    //     command: binding.command,
    //     keybinding: binding.resolvedKeybinding.getLabel(), // human-readable
    //     rawChordKeys: keys,
    //   })
    // })
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
