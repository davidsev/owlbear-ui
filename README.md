# @davidsev/owlbear-ui

A shared UI component library for [Owlbear Rodeo](https://www.owlbear.rodeo/) extensions, built with [Lit](https://lit.dev/) web components.

## Install

```bash
npm install @davidsev/owlbear-ui
```

**Peer dependencies:**
- `@owlbear-rodeo/sdk` ^3.0.0 (required for OBR theme sync)
- `vanilla-colorful` ^0.7.0 (optional, only needed for `<obui-color-picker>`)

## Quick Start

```typescript
import { ThemeManager } from '@davidsev/owlbear-ui';

// In an OBR extension — sync theme with Owlbear Rodeo:
ThemeManager.getInstance().connectOBR();

// Or set the theme manually:
ThemeManager.getInstance().setTheme('dark');
```

Importing the library automatically injects the theme stylesheet and defaults to dark mode. All components are registered as custom elements on import.

## Components

```typescript
import '@davidsev/owlbear-ui';
```

| Tag | Description |
|-----|-------------|
| `<obui-button>` | Styled button with hover underline effect |
| `<obui-input>` | Text/number input with bottom-border styling |
| `<obui-select>` | Single-value dropdown |
| `<obui-multi-select>` | Multi-value dropdown with checkboxes |
| `<obui-tab-bar>` | Tab container that manages `<obui-tab-button>` children |
| `<obui-tab-button>` | Individual tab that shows/hides a target element |
| `<obui-help-tooltip>` | "?" button that opens a modal dialog |
| `<obui-toggle>` | Toggle switch with checked/disabled states |

The color picker is a separate import to keep `vanilla-colorful` opt-in:

```typescript
import '@davidsev/owlbear-ui/color-picker';
```

| Tag | Description |
|-----|-------------|
| `<obui-color-picker>` | Color swatch button that opens a hex+alpha picker dialog |

## Theme Manager

The `ThemeManager` singleton handles theme switching and injects CSS custom properties (`--text-rgb`, `--theme-rgb`, `--background-rgb`, `--panel-rgb`) onto `:root`.

```typescript
import { ThemeManager } from '@davidsev/owlbear-ui';

const tm = ThemeManager.getInstance();

// Automatic OBR sync:
tm.connectOBR();

// Manual control:
tm.setTheme('light');
tm.setTheme('dark');

// Read current state:
console.log(tm.darkMode); // true or false

// Listen for changes:
tm.addEventListener('change', () => {
    console.log('Theme changed to', tm.darkMode ? 'dark' : 'light');
});
```

## Example

```html
<obui-input type="number" min="1" max="100" value="5" aria-label="Grid Size"></obui-input>

<obui-tab-bar>
    <obui-tab-button active target="#panel-a">Settings</obui-tab-button>
    <obui-tab-button target="#panel-b">About</obui-tab-button>
</obui-tab-bar>
<div id="panel-a">Settings content here.</div>
<div id="panel-b" style="display: none;">About content here.</div>
```

## Custom Components

Extend `BaseElement` to create your own components that inherit the theme and base styles:

```typescript
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseElement, baseCSS } from '@davidsev/owlbear-ui';

@customElement('my-widget')
class MyWidget extends BaseElement {
    static override styles = baseCSS(`
        :host { padding: 1rem; }
    `);

    override render() {
        return html`<p>Themed widget</p>`;
    }
}
```

## Full Documentation

See [docs.html](docs.html) for interactive examples, complete property/event reference, and code snippets for every component.
