declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

declare module '*.ttf' {
  const value: any;
  export default value;
}

declare module '*.otf' {
  const value: any;
  export default value;
}

declare module '*.onnx' {
  const value: any;
  export default value;
}

declare module '*.wasm' {
  const value: any;
  export default value;
}

// Path aliases
// These invoke the typescript compiler to look up paths in tsconfig.json
// DO NOT ADD: declare module '@/services/*' etc. as it hides all type errors!
