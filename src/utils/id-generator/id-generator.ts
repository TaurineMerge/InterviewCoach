export function createIdGenerator(prefix = 'node') {
  let counter = 0;
  return () => `${prefix}_${counter++}`;
}
