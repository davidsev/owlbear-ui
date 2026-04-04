import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/TabButton.js';
import type { ObUITabButton } from '../../dist/components/TabButton.js';

describe('ObUITabButton', () => {
  it('hides target when inactive, shows when active', async () => {
    const panel = document.createElement('div');
    panel.id = 'target-panel';
    document.body.appendChild(panel);

    const el = await fixture<ObUITabButton>(
      html`<obui-tab-button target="#target-panel" active>Tab</obui-tab-button>`,
    );
    expect(panel.style.display).to.equal('');

    el.active = false;
    await el.updateComplete;
    expect(panel.style.display).to.equal('none');

    el.active = true;
    await el.updateComplete;
    expect(panel.style.display).to.equal('');

    panel.remove();
  });
});
