const store = new Map();

function register(did, document) {
  if (!did) throw new Error('did required');
  store.set(did, document || { id: did });
}

function resolve(did) {
  return store.get(did) || null;
}

function clear() {
  store.clear();
}

module.exports = { register, resolve, clear };
