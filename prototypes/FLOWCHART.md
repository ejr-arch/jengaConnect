# JengaConnect — buyer journey flowchart

The source file is [`jengaconnect-flowchart.mmd`](jengaconnect-flowchart.mmd).

The chart is a greyscale `flowchart TD` with:

- rounded **Start** and **End** nodes;
- rectangles for **screens** and **actions**;
- diamonds for decisions, with **Yes** and **No** paths;
- loops back to **Screen 1: Browse** when a listing is unsuitable;
- a parallel **Seller** lane on the right for create → moderation → publish → answer → confirm;
- seller hand-offs marked on the three seller steps that touch the buyer journey.

## Mermaid source

```mermaid
%%{init: {"look":"classic","theme":"base","themeVariables":{"primaryColor":"#f3f3f3","primaryTextColor":"#222222","primaryBorderColor":"#444444","lineColor":"#555555","secondaryColor":"#e6e6e6","tertiaryColor":"#ffffff","fontFamily":"Arial, Helvetica, sans-serif"},"flowchart":{"curve":"linear","nodeSpacing":36,"rankSpacing":32,"padding":8,"wrappingWidth":230}}}%%
flowchart TD

  %% Seller lane is declared first so Mermaid lays it out as the right-hand lane.
  %% The three buyer hand-offs are written into the seller steps so the chart stays
  %% compact enough to print; the matching buyer points are noted in the page labels.
  subgraph Seller["Seller lane"]
    direction TB
    SL1["Create listing"]
    SL2["Moderation check"]
    SL3["Published<br/>↔ visible in Screen 1"]
    SL4["Answer buyer questions<br/>↔ Screen 3: Contact"]
    SL5["Confirm collection<br/>↔ Screen 4: Collection"]

    SL1 --> SL2
    SL2 --> SL3
    SL3 --> SL4
    SL4 --> SL5
  end

  subgraph Buyer["Buyer journey"]
    direction TB
    Start([Buyer needs a small quantity of material])

    B1["Screen 1: Browse<br/>material, quantity, area, collection"]
    D1{"Is a suitable<br/>listing shown?"}

    S2["Screen 2: Listing<br/>photos, condition, quantity, price"]
    D2{"Are condition and<br/>quantity acceptable?"}

    S3["Screen 3: Contact<br/>ask questions, propose inspection time"]
    D3{"Does the seller reply<br/>and agree to inspect?"}

    I1["Buyer inspects the material<br/>at the agreed time"]
    D4{"Does inspection<br/>confirm the listing?"}

    S4["Screen 4: Collection<br/>quantity, window, total cost"]
    D5{"Is the total cost<br/>still worthwhile?"}

    C1["Collect the material"]
    A5["Mark the exchange complete"]
    End(["Exchange complete<br/>optional: report a problem"])

    Start --> B1
    B1 --> D1
    D1 -- "No — change filters" --> B1
    D1 -- "Yes" --> S2

    S2 --> D2
    D2 -- "No" --> B1
    D2 -- "Yes" --> S3

    S3 --> D3
    D3 -- "No — report or return" --> B1
    D3 -- "Yes" --> I1

    I1 --> D4
    D4 -- "No — report to moderators" --> B1
    D4 -- "Yes" --> S4

    S4 --> D5
    D5 -- "No — cancel" --> B1
    D5 -- "Yes" --> C1

    C1 --> A5
    A5 --> End
  end

  classDef startEnd fill:#e4e4e4,stroke:#333333,stroke-width:2px,color:#111111;
  classDef screen fill:#ffffff,stroke:#444444,stroke-width:1.5px,color:#111111;
  classDef action fill:#f3f3f3,stroke:#555555,stroke-width:1.2px,color:#222222;
  classDef decision fill:#f7f7f7,stroke:#333333,stroke-width:1.6px,color:#111111;
  classDef seller fill:#fafafa,stroke:#777777,stroke-width:1.2px,color:#333333;

  class Start,End startEnd;
  class B1,S2,S3,S4 screen;
  class I1,C1,A5 action;
  class D1,D2,D3,D4,D5 decision;
  class SL1,SL2,SL3,SL4,SL5 seller;

  style Buyer fill:#ffffff,stroke:#bfbfbf,stroke-width:1px,color:#333333;
  style Seller fill:#fafafa,stroke:#9a9a9a,stroke-width:1px,color:#333333;
  linkStyle default stroke:#555555,stroke-width:1.4px;
```

## Export as an image

### Option A — Mermaid Live Editor

1. Open <https://mermaid.live>.
2. Paste the Mermaid source into the code panel.
3. Use **Actions → Download PNG** for a raster image, or **Download SVG** for a crisp, scalable image.
4. For A4 printing, open the SVG in a browser and print it as **A4 portrait** with **Fit to page** selected. The seller lane remains on the right.

### Option B — Mermaid CLI

The CLI needs Node.js. Run one of these from this folder:

```bash
# PNG, white background, large enough for print
npx @mermaid-js/mermaid-cli \
  -i jengaconnect-flowchart.mmd \
  -o jengaconnect-flowchart.png \
  -b white --size 1800

# SVG, best for editing and printing
npx @mermaid-js/mermaid-cli \
  -i jengaconnect-flowchart.mmd \
  -o jengaconnect-flowchart.svg \
  -b white
```

If Chromium refuses to start inside a container, add a Puppeteer config file:

```json
{ "args": ["--no-sandbox", "--disable-setuid-sandbox"] }
```

Then pass it with `-p puppeteer.json`.

### A4 print settings

- Paper: **A4 portrait**.
- Margins: **10 mm** or less.
- Scale: **Fit to page**.
- Background: **white**, so the greys stay clean.
- For a larger wall copy, print the same SVG on A3; the layout is vector-based.

## Editing the chart

- Change screen or action wording directly inside the square-bracket labels.
- Keep decisions in `{ ... }` and screens/actions in `[ ... ]`.
- To add a new loop, point a **No** arrow back to the relevant earlier node.
- To add another seller step, add it inside `Seller` and keep the chain `-->` intact.
