import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import tabButtonStyle from './TabButton.css';

@customElement('obui-tab-button')
export class ObUITabButton extends BaseElement {
  static override styles = baseCSS(tabButtonStyle);

  @property({ type: Boolean, reflect: true })
  accessor active = false;

  @property()
  accessor target: HTMLElement | string = '';

  private get _targetPanelId(): string | undefined {
    if (this.target instanceof HTMLElement) {
      return this.target.id || undefined;
    }
    if (typeof this.target === 'string' && this.target.startsWith('#')) {
      return this.target.slice(1) || undefined;
    }
    return undefined;
  }

  /**
   * Resolves the target property to an HTMLElement.
   * Checks getRootNode() first (ShadowRoot-aware), falls back to document.querySelector.
   */
  protected resolveTarget(): HTMLElement | null {
    if (this.target instanceof HTMLElement) {
      return this.target;
    }
    if (typeof this.target === 'string' && this.target) {
      const root = this.getRootNode();
      if (root instanceof ShadowRoot || root instanceof Document) {
        const el = root.querySelector(this.target);
        if (el instanceof HTMLElement) {
          return el;
        }
      }
      if (!(root instanceof Document)) {
        const el = document.querySelector(this.target);
        if (el instanceof HTMLElement) {
          return el;
        }
      }
    }
    return null;
  }

  /**
   * Shows or hides the target element based on the active state.
   * Uses display: '' (not 'initial') for correct reset.
   */
  protected updateTargetVisibility(): void {
    const el = this.resolveTarget();
    if (el) {
      el.style.display = this.active ? '' : 'none';
    }
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('active')) {
      this.updateTargetVisibility();
      const target = this.resolveTarget();
      if (target && !target.hasAttribute('role')) {
        target.setAttribute('role', 'tabpanel');
      }
    }
  }

  override render() {
    return html`
            <button
              role="tab"
              aria-selected=${this.active}
              aria-controls=${ifDefined(this._targetPanelId)}
              tabindex=${this.active ? 0 : -1}
              part="button"
            >
                <slot></slot>
            </button>
        `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-tab-button': ObUITabButton;
  }
}
