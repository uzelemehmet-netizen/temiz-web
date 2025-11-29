// Minimal JS wrapper so server-side imports that expect a .js file resolve
// correctly in dev environments.
export default function updatedFetch(input, init) {
  return globalThis.fetch(input, init);
}
