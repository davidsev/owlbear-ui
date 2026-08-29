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

  it('exposes computed validity, without shadow DOM access', async () => {
    const el = await fixture<ObUISelect>(
      html`<obui-select required></obui-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    expect(el.validity.valueMissing).to.be.true;
    expect(el.checkValidity()).to.be.false;

    el.value = 'a';
    await el.updateComplete;

    expect(el.validity.valueMissing).to.be.false;
    expect(el.checkValidity()).to.be.true;
  });

  it('reflects validity synchronously, without awaiting updateComplete', async () => {
    const el = await fixture<ObUISelect>(html`<obui-select></obui-select>`);
    el.options = OPTIONS;

    el.required = true;

    expect(el.validity.valueMissing).to.be.true;
    expect(el.checkValidity()).to.be.false;
  });

  it('matches a bare <input required disabled>: valid while disabled', async () => {
    const el = await fixture<ObUISelect>(
      html`<obui-select required disabled></obui-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    expect(el.validity.valueMissing).to.be.false;
    expect(el.willValidate).to.be.false;
    expect(el.checkValidity()).to.be.true;
    expect(el.validationMessage).to.equal('');

    // ...and it is never painted invalid, even once touched.
    el.dispatchEvent(new Event('blur'));
    await el.updateComplete;

    expect(el.hasAttribute('aria-invalid')).to.be.false;
  });

  it('does not paint an invalid indicator until the user interacts with it', async () => {
    const el = await fixture<ObUISelect>(
      html`<obui-select required></obui-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    // Matches <obui-input>'s native :user-invalid convention: don't flag a
    // required field before the user has had a chance to fill it in.
    expect(el.hasAttribute('aria-invalid')).to.be.false;
    const trigger = el.shadowRoot!.querySelector(
      '.select-trigger',
    ) as HTMLElement;
    expect(trigger.style.borderBottomColor).to.equal('');

    el.dispatchEvent(new Event('blur'));
    await el.updateComplete;

    expect(el.getAttribute('aria-invalid')).to.equal('true');
    expect(trigger.style.borderBottomColor).to.equal('red');

    el.value = 'a';
    await el.updateComplete;

    expect(el.hasAttribute('aria-invalid')).to.be.false;
    expect(trigger.style.borderBottomColor).to.equal('');
  });

  it('reportValidity() also marks the control as touched', async () => {
    const el = await fixture<ObUISelect>(
      html`<obui-select required></obui-select>`,
    );
    el.options = OPTIONS;
    await el.updateComplete;

    const trigger = el.shadowRoot!.querySelector(
      '.select-trigger',
    ) as HTMLElement;
    expect(trigger.style.borderBottomColor).to.equal('');

    el.reportValidity();
    await el.updateComplete;

    expect(el.getAttribute('aria-invalid')).to.equal('true');
    expect(trigger.style.borderBottomColor).to.equal('red');
  });
});
