<script setup lang="ts">
import { ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import { IconCopy, IconLink } from './icons'
import { ESFunction } from '@/utils/helpers/function.helper'

const monacoEditorRef = ref<InstanceType<typeof MonacoEditor>>()
const htmlValue = ref('')

const previewRef = ref<HTMLElement | null>(null)

const writeWindow = (w: Window, htmlText: string, cssText?: string, jsText?: string) => {
  w.document.open()
  w.document.write(htmlText)
  const cssElement: HTMLStyleElement = document.createElement('style')
  const jsElement: HTMLScriptElement = document.createElement('script')
  cssElement.innerHTML = cssText || ''
  jsElement.innerHTML = jsText || ''
  w.document?.head?.append(cssElement)
  w.document?.body?.append(jsElement)
  w.document.close()
}

const reloadPreview = (htmlText: string) => {
  // return
  if (!previewRef.value) return
  previewRef.value.innerHTML = ''
  const iframeNode = document.createElement('iframe')
  previewRef.value.appendChild(iframeNode)
  const myFrame = previewRef.value.getElementsByTagName('iframe')[0]
  writeWindow(myFrame.contentWindow!, htmlText)
}

const handleUpdateHtmlValue = ESFunction.debounce(reloadPreview, 200)

const copy = () => {
  navigator.clipboard.writeText(htmlValue.value).then(() => {
    // alert("Copied to clipboard!" + code);
  })
}
</script>

<template>
  <div class="html-editor">
    <div class="editor-container">
      <div class="editor-header justify-end">
        <span>HTMLEditor</span>
        <a class="btn ml-auto" href="./html/editor.2.1.html" target="_blank">
          <IconLink />
          <span>v2.1</span>
        </a>
        <button @click="copy">
          <IconCopy />
          <span>Copy</span>
        </button>
      </div>
      <div class="editor-content">
        <MonacoEditor
          ref="monacoEditorRef"
          v-model:value="htmlValue"
          language="html"
          @update:value="(v) => handleUpdateHtmlValue(v)"
        />
      </div>
    </div>
    <div class="preview" ref="previewRef">
      <iframe></iframe>
    </div>
  </div>
</template>
<style lang="scss">
.html-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  padding: 0px;
  // background-color: brown;
  // gap: 10px;
  .editor-container {
    flex-basis: 40%;
    min-width: 500px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    // padding: 10px;
    // background-color: coral;
    .editor-header {
      background-color: #2d2d2d;
      display: flex;
      align-items: center;
      padding: 8px 12px;
      font-size: 14px;
      color: #ccc;
      border-bottom: 1px solid #3a3a3a;
      gap: 1em;

      button,
      a.btn {
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
    flex-basis: 40%;
    min-width: 500px;
    flex: 1;
    background-color: white;
    iframe {
      width: 100%;
      height: 100%;
      min-height: 400px;
    }
  }
}
</style>
