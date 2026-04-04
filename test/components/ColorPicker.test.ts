import { expect } from '@open-wc/testing';
import '../../dist/components/ColorPicker.js';
import type { ObUIColorPicker } from '../../dist/components/ColorPicker.js';

describe('ObUIColorPicker', () => {
  let el: ObUIColorPicker;

  beforeEach(async () => {
    el = document.createElement('obui-color-picker') as ObUIColorPicker;
    document.body.appendChild(el);
    await el.updateComplete;
  });

  afterEach(() => {
    el.remove();
  });

  it('hexa combines color and opacity', async () => {
    el.color = '#ff0000';
    el.opacity = 1;
    await el.updateComplete;
    expect(el.hexa).to.equal('#ff0000ff');

    el.opacity = 0.5;
    await el.updateComplete;
    expect(el.hexa).to.equal('#ff000080');

    el.opacity = 0;
    await el.updateComplete;
    expect(el.hexa).to.equal('#ff000000');
  });

  it('normalizes named colors and shorthand hex', async () => {
    el.opacity = 1;

    el.color = 'red';
    await el.updateComplete;
    expect(el.hexa).to.equal('#ff0000ff');

    el.color = '#0ff';
    await el.updateComplete;
    expect(el.hexa).to.equal('#00ffffff');

    el.color = 'rebeccapurple';
    await el.updateComplete;
    expect(el.hexa).to.equal('#663399ff');
  });

  it('clicking swatch opens dialog; backdrop click closes it', () => {
    const swatch =
      el.shadowRoot!.querySelector<HTMLButtonElement>('button.swatch')!;
    const dialog = el.shadowRoot!.querySelector<HTMLDialogElement>('dialog')!;
    expect(dialog.open).to.be.false;

    swatch.click();
    expect(dialog.open).to.be.true;

    dialog.dispatchEvent(new PointerEvent('click', { bubbles: true }));
    expect(dialog.open).to.be.false;
  });
});
