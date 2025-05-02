import * as fs from 'fs'

const time = new Date().toISOString()
console.log('🚀 ~ Write config with: time =', time)

fs.writeFileSync(
  './src/config.ts',
  `export const CONFIG = {
  version: "${time}",
}
`,
)
