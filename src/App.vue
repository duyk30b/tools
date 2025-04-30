<script setup lang="ts">
import { ref } from 'vue'
import MonacoEditor from './components/MonacoEditor.vue'
import TypescriptEditor from './components/TypescriptEditor.vue'
import HTMLEditor from './components/HTMLEditor.vue'
const type = ref('typescript')
</script>

<template>
  <header class="px-4">
    <div></div>
    <nav class="py-2">
      <button @click="type = 'html'" :class="type === 'html' ? 'active' : ''">HTML</button>
      <button @click="type = 'typescript'" :class="type === 'typescript' ? 'active' : ''">
        Typescript
      </button>
      <!-- <button @click="type = 'sql'" :class="type === 'html' ? 'sql' : ''">SQL</button> -->
    </nav>
  </header>

  <main>
    <div v-if="type === 'html'" style="width: 100%; height: 100%">
      <HTMLEditor />
    </div>
    <div v-if="type === 'typescript'" style="width: 100%; height: 100%">
      <TypescriptEditor />
    </div>
    <div v-if="type === 'sql'" style="width: 800px; height: 800px">
      <MonacoEditor v-model:value="type" language="typescript" />
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
  background-color: green;
  height: calc(100% - 50px);
}
</style>
