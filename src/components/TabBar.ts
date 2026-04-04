import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseElement } from '../core/BaseElement';
import { baseCSS } from '../core/baseCSS';
import tabBarStyle from './TabBar.css';
import { ObUITabButton } from './TabButton';

/**
 * @fires {CustomEvent<{ tab: ObUITabButton }>} tab-change - Dispatched when the active tab changes via user interaction.
 */
@customElement('obui-tab-bar')
export class ObUITabBar extends BaseElement {
  static override styles = baseCSS(tabBarStyle);

  override connectedCallback(): void {
    super.connectedCallback();

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tablist');
    }

    this.addEventListener('click', this._onClick, {
      signal: this.eventCleanupSignal,
    });
    this.addEventListener('keydown', this._onKeydown, {
      signal: this.eventCleanupSignal,
    });
  }

  private _onClick = (e: Event): void => {
    const path = e.composedPath();
    for (const el of path) {
      if (el instanceof ObUITabButton && el !== (this as EventTarget)) {
        if (this.selectTab(el)) {
          this._emitTabChange(el);
        }
        return;
      }
    }
  };

  private _onKeydown = (e: KeyboardEvent): void => {
    const tabs = this._getTabButtons();
    if (tabs.length === 0) return;

    let targetTab: ObUITabButton | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.active);
        targetTab = tabs[currentIndex < tabs.length - 1 ? currentIndex + 1 : 0];
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.active);
        targetTab = tabs[currentIndex > 0 ? currentIndex - 1 : tabs.length - 1];
        break;
      }
      case 'Home': {
        e.preventDefault();
        targetTab = tabs[0];
        break;
      }
      case 'End': {
        e.preventDefault();
        targetTab = tabs[tabs.length - 1];
        break;
      }
    }

    if (targetTab && this.selectTab(targetTab)) {
      this._emitTabChange(targetTab);
      targetTab.shadowRoot?.querySelector('button')?.focus();
    }
  };

  /**
   * Returns all slotted ObUITabButton children.
   */
  private _getTabButtons(): ObUITabButton[] {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return [];
    return slot
      .assignedElements({ flatten: true })
      .filter((el): el is ObUITabButton => el instanceof ObUITabButton);
  }

  private _emitTabChange(tab: ObUITabButton): void {
    this.dispatchEvent(
      new CustomEvent<{ tab: ObUITabButton }>('tab-change', {
        detail: { tab },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Selects a tab by reference, string ID, or null to deselect all.
   * When passed a string, matches against the tab button's id attribute.
   * Returns true if the selection changed, false if already in the requested state.
   * Does not fire events — use the `tab-change` event for user-initiated changes.
   */
  selectTab(tab: ObUITabButton | string | null): boolean {
    const tabs = this._getTabButtons();
    let target: ObUITabButton | null = null;

    if (tab instanceof ObUITabButton) {
      target = tab;
    } else if (typeof tab === 'string') {
      target = tabs.find((t) => t.id === tab) ?? null;
    }

    if (target?.active) return false;

    for (const t of tabs) {
      t.active = t === target;
    }

    return true;
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obui-tab-bar': ObUITabBar;
  }
}
