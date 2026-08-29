import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/MultiSelect.js';
import type { ObUIMultiSelect } from '../../dist/components/MultiSelect.js';

const OPTIONS = { r: 'Red', g: 'Green', b: 'Blue' };

function dropdown(el: ObUIMultiSelect): HTMLElement {
  return el.shadowRoot!.querySelector('[role="listbox"]')!;
}

function sendKey(el: ObUIMultiSelect, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('ObUIMultiSelect', () => {
  it('toggles item on and off via keyboard', async () => {
    const el = await fixture<ObUIMultiSelect>(
      html`<obui-multi-select></obui-multi-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    sendKey(el, 'ArrowDown'); // open + focus 0
    sendKey(el, 'Enter'); // toggle "r" on
    await el.updateComplete;

    expect(el.value).to.deep.equal(['r']);
    expect(changeCount).to.equal(1);

    sendKey(el, 'Enter'); // toggle "r" off
    await el.updateComplete;

    expect(el.value).to.deep.equal([]);
    expect(changeCount).to.equal(2);
  });

  it('dropdown stays open after toggle (unlike single select)', async () => {
    const el = await fixture<ObUIMultiSelect>(
      html`<obui-multi-select></obui-multi-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    sendKey(el, 'ArrowDown');
    sendKey(el, 'Enter');
    await el.updateComplete;

    expect(dropdown(el).classList.contains('open')).to.be.true;
  });

  it('checkbox state reflects value array', async () => {
    const el = await fixture<ObUIMultiSelect>(
      html`<obui-multi-select></obui-multi-select>`,
    );
    el.options = OPTIONS;
    el.value = ['g'];
    await el.updateComplete;

    const cbs = [
      ...el.shadowRoot!.querySelectorAll('input[type="checkbox"]'),
    ] as HTMLInputElement[];
    expect(cbs[0].checked).to.be.false; // r
    expect(cbs[1].checked).to.be.true; // g
    expect(cbs[2].checked).to.be.false; // b
  });

  it('exposes computed validity, without shadow DOM access', async () => {
    const el = await fixture<ObUIMultiSelect>(
      html`<obui-multi-select required></obui-multi-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    expect(el.validity.valueMissing).to.be.true;
    expect(el.checkValidity()).to.be.false;

    el.value = ['r'];
    await el.updateComplete;

    expect(el.validity.valueMissing).to.be.false;
    expect(el.checkValidity()).to.be.true;
  });

  it('treats a value made up entirely of unknown keys as unselected', async () => {
    const el = await fixture<ObUIMultiSelect>(
      html`<obui-multi-select required></obui-multi-select>`,
    );
    el.options = OPTIONS;
    el.value = ['gone'];
    await el.updateComplete;

    // Must agree with `_formValue`/`_displayText`, which already drop
    // unknown keys — otherwise the field reports valid but submits nothing.
    expect(el.validity.valueMissing).to.be.true;
    expect(el.checkValidity()).to.be.false;
  });
});
