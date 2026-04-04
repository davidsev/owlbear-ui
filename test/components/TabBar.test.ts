import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/TabBar.js';
import '../../dist/components/TabButton.js';
import type { ObUITabBar } from '../../dist/components/TabBar.js';
import type { ObUITabButton } from '../../dist/components/TabButton.js';

function getTabs(el: ObUITabBar): ObUITabButton[] {
  return [...el.querySelectorAll('obui-tab-button')] as ObUITabButton[];
}

function sendKey(el: ObUITabBar, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('ObUITabBar', () => {
  it('clicking a tab activates it and deactivates others', async () => {
    const el = await fixture<ObUITabBar>(html`
      <obui-tab-bar>
        <obui-tab-button active>One</obui-tab-button>
        <obui-tab-button>Two</obui-tab-button>
        <obui-tab-button>Three</obui-tab-button>
      </obui-tab-bar>
    `);
    const tabs = getTabs(el);

    tabs[1].shadowRoot!.querySelector('button')!.click();
    await el.updateComplete;

    expect(tabs[0].active).to.be.false;
    expect(tabs[1].active).to.be.true;
    expect(tabs[2].active).to.be.false;
  });

  it('ArrowRight wraps around from last to first', async () => {
    const el = await fixture<ObUITabBar>(html`
      <obui-tab-bar>
        <obui-tab-button active>One</obui-tab-button>
        <obui-tab-button>Two</obui-tab-button>
        <obui-tab-button>Three</obui-tab-button>
      </obui-tab-bar>
    `);

    sendKey(el, 'ArrowRight'); // 1
    sendKey(el, 'ArrowRight'); // 2
    sendKey(el, 'ArrowRight'); // wraps to 0
    await el.updateComplete;

    expect(getTabs(el)[0].active).to.be.true;
  });

  it('ArrowLeft wraps around from first to last', async () => {
    const el = await fixture<ObUITabBar>(html`
      <obui-tab-bar>
        <obui-tab-button active>One</obui-tab-button>
        <obui-tab-button>Two</obui-tab-button>
        <obui-tab-button>Three</obui-tab-button>
      </obui-tab-bar>
    `);

    sendKey(el, 'ArrowLeft'); // wraps to last
    expect(getTabs(el)[2].active).to.be.true;
  });
});
