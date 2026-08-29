import { expect, fixture, fixtureSync, html } from '@open-wc/testing';
import '../../dist/components/Input.js';
import '../../dist/components/MultiSelect.js';
import '../../dist/components/Select.js';
import '../../dist/components/Slider.js';
import type { ObUIInput } from '../../dist/components/Input.js';
import type { ObUIMultiSelect } from '../../dist/components/MultiSelect.js';
import type { ObUISelect } from '../../dist/components/Select.js';
import type { ObUISlider } from '../../dist/components/Slider.js';

const OPTIONS = { a: 'Alpha', b: 'Beta', c: 'Gamma' };

function entries(form: HTMLFormElement): [string, string][] {
  return [...new FormData(form).entries()] as [string, string][];
}

/**
 * `fixture()` waits a frame for a non-Lit root like `<form>`, and background
 * tabs throttle rAF — wait on the controls themselves instead.
 */
function rendered(form: HTMLFormElement): Promise<unknown[]> {
  const controls = [...form.querySelectorAll('*')].filter(
    (el): el is Element & { updateComplete: Promise<unknown> } =>
      'updateComplete' in el,
  );
  return Promise.all(controls.map((el) => el.updateComplete));
}

describe('FormElement form participation', () => {
  it('submits its value under name, like a native control', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <obui-input name="who" value="ada"></obui-input>
        <obui-slider name="level" value="7"></obui-slider>
        <obui-select name="shape" value="a"></obui-select>
      </form>
    `);
    (form.lastElementChild as ObUISelect).options = OPTIONS;
    await rendered(form);

    expect(entries(form)).to.deep.equal([
      ['who', 'ada'],
      ['level', '7'],
      ['shape', 'a'],
    ]);
  });

  it('submits one entry per selection from obui-multi-select', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form><obui-multi-select name="colours"></obui-multi-select></form>`,
    );
    const el = form.firstElementChild as ObUIMultiSelect;
    el.options = OPTIONS;
    el.value = ['a', 'c'];
    await el.updateComplete;

    expect(entries(form)).to.deep.equal([
      ['colours', 'a'],
      ['colours', 'c'],
    ]);
  });

  it('submits nothing when unnamed or disabled, like a native control', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <obui-input value="anon"></obui-input>
        <obui-input name="off" value="x" disabled></obui-input>
        <obui-multi-select name="none"></obui-multi-select>
      </form>
    `);
    const multi = form.lastElementChild as ObUIMultiSelect;
    multi.options = OPTIONS;
    await rendered(form);

    expect(entries(form)).to.deep.equal([]);
  });

  it('tracks the value as it changes', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form><obui-input name="who" value="ada"></obui-input></form>`,
    );
    const el = form.firstElementChild as ObUIInput;

    el.value = 'grace';
    await el.updateComplete;

    expect(entries(form)).to.deep.equal([['who', 'grace']]);
  });

  // Defaults come from the markup, exactly as a native control's
  // `defaultValue` does — assigning `.value` later doesn't move them.
  it('restores the initial value on form.reset()', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <obui-input name="who" value="ada"></obui-input>
        <obui-slider name="level" value="7"></obui-slider>
        <obui-select name="shape" value="a"></obui-select>
        <obui-multi-select name="colours" value='["a"]'></obui-multi-select>
      </form>
    `);
    const [input, slider, select, multi] = [...form.children] as [
      ObUIInput,
      ObUISlider,
      ObUISelect,
      ObUIMultiSelect,
    ];
    select.options = OPTIONS;
    multi.options = OPTIONS;
    await rendered(form);

    input.value = 'grace';
    slider.value = 20;
    select.value = 'b';
    multi.value = ['b', 'c'];
    await rendered(form);

    form.reset();
    await rendered(form);

    expect(input.value).to.equal('ada');
    expect(slider.value).to.equal(7);
    expect(select.value).to.equal('a');
    expect(multi.value).to.deep.equal(['a']);
    expect(entries(form)).to.deep.equal([
      ['who', 'ada'],
      ['level', '7'],
      ['shape', 'a'],
      ['colours', 'a'],
    ]);
  });

  it('disables its controls inside a <fieldset disabled>', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <fieldset disabled>
          <obui-input name="who" required></obui-input>
          <obui-select name="shape" required></obui-select>
        </fieldset>
      </form>
    `);
    const fieldset = form.firstElementChild as HTMLFieldSetElement;
    const input = fieldset.firstElementChild as ObUIInput;
    const select = fieldset.lastElementChild as ObUISelect;
    await rendered(form);

    // Same shape as a bare <input required> inside a disabled fieldset:
    // barred from constraint validation, and not actually operable.
    expect(input.shadowRoot!.querySelector('input')!.disabled).to.be.true;
    expect(select.getAttribute('aria-disabled')).to.equal('true');
    for (const el of [input, select]) {
      expect(el.willValidate).to.be.false;
      expect(el.validity.valueMissing).to.be.false;
      expect(el.checkValidity()).to.be.true;
      // Form-associated custom elements match :disabled automatically when
      // barred by an ancestor <fieldset disabled> — no attribute needed.
      expect(el.matches(':disabled')).to.be.true;
    }

    fieldset.disabled = false;
    await rendered(form);

    expect(input.shadowRoot!.querySelector('input')!.disabled).to.be.false;
    expect(select.hasAttribute('aria-disabled')).to.be.false;
    for (const el of [input, select]) {
      expect(el.willValidate).to.be.true;
      expect(el.validity.valueMissing).to.be.true;
    }
  });

  it('blocks submission while invalid, like a native control', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form><obui-select name="shape" required></obui-select></form>`,
    );
    const el = form.firstElementChild as ObUISelect;
    el.options = OPTIONS;
    await rendered(form);

    let submitted = false;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitted = true;
    });

    form.requestSubmit();
    expect(submitted).to.be.false;

    el.value = 'a';
    await rendered(form);
    form.requestSubmit();

    expect(submitted).to.be.true;
  });

  it('clears the inner control on form.reset() even when the host value is unchanged', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form><obui-input name="n"></obui-input></form>`,
    );
    const el = form.firstElementChild as ObUIInput;
    await rendered(form);
    const input = el.shadowRoot!.querySelector('input')!;

    // The real case is bad input — "abc" in a number field leaves
    // input.value === '', so the host's value never changes and reset can't
    // rely on a re-render to clear it. Real bad input can't be simulated, so
    // drive the same divergence directly.
    input.value = 'stale';

    form.reset();
    await rendered(form);

    expect(input.value).to.equal('');
  });

  it('does not submit a value that is not one of the options', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <obui-select name="shape" value="gone"></obui-select>
        <obui-multi-select name="colours" value='["a", "gone"]'></obui-multi-select>
      </form>
    `);
    const [select, multi] = [...form.children] as [ObUISelect, ObUIMultiSelect];
    select.options = OPTIONS;
    multi.options = OPTIONS;
    await rendered(form);

    // Unknown keys already read as "nothing selected" for display and
    // validity — submission has to agree.
    expect(entries(form)).to.deep.equal([['colours', 'a']]);
  });

  it('paints a select invalid when a blocked submit is the only interaction', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form><obui-select name="shape" required></obui-select></form>`,
    );
    const el = form.firstElementChild as ObUISelect;
    el.options = OPTIONS;
    await rendered(form);

    form.addEventListener('submit', (e) => e.preventDefault());

    // form.requestSubmit() goes through native constraint validation, not
    // our checkValidity()/reportValidity() overrides — only the 'invalid'
    // event tells the control it's been interacted with.
    form.requestSubmit();
    await rendered(form);

    expect(el.getAttribute('aria-invalid')).to.equal('true');

    form.reset();
    await rendered(form);

    // The native reset algorithm clears user-invalidation state too.
    expect(el.hasAttribute('aria-invalid')).to.be.false;
  });

  it('exposes name as an attribute-backed property, as native controls do', async () => {
    const el = await fixture<ObUIInput>(
      html`<obui-input value="ada"></obui-input>`,
    );

    expect(el.name).to.equal('');

    el.name = 'who';

    expect(el.getAttribute('name')).to.equal('who');
  });
});
