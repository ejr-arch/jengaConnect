# JengaConnect — clickable wireframe + buyer flowchart

A greyscale, low-fidelity prototype for a local surplus-building-materials marketplace in Kampala & Wakiso.

## Files

| File | Purpose |
| --- | --- |
| `jengaconnect-clickable.html` | Self-contained clickable prototype. Open it directly in a browser. No server, build step or external assets. |
| `jengaconnect-flowchart.mmd` | Mermaid `flowchart TD` source for the buyer journey and seller lane. |
| `FLOWCHART.md` | The flowchart code plus export/print instructions. |
| `index.html` | The earlier static 9-frame wireframe canvas, kept as a reference. |
| `jengaconnect-wireframes.png` | Image export of that static canvas. |

The prototype is designed for a **390 × 844** phone screen and is centred inside a phone outline on wider screens. It shrinks vertically on shorter laptop screens so the whole frame stays visible, and scrolls inside the phone when needed.

## Using the clickable prototype

1. Open `jengaconnect-clickable.html` by double-clicking it.
2. Start on **Browse**. Search by material, enter a minimum quantity, and filter by area.
3. Open one of the three sample listings.
4. Use **Ask the seller** to ask a quick question and propose an inspection slot.
5. **Send request** opens **Collection**, where the four-step tracker starts at *Contacted*.
6. Press **Next status** to advance the tracker. **Mark complete** only becomes available at *Collected*.
7. Use **Requests** to return to the collection or review a completed exchange.
8. Use **Report listing** on a listing, or **Problem? Report to moderators** on Collection, to open the report form.
9. The small **Restart** link sits outside the phone frame and reloads the prototype.

The **Account** tab intentionally says “Not part of this prototype”.

## What is interactive

- Live search and area/quantity filtering; empty state reads exactly “No matching listings nearby”.
- Three sample listings: Material A, Material B and Material C, with generic quantities.
- Listing → Contact → Collection → Complete path.
- Quick-question chips fill the message box.
- Contacted → Inspected → Agreed → Collected status tracker.
- Report sheet from both Listing and Collection; submission returns to the origin screen and shows “Report sent to moderators”.
- Requests and Account tabs, bottom navigation, and Restart.

## Wireframe rules used

- White/light-grey surfaces, dark-grey text and outlines, one dark-grey primary button fill.
- System font only; no icons, illustrations, shadows, gradients or brand colours.
- Grey boxes are labelled “photo”; prices are shown as `UGX ___`; areas are only Kampala and Wakiso.
- The exact site address is explicitly withheld.
- Five small dark numbered circles mark the key features:
  1. Search and filters
  2. Structured listing
  3. Seller contact and inspection
  4. Collection status
  5. Report to moderators

## Editing

- All copy is in the screen markup inside `jengaconnect-clickable.html`.
- The three sample listings are in the `LISTINGS` array near the top of the `<script>` block.
- Screen switching is handled by `showScreen(name)`; screen IDs follow the pattern `screen-browse`, `screen-listing`, and so on.
- The report sheet is a single modal (`#reportModal`) reused from both entry points.
- State such as the selected listing, request details and tracker position lives in the `state` object.

## Buyer flowchart

The Mermaid chart keeps the buyer journey on the left and a parallel **Seller** lane on the right. Decisions use labelled Yes/No arrows, unsuitable listings loop back to Browse, and the seller hand-offs are noted on the Published, Answer questions and Confirm collection steps.

See `FLOWCHART.md` for the source and image/print export steps.

## Scope

This is a wireframe prototype, not a production application. There is no login, payment, real messaging, saved data or backend. The exact address and price values are deliberately left blank, and only the buyer-side flow plus the moderator report path are implemented.
