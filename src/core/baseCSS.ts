import { type CSSResult, unsafeCSS } from 'lit';
import baseStyle from './baseCSS.css';

const baseStyleSheet = unsafeCSS(baseStyle);

export function baseCSS(...css: string[]): CSSResult[] {
  return [baseStyleSheet, ...css.map((c) => unsafeCSS(c))];
}
