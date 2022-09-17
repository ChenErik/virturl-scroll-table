import type { VNodeChild, ComponentPublicInstance, FunctionalComponent, PropType as VuePropType, } from 'vue'
declare global {
  declare type PropType<T> = VuePropType<T>;
  declare type Recordable<T = any> = Record<string, T>;
  declare function parseInt(s: string | number, radix?: number): number;

  declare function parseFloat(string: string | number): number;
}

declare module 'vue' {
  export type JSXComponent<Props = any> =
    | { new(): ComponentPublicInstance<Props> }
    | FunctionalComponent<Props>;
}
