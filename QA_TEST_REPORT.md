# Nested Loop Challenge – QA report

**Audit date:** October 29, 2026

## Fixes

- Replaced the inconsistent per-mode output panels and moving trace toolbar with a single shared debugger/output panel. Its controls are directly above Live Output across all modes. The panel remains alongside the controls on desktop and stacks on narrow screens.
- Initialized the tutorial only once, retaining code, dropdown selections, and tracing positions while revisiting the tutorial and switching sandbox modes.
- Unified full output and step output around the same Java-subset trace; corrected Restart/Back behavior and avoided stale results after code changes.
- Provided highlighted executing code for guided modes and a mirrored highlighted source view for Type Java.
- Preserved challenge logic, random seed, student identification, teacher preview condition, paste restrictions, JSON save/load, and local PDF generation.

## Test results

- **Node JavaScript syntax checks:** passed (`engine.js`, `app-v4.js`, `pdf-report.js`).
- **Playwright / real Chromium browser:** **14/14 regression groups passed**, including all four sandbox modes; controls adjacent to output; highlighted current statements; state persistence across tab and tutorial navigation; stepping/restarting/back/run-to-end; spaces, newlines and conditionals; source errors and recovery; copy/paste rejection; teacher preview; all 27 challenge screens; completion of ordering, guided dropdown, partial-code, advanced dropdown and independent-code challenges; JSON progress save/load; PDF generation/export; and responsive layouts at 1440, 1024, 820, and 390 pixels. There were no uncaught page JavaScript errors.
- **Java-subset interpreter:** 108 generated valid challenge solutions matched expected outputs, across 27 challenges and four randomized seed sets. Four additional whitespace/operator/descending-loop cases and two error cases passed. Each trace's final output matched the normal output.

## Testing environment limitation

The container's managed Chromium policy blocks navigation to `localhost`, `file://`, and even data URLs. To test in a real browser, the six local website assets were inlined in the browser document and loaded using Playwright `page.set_content()`. Application code and styles remained the same; a localStorage shim was used because this synthetic browser document has an opaque origin. Thus the interactive browser behavior was tested, but a real GitHub Pages HTTP deployment and the live preview were not tested or updated. Check the published website after deploying the ZIP, especially static asset paths and persistence after a browser reload.

## Deployment

Upload all six site files from the ZIP to the root of a GitHub Pages repository, alongside `index.html`. No build step or server is required.
