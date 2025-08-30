declare module 'prismjs' {
  // Minimal typing shim for PrismJS used by marked-highlight integration
  const Prism: unknown;
  export default Prism;
}

declare module 'prismjs/components/prism-markup' {
  const noop: unknown;
  export default noop;
}

declare module 'prismjs/components/prism-css' {
  const noop: unknown;
  export default noop;
}

declare module 'prismjs/components/prism-javascript' {
  const noop: unknown;
  export default noop;
}

declare module 'prismjs/components/prism-typescript' {
  const noop: unknown;
  export default noop;
}
