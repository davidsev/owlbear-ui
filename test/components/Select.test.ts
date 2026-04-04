import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/Select.js';
import type { ObUISelect } from '../../dist/components/Select.js';

const OPTIONS = { a: 'Alpha', b: 'Beta', c: 'Gamma' };

function dropdown(el: ObUISelect): HTMLElement {
  return el.shadowRoot!.querySelector('[role="listbox"]')!;
}

function items(el: ObUISelect): HTMLElement[] {
  return [
    ...el.shadowRoot!.querySelectorAll('[role="option"]'),
  ] as HTMLElement[];
}

function sendKey(el: ObUISelect, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('ObUISelect', () => {
  it('ArrowDown opens dropdown and navigates through items', async () => {
    const el = await fixture<ObUISelect>(html`<obui-select></obui-select>`);
    el.options = OPTIONS;
    await el.updateComplete;

    sendKey(el, 'ArrowDown'); // open + focus 0
    await el.updateComplete;
    expect(dropdown(el).classList.contains('open')).to.be.true;
    expect(items(el)[0].classList.contains('focused')).to.be.true;

    sendKey(el, 'ArrowDown'); // focus 1
    await el.updateComplete;
    expect(items(el)[1].classList.contains('focused')).to.be.true;
  });

  it('ArrowUp navigates upward and clamps at first item', async () => {
    const el = await fixture<ObUISelect>(html`<obui-select></obui-select>`);
    el.options = OPTIONS;
    await el.updateComplete;

    sendKey(el, 'ArrowDown'); // open + 0
    sendKey(el, 'ArrowDown'); // 1
    sendKey(el, 'ArrowUp'); // 0
    sendKey(el, 'ArrowUp'); // still 0
    await el.updateComplete;

    expect(items(el)[0].classList.contains('focused')).to.be.true;
  });

  it('Enter selects focused item and closes dropdown', async () => {
    const el = await fixture<ObUISelect>(html`<obui-select></obui-select>`);
    el.options = OPTIONS;
    await el.updateComplete;

    let changeEvent: Event | null = null;
    el.addEventListener('change', (e) => {
      changeEvent = e;
    });

    sendKey(el, 'ArrowDown'); // open + 0 ("a")
    sendKey(el, 'Enter');
    await el.updateComplete;

    expect(el.value).to.equal('a');
    expect(changeEvent).to.exist;
    expect(changeEvent!.composed).to.be.true;
    expect(dropdown(el).classList.contains('open')).to.be.false;
  });

  it('Escape closes without selecting', async () => {
    const el = await fixture<ObUISelect>(html`<obui-select></obui-select>`);
    el.options = OPTIONS;
    el.value = 'a';
    await el.updateComplete;

    el.dispatchEvent(new Event('focus'));
    await el.updateComplete;

    sendKey(el, 'Escape');
    await el.updateComplete;

    expect(el.value).to.equal('a');
    expect(dropdown(el).classList.contains('open')).to.be.false;
  });

  it('click on item selects it', async () => {
    const el = await fixture<ObUISelect>(html`<obui-select></obui-select>`);
    el.options = OPTIONS;
    await el.updateComplete;

    el.dispatchEvent(new Event('focus'));
    await el.updateComplete;

    items(el)[2].click(); // "c"
    await el.updateComplete;

    expect(el.value).to.equal('c');
  });

  it('does not open when disabled', async () => {
    const el = await fixture<ObUISelect>(
      html`<obui-select disabled></obui-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    el.dispatchEvent(new Event('focus'));
    await el.updateComplete;

    expect(el.getAttribute('aria-expanded')).to.equal('false');
  });
});
