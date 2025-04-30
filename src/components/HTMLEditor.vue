<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const htmlValue = ref('')

onMounted(() => {
  htmlValue.value = `<!DOCTYPE html>
<html lang="vi">

<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table, th, td { border: 1px solid black; border-collapse: collapse; padding: 5px; }
  </style>
</head>

<body>
  <h2>Chào mừng đến với trang demo</h2>
  <img src="https://picsum.photos/200/100" alt="Ảnh mẫu" />
  <h2>Liên hệ</h2>
  <form>
    <label>Họ tên: <input type="text" name="name" /></label><br />
    <label>Email: <input type="email" name="email" /></label><br />
    <input type="submit" value="Gửi" />
  </form>
  <footer>
    <p>&copy; 2025 Trang web demo</p>
  </footer>
</body>

</html>
`
})

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
  if (!previewRef.value) return
  previewRef.value.innerHTML = ''
  const iframeNode = document.createElement('iframe')
  previewRef.value.appendChild(iframeNode)
  const myFrame = previewRef.value.getElementsByTagName('iframe')[0]
  writeWindow(myFrame.contentWindow!, htmlText)
}
</script>

<template>
  <div class="html-editor">
    <div class="editor-content">
      <MonacoEditor
        v-model:value="htmlValue"
        language="html"
        @update:value="(v) => reloadPreview(v)"
      />
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
  .editor-content {
    flex-basis: 40%;
    min-width: 400px;
    flex: 1;
    // padding: 10px;
    // background-color: coral;
  }
  .preview {
    flex-basis: 40%;
    min-width: 400px;
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
