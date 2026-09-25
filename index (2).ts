import type { AppState } from '../../types'

const DB_NAME = 'focus-premium-db'
const STORE_NAME = 'app'
const KEY = 'state'

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1)
  request.onupgradeneeded = () => {
    const db = request.result
    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
  }
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

export const loadState = async (): Promise<AppState | null> => {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(KEY)
    request.onsuccess = () => resolve((request.result as AppState | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
}

export const saveState = async (state: AppState) => {
  const db = await openDatabase()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(state, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
