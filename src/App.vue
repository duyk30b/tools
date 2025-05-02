<script setup lang="ts">
import { emmetHTML } from 'emmet-monaco-es'
import * as monaco from 'monaco-editor'
import { ref } from 'vue'
import HTMLEditor from './components/HTMLEditor.vue'
import TypescriptEditor from './components/TypescriptEditor.vue'
import { CONFIG } from './config'
import { ESTimer } from './utils/helpers/time.helper'

const type = ref<'html' | 'typescript'>('html')
const config = ref(CONFIG)
emmetHTML(monaco, ['html'])
</script>

<template>
  <header class="px-4">
    <nav class="py-2">
      <button @click="type = 'html'" :class="type === 'html' ? 'active' : ''">HTML</button>
      <button @click="type = 'typescript'" :class="type === 'typescript' ? 'active' : ''">
        Typescript
      </button>
    </nav>
    <div style="color: white" class="px-4 flex gap-4">
      <a href="./html/editor.2.1.html" target="_blank">Editor.2.1</a>
      Version: {{ ESTimer.timeToText(config.version, 'vYY.MM.DD.hh-mm', 0) }}
    </div>
  </header>

  <main>
    <div v-if="type === 'html'" style="width: 100%; height: 100%">
      <HTMLEditor />
    </div>
    <div v-if="type === 'typescript'" style="width: 100%; height: 100%">
      <TypescriptEditor />
    </div>
  </main>
</template>

<style scoped lang="scss">
header {
  background-color: #1e1e1e;
  color: #ccc;
  border-bottom: 1px solid #3a3a3a;
  font-size: 16px;
  height: 50px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #3a3a3a;
  nav {
    display: flex;
    justify-content: end;
    align-items: center;
    font-size: 16px;
    color: #ccc;
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
      &.active {
        outline: none;
        background-color: #444;
        box-shadow: 0 0 0 2px #60a5fa80; /* Light blue focus ring */
      }
    }
  }
}
main {
  flex: 1;
  height: calc(100% - 50px);
}
</style>
