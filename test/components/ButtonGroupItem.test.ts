import { expect, fixture, html } from '@open-wc/testing';
import '../../dist/components/ButtonGroupItem.js';
import type { ObUIButtonGroupItem } from '../../dist/components/ButtonGroupItem.js';

describe('ObUIButtonGroupItem', () => {
  it('renders a radio button reflecting value and selected state', async () => {
    const el = await fixture<ObUIButtonGroupItem>(
      html`<obui-button-group-item value="x" selected>X</obui-button-group-item>`,
    );
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('role')).to.equal('radio');
    expect(button.getAttribute('aria-checked')).to.equal('true');
    expect(el.value).to.equal('x');
  });

  it('is not focusable until made tabbable by the parent', async () => {
    const el = await fixture<ObUIButtonGroupItem>(
      html`<obui-button-group-item value="x">X</obui-button-group-item>`,
    );
    const button = el.shadowRoot!.querySelector('button')!;
    expect(button.tabIndex).to.equal(-1);

    el.tabbable = true;
    await el.updateComplete;
    expect(button.tabIndex).to.equal(0);
  });

  it('disables the inner button when disabled', async () => {
    const el = await fixture<ObUIButtonGroupItem>(
      html`<obui-button-group-item value="x" disabled>X</obui-button-group-item>`,
    );
    expect(el.shadowRoot!.querySelector('button')!.disabled).to.be.true;
  });

  it('passes aria-label through to the inner radio (for icon-only segments)', async () => {
    const el = await fixture<ObUIButtonGroupItem>(
      html`<obui-button-group-item value="sq" aria-label="Square grid">&#9633;</obui-button-group-item>`,
    );
    expect(
      el.shadowRoot!.querySelector('button')!.getAttribute('aria-label'),
    ).to.equal('Square grid');
  });
});
