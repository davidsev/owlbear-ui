import { LitElement } from 'lit';
import { baseCSS } from './baseCSS';

/**
 * Base class for all owlbear-ui components.
 *
 * - Extends LitElement
 * - Applies baseCSS() as default styles
 * - Provides AbortController cleanup on disconnectedCallback()
 * - No per-instance OBR theme subscription (ThemeManager handles it globally)
 */
export class BaseElement extends LitElement {
  static styles = baseCSS();

  private static _nextId = 0;
  protected readonly _uniqueId = `obui-${BaseElement._nextId++}`;

  private _abortController: AbortController | null = null;

  /**
   * Returns an AbortSignal that is aborted when the element is disconnected.
   * Useful for cleaning up event listeners and subscriptions.
   */
  protected get eventCleanupSignal(): AbortSignal {
    if (!this._abortController) {
      this._abortController = new AbortController();
    }
    return this._abortController.signal;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  }
}
