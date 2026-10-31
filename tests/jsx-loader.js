import { registerHooks } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { transformSync } from 'rolldown/utils'

const sourceRoot = new URL('../src/', import.meta.url).href

// Render the real source components in Node without adding a browser/test dependency.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && context.parentURL?.startsWith(sourceRoot)) {
      for (const extension of ['.js', '.jsx']) {
        const candidate = new URL(`${specifier}${extension}`, context.parentURL)
        if (existsSync(candidate)) return nextResolve(candidate.href, context)
      }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot) && /\.(jsx|js)$/.test(url)) {
      const result = transformSync(fileURLToPath(url), readFileSync(new URL(url), 'utf8'), {
        jsx: { runtime: 'automatic' }, define: { 'import.meta.env': '{}' },
      })
      return { format: 'module', source: result.code, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
