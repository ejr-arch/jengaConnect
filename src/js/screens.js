/* JengaConnect — screen markup */
(function () {
  "use strict";

  var U = window.JC.ui;
  var esc = U.esc;
  var icon = U.icon;

  function roleChip(state) {
    var label = state.role === "seller" ? "Seller mode" : "Buyer mode";
    return '<button class="role-chip" type="button" data-action="nav" data-view="account">' +
      '<span class="dot"></span>' + esc(label) + '</button>';
  }

  function appHead(title, micro, state) {
    return '<header class="app-head"><div><div class="wordmark">' + esc(title) + '</div>' +
      '<div class="micro">' + esc(micro) + '</div></div>' + roleChip(state) + '</header>';
  }

  function topbar(title, options) {
    options = options || {};
    var back = options.back === false ? '<span class="spacer"></span>' :
      '<button class="back" type="button" data-action="back">' + icon("back") + (options.backLabel || "Back") + '</button>';
    var action = options.action || '<span class="spacer"></span>';
    return '<header class="topbar">' + back + '<span class="ttl">' + esc(title) + '</span>' + action + '</header>';
  }

  function nav(active, state) {
    var tabs = [
      ["browse", "Browse", "browse"],
      ["post", "Post", "post"],
      ["requests", "Requests", "requests"],
      ["account", "Account", "account"]
    ];
    var count = activeRequestCount(state);
    return '<nav class="nav" aria-label="Main">' + tabs.map(function (tab) {
      var on = tab[0] === active;
      var badge = tab[0] === "requests" && count ? '<span class="count">' + count + '</span>' : "";
      return '<button type="button" class="' + (on ? "on" : "") + '" data-action="nav" data-view="' + tab[0] + '"' +
        (on ? ' aria-current="page"' : "") + '>' + icon(tab[2]) + badge +
        '<span>' + tab[1] + '</span></button>';
    }).join("") + '</nav>';
  }

  function activeRequestCount(state) {
    if (!state.role) return 0;
    if (state.role === "seller") {
      return state.requests.filter(function (r) { return r.status === "new" || r.status === "rescheduled"; }).length;
    }
    return state.requests.filter(function (r) {
      return r.buyerId === state.profile.id && r.status !== "collected" && r.status !== "cancelled";
    }).length;
  }

  function getListing(state, id) {
    return state.listings.filter(function (l) { return l.id === id; })[0];
  }

  function getRequest(state, id) {
    return state.requests.filter(function (r) { return r.id === id; })[0];
  }

  function welcome(ctx) {
    var state = ctx.state;
    return '<div class="welcome">' +
      '<div class="brand-mark">JC</div>' +
      '<h1>JengaConnect</h1>' +
      '<p class="lede">Find usable surplus building materials nearby. Inspect first, agree a price, then collect.</p>' +
      '<div class="points">' +
        point("Browse local surplus without paying a middleman") +
        point("Ask questions and book an inspection slot") +
        point("Track the exchange from contacted to collected") +
      '</div>' +
      '<div class="field"><label for="startName">Your name <span class="dim">(optional)</span></label>' +
      '<input class="input" id="startName" maxlength="40" autocomplete="name" placeholder="e.g. Elvis K." value="' + esc(state.profile.name) + '"></div>' +
      '<div class="stack" style="margin-top:14px">' +
        '<button class="btn" type="button" data-action="start" data-role="buyer">Continue as buyer</button>' +
        '<button class="btn ghost" type="button" data-action="start" data-role="seller">Continue as seller</button>' +
      '</div>' +
      '<div class="fineprint">Local demo · no account or payment needed.<br>Your data stays in this browser.</div>' +
      '</div>';
  }

  function point(text) {
    return '<div class="point"><span class="ic">' + icon("check") + '</span><span>' + esc(text) + '</span></div>';
  }

  function browse(ctx) {
    var state = ctx.state;
    var filters = state.filters;
    var items = filteredListings(state);
    var active = filters.query || filters.area !== "all" || filters.condition !== "all" || Number(filters.minQty) > 0;
    var head = appHead("JengaConnect", "Kampala & Wakiso · surplus materials", state);

    var cards = items.map(listingCard).join("");
    if (!items.length) {
      cards = '<div class="empty">' +
        '<div class="empty-icon">' + icon("empty") + '</div>' +
        '<h3>No matching listings nearby</h3>' +
        '<p>Nothing matches this search right now. Try a wider area, a smaller quantity or check back later.</p>' +
        '<div class="stack"><button class="btn" type="button" data-action="clear-filters">Clear filters</button>' +
        '<button class="btn ghost" type="button" data-action="nav" data-view="post">Post surplus instead</button></div>' +
        '</div>';
    }

    return head +
      '<form class="searchbar" data-form="search">' +
        '<input class="input" type="search" name="query" placeholder="Material (e.g. bricks, cement)" value="' + esc(filters.query) + '" aria-label="Search material">' +
        '<button class="btn" type="submit">Search</button>' +
      '</form>' +
      '<div class="filter-strip">' +
        filterSelect("Quantity", "minQty", filters.minQty, [["0", "Any"], ["10", "10+"], ["50", "50+"], ["100", "100+"], ["250", "250+"]]) +
        filterSelect("Area", "area", filters.area, [["all", "All"], ["Kampala", "Kampala"], ["Wakiso", "Wakiso"]]) +
        filterSelect("Condition", "condition", filters.condition, [["all", "Any"], ["New", "New"], ["Used", "Used"], ["Damaged", "Damaged"]]) +
      '</div>' +
      '<div class="meta-row"><span><b>' + items.length + '</b> listing' + (items.length === 1 ? "" : "s") + ' nearby' +
        (active ? ' · <button class="link-btn" type="button" data-action="clear-filters">clear</button>' : "") + '</span>' +
        '<span>Sort <select class="sort-select" data-action="filter" data-key="sort" aria-label="Sort listings">' +
          option("newest", "Newest", filters.sort) +
          option("price-asc", "Price: low", filters.sort) +
          option("price-desc", "Price: high", filters.sort) +
        '</select></span></div>' +
      '<div class="scroll"><div class="results">' + cards + '</div>' +
      '<div class="note" style="margin:12px 18px 18px">Only the general area is shown in results. The exact site address is shared after the seller accepts your request.</div>' +
      '</div>';
  }

  function filterSelect(label, key, value, options) {
    var on = String(value) !== (key === "minQty" ? "0" : "all");
    return '<label class="filter-chip' + (on ? " on" : "") + '">' + label +
      '<select data-action="filter" data-key="' + key + '" aria-label="' + esc(label) + '">' +
      options.map(function (pair) { return option(pair[0], pair[1], String(value)); }).join("") +
      '</select></label>';
  }

  function option(value, label, selected) {
    return '<option value="' + esc(value) + '"' + (String(selected) === String(value) ? " selected" : "") + '>' + esc(label) + '</option>';
  }

  function filteredListings(state) {
    var f = state.filters;
    var query = String(f.query || "").trim().toLowerCase();
    var min = Number(f.minQty) || 0;
    var items = state.listings.filter(function (l) {
      if (l.status === "archived") return false;
      if (query && (l.material + " " + l.description + " " + l.area + " " + l.neighbourhood).toLowerCase().indexOf(query) < 0) return false;
      if (f.area !== "all" && l.area !== f.area) return false;
      if (f.condition !== "all" && l.condition !== f.condition) return false;
      if (Number(l.quantity) < min) return false;
      return true;
    });
    if (f.sort === "price-asc") items.sort(function (a, b) { return a.price - b.price; });
    else if (f.sort === "price-desc") items.sort(function (a, b) { return b.price - a.price; });
    else items.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    return items;
  }

  function listingCard(item) {
    return '<button class="listing-card" type="button" data-action="open-listing" data-id="' + esc(item.id) + '">' +
      '<span class="thumb">' + U.photo(item) + '<span class="thumb-label">' + esc(item.condition) + '</span></span>' +
      '<span class="lc-body">' +
        '<span class="lc-top"><span class="lc-title">' + esc(item.material) + '</span><span class="price">' + U.money(item.price) + '</span></span>' +
        '<span class="lc-meta">' + esc(item.quantity) + ' ' + esc(item.unit) + ' · ' + esc(item.condition) + '</span>' +
        '<span class="lc-loc">' + esc(item.area) + ' · ' + esc(item.neighbourhood) + ' (general)</span>' +
        '<span class="lc-foot"><span class="safe">' + (item.verified ? "✓ Permission verified" : "Permission stated") + '</span><span>' + U.timeAgo(item.createdAt) + '</span></span>' +
      '</span></button>';
  }

  function listing(ctx) {
    var state = ctx.state;
    var item = getListing(state, ctx.route.params.id);
    if (!item) return notFound(ctx);

    var images = item.images || [];
    var index = Math.min(ctx.ui.galleryIndex || 0, Math.max(0, images.length - 1));
    var arrows = images.length > 1 ?
      '<button class="nav-arrow prev" type="button" data-action="gallery-prev" aria-label="Previous photo">‹</button>' +
      '<button class="nav-arrow next" type="button" data-action="gallery-next" aria-label="Next photo">›</button>' +
      '<span class="counter">' + (index + 1) + " / " + images.length + '</span>' : "";
    var dots = images.length > 1 ? '<div class="dots">' + images.map(function (_, i) {
      return '<i class="' + (i === index ? "on" : "") + '"></i>';
    }).join("") + '</div>' : "";

    return topbar("Listing", {
      action: '<button class="action" type="button" data-action="report" data-id="' + esc(item.id) + '">Report</button>'
    }) +
      '<div class="scroll">' +
        '<div class="gallery">' + U.photo(item, { index: index }) + arrows + '</div>' + dots +
        '<div class="listing-title-row"><div><h1>' + esc(item.material) + '</h1>' +
          '<div class="micro" style="margin-top:5px">' + esc(item.area) + ' · ' + esc(item.neighbourhood) + ' · listed ' + U.timeAgo(item.createdAt) + '</div></div>' +
          '<span class="price">' + U.money(item.price) + '</span></div>' +
        '<div class="details">' +
          detailRow("Material", item.material) +
          detailRow("Quantity", item.quantity + " " + item.unit) +
          '<div class="drow"><span>Condition</span><span class="cond">' + conditionMarkup(item.condition) + '</span></div>' +
          detailRow("General area", item.area + " · " + item.neighbourhood) +
          detailRow("Age", item.age || "Not stated") +
          detailRow("Asking price", U.money(item.price)) +
          detailRow("Seller permission", item.permission ? "Confirmed ✓" : "Not confirmed") +
        '</div>' +
        (item.description ? '<p class="desc">' + esc(item.description) + '</p>' : "") +
        '<div class="seller-strip"><div class="seller-avatar">' + esc(U.initials(item.sellerName)) + '</div>' +
          '<div><div class="who">' + esc(item.sellerName) + '</div>' +
          '<div class="meta">' + (item.verified ? "Permission verified by moderators" : "Permission stated by seller") + '</div></div></div>' +
        '<div class="note" style="margin:14px 18px 18px"><strong>Exact site address is not shown.</strong><br>Ask a quick question, inspect in person, then agree collection.</div>' +
      '</div>' +
      '<div class="actionbar">' +
        '<button class="btn" type="button" data-action="ask" data-id="' + esc(item.id) + '">Ask the seller</button>' +
        '<button class="btn ghost" type="button" data-action="report" data-id="' + esc(item.id) + '">Report listing</button>' +
      '</div>';
  }

  function conditionMarkup(value) {
    return ["New", "Used", "Damaged"].map(function (c) {
      return c === value ? "<b>" + c + "</b>" : "<span>" + c + "</span>";
    }).join("/");
  }

  function detailRow(label, value) {
    return '<div class="drow"><span>' + esc(label) + '</span><span>' + esc(value) + '</span></div>';
  }

  function contact(ctx) {
    var state = ctx.state;
    var item = getListing(state, ctx.route.params.id);
    if (!item) return notFound(ctx);
    var tomorrow = U.isoDaysFromNow(1);
    var times = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

    return '<form class="screen" data-form="send-request" data-id="' + esc(item.id) + '">' +
      topbar("Ask the seller") +
      '<div class="seller-strip" style="margin-top:12px"><div class="seller-avatar">' + esc(U.initials(item.sellerName)) + '</div>' +
        '<div><div class="who">' + esc(item.material) + '</div><div class="meta">' + esc(item.quantity) + ' ' + esc(item.unit) + ' · ' + esc(item.area) + ' (general)</div></div></div>' +
      '<div class="scroll"><div class="pad stack">' +
        '<div><div class="section-label">Quick questions</div><div class="qchips">' +
          ["Still available?", "Can I inspect first?", "Part quantity?", "Collection cost?"].map(function (q) {
            return '<button class="qchip" type="button" data-action="quick-question" data-text="' + esc(q) + '">' + esc(q) + '</button>';
          }).join("") +
        '</div></div>' +
        '<div class="field"><label for="contactMessage">Message</label>' +
          '<textarea class="textarea" id="contactMessage" name="message" maxlength="300" placeholder="Type your question…"></textarea>' +
          '<div class="counter"><span id="contactCount">0</span> / 300</div></div>' +
        '<div><div class="section-label">Proposed inspection</div><div class="row-2">' +
          '<div class="field"><label for="inspectDate">Date</label><input class="input" id="inspectDate" name="date" type="date" min="' + U.todayInput() + '" value="' + tomorrow + '" required></div>' +
          '<div class="field"><label for="inspectTime">Time</label><select class="select" id="inspectTime" name="time" required>' +
            times.map(function (t) { return '<option value="' + t + '">' + U.formatTime(t) + '</option>'; }).join("") +
          '</select></div>' +
        '</div></div>' +
        '<div class="steps-inline"><div><b>Next 1</b>Seller replies</div><div><b>Next 2</b>You inspect</div><div><b>Next 3</b>Agree &amp; collect</div></div>' +
        '<div class="note">Keep messages in the app. Do not send a deposit before you inspect the material.</div>' +
        '<div class="hint">An inspection is confirmed only when the seller accepts. The exact address is shared after acceptance.</div>' +
      '</div></div>' +
      '<div class="actionbar"><button class="btn" type="submit">Send request</button></div>' +
      '</form>';
  }

  function requests(ctx) {
    var state = ctx.state;
    var head = appHead(state.role === "seller" ? "Inbox" : "Requests", state.role === "seller" ? "buyer activity on this device" : "your inspection requests", state);

    if (state.role === "seller") {
      var tab = ctx.ui.requestsTab || "incoming";
      return head +
        '<div class="tabs">' +
          '<button type="button" class="' + (tab === "incoming" ? "on" : "") + '" data-action="requests-tab" data-tab="incoming">Incoming</button>' +
          '<button type="button" class="' + (tab === "listings" ? "on" : "") + '" data-action="requests-tab" data-tab="listings">My listings</button>' +
        '</div>' +
        '<div class="scroll">' + (tab === "listings" ? myListingsBody(state) : incomingBody(state)) + '</div>';
    }

    var mine = state.requests.filter(function (r) { return r.buyerId === state.profile.id; })
      .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var body;
    if (!mine.length) {
      body = '<div class="empty"><div class="empty-icon">' + icon("requests") + '</div>' +
        '<h3>No requests yet</h3><p>Find material you can inspect nearby, then ask the seller a question.</p>' +
        '<button class="btn" type="button" data-action="nav" data-view="browse">Browse listings</button></div>';
    } else {
      body = '<div class="pad stack">' + mine.map(function (r) { return requestCard(state, r); }).join("") + '</div>' +
        '<div class="note" style="margin:0 18px 18px">Requests are stored on this device. Switch to seller mode in Account to answer them.</div>';
    }
    return head + '<div class="scroll">' + body + '</div>';
  }

  function incomingBody(state) {
    var list = state.requests.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    if (!list.length) {
      return '<div class="empty"><div class="empty-icon">' + icon("requests") + '</div>' +
        '<h3>No buyer requests yet</h3><p>Requests sent from this device appear here. Try browsing as a buyer and asking about a listing.</p>' +
        '<button class="btn" type="button" data-action="nav" data-view="browse">Browse listings</button></div>';
    }
    return '<div class="pad stack">' + list.map(function (r) { return requestCard(state, r, true); }).join("") + '</div>' +
      '<div class="note" style="margin:0 18px 18px"><strong>Single-device demo.</strong> Requests created on this device are shown here so you can try the seller side. Accepting confirms the proposed inspection time.</div>';
  }

  function requestCard(state, request, sellerView) {
    var item = getListing(state, request.listingId);
    var status = U.statusInfo(request);
    var who = sellerView ? (request.buyerName || "Buyer") : (item ? item.sellerName : "Seller");
    var title = item ? item.material : "Listing unavailable";
    var meta = item ? item.quantity + " " + item.unit + " · " + item.area : "";
    return '<article class="req-card">' +
      '<div class="req-top"><div><div class="who">' + esc(who) + '</div>' +
        '<div class="req-meta">' + (sellerView ? "Buyer request" : "Request sent") + ' · ' + U.timeAgo(request.createdAt) + '</div></div>' +
        '<span class="tag ' + status.cls + '">' + esc(status.label) + '</span></div>' +
      '<div class="req-listing"><span class="thumb">' + U.photo(item || { material: "Material" }) + '</span>' +
        '<div><div class="card-title">' + esc(title) + '</div><div class="meta">' + esc(meta) + '</div></div></div>' +
      (request.message ? '<div class="bubble">“' + esc(request.message) + '”</div>' : "") +
      '<div class="proposed"><span>Proposed inspection</span><b>' + esc(U.formatDate(request.date)) + ' · ' + esc(U.formatTime(request.time)) + '</b></div>' +
      '<div class="req-actions"><button class="btn small" type="button" data-action="open-request" data-id="' + esc(request.id) + '">Open request</button></div>' +
      '</article>';
  }

  function requestDetail(ctx) {
    var state = ctx.state;
    var request = getRequest(state, ctx.route.params.id);
    if (!request) return notFound(ctx);
    var item = getListing(state, request.listingId);
    var status = U.statusInfo(request);
    var isSeller = state.role === "seller";
    var price = item ? Number(item.price) : 0;
    var transport = Number(request.transport) || 0;
    var stage = Number(request.stage) || 0;

    var banner = "";
    if (request.status === "collected") {
      banner = '<div class="status-banner good">' + icon("check") + ' Exchange complete. The seller confirmed collection.</div>';
    } else if (request.status === "cancelled") {
      banner = '<div class="status-banner bad">' + icon("alert") + ' This request was cancelled.</div>';
    } else if (request.status === "rescheduled") {
      banner = '<div class="status-banner wait">' + icon("clock") + ' The seller suggested a new inspection time.</div>';
    } else if (request.status === "accepted") {
      banner = '<div class="status-banner good">' + icon("check") + ' Inspection accepted for ' + esc(U.formatDate(request.date)) + ' at ' + esc(U.formatTime(request.time)) + '.</div>';
    } else {
      banner = '<div class="status-banner wait">' + icon("clock") + ' Request sent. Waiting for the seller to accept.</div>';
    }

    return topbar("Collection", {
      action: '<button class="action" type="button" data-action="report" data-request-id="' + esc(request.id) + '"' + (item ? ' data-id="' + esc(item.id) + '"' : "") + '>Report</button>'
    }) +
      '<div class="scroll"><div class="pad stack">' +
        banner +
        '<div class="summary-card"><span class="thumb">' + U.photo(item || { material: "Material" }) + '</span>' +
          '<div><div class="card-title">' + esc(item ? item.material : "Listing unavailable") + '</div>' +
          '<div class="meta">Agreed quantity: ' + esc(request.quantity) + ' ' + esc(request.unit) + '</div></div></div>' +
        '<div><div class="section-label">Exchange status <span class="tag ' + status.cls + '">' + esc(status.label) + '</span></div>' + U.tracker(request) +
          '<div class="hint" style="margin-top:8px">Mark complete only after you have collected and checked the material.</div></div>' +
        (request.message ? '<div><div class="section-label">Buyer message</div><div class="bubble">“' + esc(request.message) + '”</div></div>' : "") +
        '<div><div class="section-label">Collection window</div><div class="window-grid">' +
          '<div class="window-box"><div class="sub-label">Day</div><div class="v">' + esc(U.formatDate(request.date)) + '</div></div>' +
          '<div class="window-box"><div class="sub-label">Time</div><div class="v">' + esc(U.formatTime(request.time)) + '</div></div>' +
        '</div></div>' +
        '<div><div class="section-label">Cost</div><div class="cost">' +
          '<div class="cost-row"><span>Asking price</span><span>' + U.money(price) + '</span></div>' +
          '<div class="cost-row"><span>Transport estimate</span><span><input type="number" min="0" step="5000" data-action="set-transport" data-id="' + esc(request.id) + '" value="' + transport + '" aria-label="Transport estimate in UGX"></span></div>' +
          '<div class="cost-row total"><span>Total</span><span>' + U.money(price + transport) + '</span></div>' +
        '</div><div class="hint" style="margin-top:6px">Transport is an estimate. Confirm it with your transporter before collection.</div></div>' +
        '<div class="checklist"><div class="section-label">Before you collect</div>' +
          checkLine("Confirm the exact address with the seller") +
          checkLine("Check the agreed quantity on arrival") +
          checkLine("Inspect the material before paying") +
          checkLine("Arrange transport for " + request.quantity + " " + request.unit) +
        '</div>' +
        (isSeller ? '<div class="note"><strong>Seller note.</strong> Accepting shares your collection window with the buyer. Confirm collection only after the buyer has collected the material.</div>' : "") +
        '<button class="link-btn danger" type="button" data-action="report" data-request-id="' + esc(request.id) + '"' + (item ? ' data-id="' + esc(item.id) + '"' : "") + '>Problem? Report to moderators</button>' +
      '</div></div>' +
      '<div class="actionbar">' + requestActions(state, request, item, stage, isSeller) + '</div>';
  }

  function checkLine(text) {
    return '<div class="check-line"><span class="box"></span><span>' + esc(text) + '</span></div>';
  }

  function requestActions(state, request, item, stage, isSeller) {
    var id = esc(request.id);
    var disabled = function (label) { return '<button class="btn" type="button" disabled>' + esc(label) + '</button>'; };

    if (request.status === "collected" || request.status === "cancelled") {
      return '<button class="btn ghost" type="button" data-action="nav" data-view="browse">Browse more material</button>';
    }

    if (isSeller) {
      if (request.status === "new" || request.status === "rescheduled") {
        return '<button class="btn" type="button" data-action="accept-request" data-id="' + id + '">Accept inspection</button>' +
          '<button class="btn ghost" type="button" data-action="reschedule-request" data-id="' + id + '">Suggest another time</button>';
      }
      if (stage >= 2) {
        return '<button class="btn" type="button" data-action="advance-request" data-id="' + id + '" data-stage="3">Confirm collection</button>';
      }
      return disabled(stage === 0 ? "Waiting for buyer inspection" : "Waiting for buyer to agree collection");
    }

    if (request.status === "new") {
      return disabled("Waiting for the seller to accept") +
        '<button class="btn ghost" type="button" data-action="cancel-request" data-id="' + id + '">Cancel request</button>';
    }
    if (request.status === "rescheduled") {
      return '<button class="btn" type="button" data-action="accept-time" data-id="' + id + '">Accept new time</button>' +
        '<button class="btn ghost" type="button" data-action="cancel-request" data-id="' + id + '">Cancel request</button>';
    }
    if (stage === 0) {
      return '<button class="btn" type="button" data-action="advance-request" data-id="' + id + '" data-stage="1">Mark inspected</button>' +
        '<button class="btn ghost" type="button" data-action="cancel-request" data-id="' + id + '">Cancel request</button>';
    }
    if (stage === 1) {
      return '<button class="btn" type="button" data-action="advance-request" data-id="' + id + '" data-stage="2">Agree to collect</button>' +
        '<button class="btn ghost" type="button" data-action="cancel-request" data-id="' + id + '">Cancel request</button>';
    }
    return '<button class="btn" type="button" data-action="advance-request" data-id="' + id + '" data-stage="3">Mark collected</button>';
  }

  function post(ctx) {
    var state = ctx.state;
    var draft = ctx.ui.draft;
    var editing = !!draft.id;
    var photos = draft.photos || [];

    var photoSlots = photos.map(function (src, index) {
      return '<div class="photo-slot"><img src="' + src + '" alt="Selected photo ' + (index + 1) + '">' +
        '<button class="remove" type="button" data-action="remove-photo" data-index="' + index + '" aria-label="Remove photo">×</button></div>';
    }).join("");
    var addSlot = photos.length < 5 ?
      '<button class="photo-add" type="button" data-action="pick-photos">' + icon("camera") + '<span>Add photo<br>' + photos.length + ' / 5</span></button>' : "";

    return '<form class="screen" data-form="save-listing">' +
      topbar(editing ? "Edit listing" : "Post material", {
        back: false,
        action: '<button class="action" type="button" data-action="nav" data-view="' + (editing ? "requests" : "browse") + '">Cancel</button>'
      }) +
      '<div class="scroll"><div class="pad stack">' +
        '<div><div class="micro">Sell usable surplus · Kampala &amp; Wakiso</div>' +
          '<p class="hint" style="margin:6px 0 0">Listings are reviewed before they appear to buyers. Only the general area is shown publicly.</p></div>' +
        '<div class="field"><label for="postMaterial">Material</label>' +
          '<input class="input" id="postMaterial" name="material" required maxlength="60" placeholder="e.g. Red clay bricks" value="' + esc(draft.material) + '"></div>' +
        '<div class="field"><label>Photos <span class="dim">· ' + photos.length + ' / 5</span></label>' +
          '<div class="photo-grid">' + photoSlots + addSlot + '</div>' +
          '<input id="photoInput" type="file" accept="image/*" multiple class="sr-only"></div>' +
        '<div class="field"><label>Condition</label><div class="seg">' +
          ["New", "Used", "Damaged"].map(function (c) {
            return '<input type="radio" id="cond-' + c + '" name="condition" value="' + c + '"' + (draft.condition === c ? " checked" : "") + ' required>' +
              '<label for="cond-' + c + '">' + c + '</label>';
          }).join("") +
        '</div></div>' +
        '<div class="row-2">' +
          '<div class="field"><label for="postQuantity">Quantity</label>' +
            '<input class="input" id="postQuantity" name="quantity" type="number" min="1" step="1" required placeholder="0" value="' + esc(draft.quantity) + '"></div>' +
          '<div class="field"><label for="postUnit">Unit</label><select class="select" id="postUnit" name="unit">' +
            ["pieces", "bags", "tonnes", "boxes", "lengths", "trips", "sheets", "buckets"].map(function (u) {
              return option(u, u, draft.unit);
            }).join("") + '</select></div>' +
        '</div>' +
        '<div class="field"><label for="postPrice">Asking price (UGX)</label>' +
          '<input class="input" id="postPrice" name="price" type="number" min="0" step="1000" required placeholder="e.g. 220000" value="' + esc(draft.price) + '"></div>' +
        '<div class="row-2">' +
          '<div class="field"><label for="postArea">General area</label><select class="select" id="postArea" name="area">' +
            ["Kampala", "Wakiso"].map(function (a) { return option(a, a, draft.area); }).join("") + '</select></div>' +
          '<div class="field"><label for="postHood">Neighbourhood</label>' +
            '<input class="input" id="postHood" name="neighbourhood" maxlength="40" placeholder="e.g. Ntinda" value="' + esc(draft.neighbourhood) + '"></div>' +
        '</div>' +
        '<div class="field"><label for="postAge">Age / storage note <span class="dim">(optional)</span></label>' +
          '<input class="input" id="postAge" name="age" maxlength="60" placeholder="e.g. 4 months in storage" value="' + esc(draft.age) + '"></div>' +
        '<div class="field"><label for="postDescription">Description</label>' +
          '<textarea class="textarea" id="postDescription" name="description" maxlength="500" placeholder="Condition, what is included, why you are selling…">' + esc(draft.description) + '</textarea>' +
          '<div class="addr-note">Do not include your exact address or phone number. Share those after you accept a request.</div></div>' +
        '<label class="checkrow"><input type="checkbox" name="permission"' + (draft.permission ? " checked" : "") + ' required>' +
          '<span><b>I have permission to sell this material</b>I am the owner, or I have the owner’s permission. Proof can be requested by moderators.</span></label>' +
        '<div class="note">Submitting sends this listing for a moderation check. You can approve the demo listing from My listings.</div>' +
      '</div></div>' +
      '<div class="actionbar"><button class="btn" type="submit">' + (editing ? "Save changes for review" : "Submit for review") + '</button>' +
        '<div class="hint" style="text-align:center">Reviewed before it is published.</div></div>' +
      '</form>';
  }

  function myListings(ctx) {
    var state = ctx.state;
    return appHead("My listings", "manage what buyers can see", state) +
      '<div class="scroll">' + myListingsBody(state) +
      '<div class="note" style="margin:0 18px 18px">Status changes as requests are accepted and collection is confirmed.</div></div>';
  }

  function myListingsBody(state) {
    var mine = state.listings.filter(function (l) { return l.sellerId === state.profile.id; })
      .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    if (!mine.length) {
      return '<div class="empty"><div class="empty-icon">' + icon("post") + '</div>' +
        '<h3>No listings yet</h3><p>Post your first item. It goes to a moderator check before buyers can see it.</p>' +
        '<button class="btn" type="button" data-action="nav" data-view="post">Post material</button></div>';
    }

    var counts = { published: 0, pending: 0, reserved: 0, collected: 0 };
    mine.forEach(function (l) { if (counts[l.status] != null) counts[l.status]++; });
    var rows = mine.map(function (item) {
      var tag = listingStatusTag(item.status);
      var actions = "";
      if (item.status === "pending") {
        actions = '<button class="btn tiny" type="button" data-action="approve-listing" data-id="' + esc(item.id) + '">Approve</button>';
      }
      actions += '<button class="btn tiny ghost" type="button" data-action="edit-listing" data-id="' + esc(item.id) + '">' + icon("edit") + '</button>' +
        '<button class="btn tiny ghost" type="button" data-action="delete-listing" data-id="' + esc(item.id) + '">' + icon("trash") + '</button>';
      return '<div class="listing-row"><span class="thumb">' + U.photo(item) + '</span>' +
        '<div class="lr-main"><div class="card-title">' + esc(item.material) + '</div>' +
          '<div class="card-line">' + esc(item.quantity) + ' ' + esc(item.unit) + ' · ' + U.money(item.price) + '</div>' +
          '<div class="card-line dim">' + item.views + ' views · ' + U.timeAgo(item.createdAt) + '</div></div>' +
        '<div class="lr-side">' + tag + '<div class="lr-actions">' + actions + '</div></div></div>';
    }).join("");

    return '<div class="stats-strip"><span><b>' + mine.length + '</b> listings</span><span><b>' + counts.published + '</b> live</span>' +
      '<span><b>' + counts.pending + '</b> pending</span></div>' +
      '<div class="pad stack">' + rows + '</div>';
  }

  function listingStatusTag(status) {
    if (status === "published") return '<span class="tag green">Published</span>';
    if (status === "pending") return '<span class="tag dash warn">Pending review</span>';
    if (status === "reserved") return '<span class="tag warn">Reserved</span>';
    if (status === "collected") return '<span class="tag dark">Collected</span>';
    return '<span class="tag">' + esc(status) + '</span>';
  }

  function account(ctx) {
    var state = ctx.state;
    var name = state.profile.name || (state.role === "seller" ? "Your shop" : "Guest buyer");
    var mine = state.listings.filter(function (l) { return l.sellerId === state.profile.id; }).length;
    var mineRequests = state.requests.filter(function (r) { return r.buyerId === state.profile.id; }).length;

    return appHead("Account", "profile & preferences", state) +
      '<div class="scroll"><div class="pad stack">' +
        '<div class="profile-card"><div class="avatar">' + esc(U.initials(name)) + '</div>' +
          '<div><div class="name">' + esc(name) + '</div><div class="meta">' +
          (state.role === "seller" ? "Seller · " + mine + " listings" : "Buyer · " + mineRequests + " requests") + '</div></div></div>' +
        '<div><div class="section-label">Mode</div><div class="mode-switch">' +
          '<button type="button" class="' + (state.role === "buyer" ? "on" : "") + '" data-action="set-role" data-role="buyer">Buyer</button>' +
          '<button type="button" class="' + (state.role === "seller" ? "on" : "") + '" data-action="set-role" data-role="seller">Seller</button>' +
        '</div><div class="hint" style="margin-top:6px">Buyer mode browses and requests. Seller mode manages listings and incoming requests.</div></div>' +
        '<form class="stack" data-form="save-profile">' +
          '<div class="field"><label for="profileName">Your name</label>' +
            '<input class="input" id="profileName" name="name" maxlength="40" value="' + esc(state.profile.name) + '" placeholder="e.g. Elvis K."></div>' +
          '<button class="btn ghost small" type="submit">Save profile</button>' +
        '</form>' +
        '<div><div class="section-label">Activity</div><div class="stats-grid">' +
          '<div class="stat"><b>' + mine + '</b><span>Listings</span></div>' +
          '<div class="stat"><b>' + mineRequests + '</b><span>Requests</span></div>' +
          '<div class="stat"><b>' + state.reports.length + '</b><span>Reports</span></div>' +
        '</div></div>' +
        '<div><div class="section-label">About</div><div class="menu-list">' +
          '<button class="menu-row" type="button" data-action="how-it-works"><span>How JengaConnect works</span><span class="chev">' + icon("chevron") + '</span></button>' +
          '<button class="menu-row" type="button" data-action="safety"><span>Safety &amp; privacy</span><span class="chev">' + icon("chevron") + '</span></button>' +
          '<a class="menu-row" href="prototypes/index.html" target="_blank" rel="noopener"><span>Open design prototype</span><span class="chev">' + icon("chevron") + '</span></a>' +
          '<button class="menu-row danger" type="button" data-action="reset-data"><span>Reset demo data</span><span class="chev">' + icon("chevron") + '</span></button>' +
        '</div></div>' +
        '<div class="fineprint" style="text-align:center;font-size:9.5px;color:var(--muted-2);line-height:1.5">JengaConnect · local demo<br>No payments, delivery or real messaging.</div>' +
      '</div></div>';
  }

  function notFound(ctx) {
    return topbar("Not found") +
      '<div class="scroll"><div class="empty"><div class="empty-icon">' + icon("alert") + '</div>' +
      '<h3>That page moved</h3><p>The listing or request you opened is no longer available.</p>' +
      '<button class="btn" type="button" data-action="nav" data-view="browse">Back to Browse</button></div></div>';
  }

  window.JC = window.JC || {};
  window.JC.screens = {
    welcome: welcome,
    browse: browse,
    listing: listing,
    contact: contact,
    requests: requests,
    request: requestDetail,
    post: post,
    myListings: myListings,
    account: account,
    notFound: notFound,
    nav: nav,
    activeRequestCount: activeRequestCount
  };
})();
