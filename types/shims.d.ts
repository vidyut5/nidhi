// Minimal type shim so dynamic import('xlsx') works in TS without bundling server types
declare module 'xlsx' {
  export const read: (data: ArrayBuffer | Uint8Array, opts?: any) => any
  export const utils: { sheet_to_json: (ws: any, opts?: any) => any[] }
}


