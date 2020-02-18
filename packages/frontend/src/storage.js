import { serialiseIdentity, unSerialiseIdentity } from 'libsemaphore'

const localStorage = window.localStorage

const key = 'Identity'

const initStorage = () => {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, '')
  }
}

const storeId = identity => {
  localStorage.setItem(key, serialiseIdentity(identity))
}

const retrieveId = () => {
  return unSerialiseIdentity(localStorage.getItem(key))
}

const hasId = () => {
  const d = localStorage.getItem(key)
  return d != null && d.length > 0
}

export { initStorage, storeId, retrieveId, hasId }
