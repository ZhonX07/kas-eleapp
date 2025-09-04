/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_TITLE?: string
  // 可以根据需要添加更多环境变量类型
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}