/* JengaConnect — application controller */
(function () {
  "use strict";

  var store = window.JC.store;
  var screens = window.JC.screens;
  var U = window.JC.ui;
  var esc = U.esc;

  var state = store.load();
  var route = state.role
    ? { name: state.role === "seller" ? "requests" : "browse", params: {} }
    : { name: "welcome", params: {} };
  var stack = [];
  var view = {
    requestsTab: "incoming",
    galleryIndex: 0,
    draft: emptyDraft()
  };

  var screenEl;
  var navEl;

  function emptyDraft() {
    return {
      id: null,
      material: "",
      quantity: "",
      unit: "pieces",
      condition: "New",
      area: "Kampala",
      neighbourhood: "",
      price: "",
      age: "",
      description: "",
      photos: [],
      permission: false
    };
  }

  function draftFrom(item) {
    return {
      id: item.id,
      material: item.material || "",
      quantity: item.quantity || "",
      unit: item.unit || "pieces",
      condition: item.condition || "New",
      area: item.area || "Kampala",
      neighbourhood: item.neighbourhood || "",
      price: item.price || "",
      age: item.age || "",
      description: item.description || "",
      photos: (item.images || []).slice(),
      permission: true
    };
  }

  function findListing(id) {
    return state.listings.filter(function (l) { return l.id === id; })[0];
  }

  function findRequest(id) {
    return state.requests.filter(function (r) { return r.id === id; })[0];
  }

  function profileName() {
    return state.profile.name || (state.role === "seller" ? "Your shop" : "Guest buyer");
  }

  function persist() {
    if (!store.save(state)) {
      U.toast("Could not save locally. Browser storage may be full.", "bad");
    }
  }

  function navViewFor(name) {
    if (name === "post") return "post";
    if (name === "requests" || name === "request" || name === "myListings") return "requests";
    if (name === "account") return "account";
    return "browse";
  }

  function render(keepScroll) {
    if (!screenEl) return;
    var previous = screenEl.querySelector(".scroll");
    var scrollTop = keepScroll && previous ? previous.scrollTop : 0;

    var name = screens[route.name] ? route.name : "notFound";
    screenEl.innerHTML = screens[name]({ state: state, route: route, ui: view });

    if (navEl) {
      navEl.innerHTML = state.role ? screens.nav(navViewFor(name), state) : "";
    }

    var next = screenEl.querySelector(".scroll");
    if (next) next.scrollTop = scrollTop;
  }

  function navigate(name, params, options) {
    options = options || {};
    capturePostDraft();
    if (route.name === "post") view.draft = view.draft;
    if (!options.replace) stack.push({ name: route.name, params: route.params });
    route = { name: name, params: params || {} };
    if (name === "listing") view.galleryIndex = 0;
    if (name === "post") initPostDraft(route.params.id);
    U.closeSheet();
    render();
  }

  function tab(name) {
    capturePostDraft();
    stack = [];
    route = { name: name, params: {} };
    if (name === "post") initPostDraft(null);
    if (name === "requests" && state.role === "seller" && !view.requestsTab) view.requestsTab = "incoming";
    U.closeSheet();
    render();
  }

  function back() {
    if (U.sheetOpen()) {
      U.closeSheet();
      return;
    }
    capturePostDraft();
    var previous = stack.pop();
    if (previous) {
      route = previous;
      U.closeSheet();
      render();
      return;
    }
    tab(state.role ? "browse" : "welcome");
  }

  function initPostDraft(id) {
    if (id) {
      var item = findListing(id);
      view.draft = item ? draftFrom(item) : emptyDraft();
    } else {
      view.draft = emptyDraft();
    }
  }

  function capturePostDraft() {
    var form = document.querySelector('form[data-form="save-listing"]');
    if (!form) return;
    var draft = view.draft;
    ["material", "quantity", "unit", "area", "neighbourhood", "price", "age", "description"].forEach(function (key) {
      var field = form.querySelector('[name="' + key + '"]');
      if (field) draft[key] = field.value;
    });
    var condition = form.querySelector('[name="condition"]:checked');
    if (condition) draft.condition = condition.value;
    var permission = form.querySelector('[name="permission"]');
    if (permission) draft.permission = permission.checked;
  }

  function start(role) {
    var input = document.getElementById("startName");
    if (input) state.profile.name = input.value.trim().slice(0, 40);
    state.role = role;
    persist();
    stack = [];
    U.closeSheet();
    if (role === "seller") {
      view.requestsTab = "listings";
      route = { name: "requests", params: {} };
      U.toast("Seller mode — post your first listing.", "good");
    } else {
      route = { name: "browse", params: {} };
      U.toast("Buyer mode — inspect before you pay.", "good");
    }
    render();
  }

  function setRole(role) {
    if (role !== "buyer" && role !== "seller") return;
    state.role = role;
    persist();
    if (role === "seller") view.requestsTab = "incoming";
    render(true);
    U.toast(role === "seller" ? "Seller mode" : "Buyer mode", "good");
  }

  function setFilter(key, value) {
    state.filters[key] = key === "minQty" ? Number(value) || 0 : value;
    persist();
    render();
  }

  function estimateTransport(price) {
    var p = Number(price) || 0;
    return Math.max(10000, Math.round((p * 0.12) / 5000) * 5000);
  }

  function openReport(listingId, requestId) {
    var item = listingId ? findListing(listingId) : null;
    var body = '<form data-form="report" data-listing-id="' + esc(listingId || "") + '" data-request-id="' + esc(requestId || "") + '">' +
      '<div class="stack">' +
        (item ? '<div class="summary-card"><span class="thumb">' + U.photo(item) + '</span><div><div class="card-title">' + esc(item.material) + '</div><div class="meta">' + esc(item.quantity) + ' ' + esc(item.unit) + ' · ' + esc(item.area) + '</div></div></div>' : "") +
        '<div class="field"><label for="reportReason">Reason</label><select class="select" id="reportReason" name="reason" required>' +
          '<option value="">Select a reason</option>' +
          '<option>Wrong material or quantity</option>' +
          '<option>Already sold / not available</option>' +
          '<option>Unsafe or misleading listing</option>' +
          '<option>Price or permission problem</option>' +
          '<option>Other</option>' +
        '</select></div>' +
        '<div class="field"><label for="reportDetails">Details <span class="dim">(optional)</span></label>' +
          '<textarea class="textarea" id="reportDetails" name="details" maxlength="500" placeholder="Tell moderators what happened…"></textarea></div>' +
        '<div class="note">Reports are private. The seller is not told who reported the listing. Moderators may ask for more detail.</div>' +
        '<button class="btn danger" type="submit">Submit report</button>' +
        '<button class="btn ghost" type="button" data-action="close-sheet">Cancel</button>' +
      '</div></form>';
    U.openSheet({ title: "Report listing", body: body });
  }

  function openReschedule(id) {
    var request = findRequest(id);
    if (!request) return;
    var options = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(function (time) {
      return '<option value="' + time + '"' + (request.time === time ? " selected" : "") + '>' + U.formatTime(time) + '</option>';
    }).join("");
    var body = '<form data-form="reschedule" data-id="' + esc(request.id) + '">' +
      '<div class="stack">' +
        '<p class="hint" style="margin:0">Propose a different inspection window. The buyer must accept it before the inspection is confirmed.</p>' +
        '<div class="row-2">' +
          '<div class="field"><label for="rescheduleDate">Date</label><input class="input" id="rescheduleDate" name="date" type="date" min="' + U.todayInput() + '" value="' + esc(request.date) + '" required></div>' +
          '<div class="field"><label for="rescheduleTime">Time</label><select class="select" id="rescheduleTime" name="time" required>' + options + '</select></div>' +
        '</div>' +
        '<button class="btn" type="submit">Send new time</button>' +
        '<button class="btn ghost" type="button" data-action="close-sheet">Cancel</button>' +
      '</div></form>';
    U.openSheet({ title: "Suggest another time", body: body });
  }

  function openCancel(id) {
    U.openSheet({
      title: "Cancel request?",
      body: '<div class="stack"><p class="hint" style="margin:0">The seller will no longer see this inspection request. You can send a new one later.</p>' +
        '<button class="btn danger" type="button" data-action="confirm-cancel" data-id="' + esc(id) + '">Yes, cancel request</button>' +
        '<button class="btn ghost" type="button" data-action="close-sheet">Keep request</button></div>'
    });
  }

  function openDelete(id) {
    var item = findListing(id);
    U.openSheet({
      title: "Delete listing?",
      body: '<div class="stack"><p class="hint" style="margin:0">' + esc(item ? item.material : "This listing") + ' will be removed from this demo. This cannot be undone.</p>' +
        '<button class="btn danger" type="button" data-action="confirm-delete" data-id="' + esc(id) + '">Delete listing</button>' +
        '<button class="btn ghost" type="button" data-action="close-sheet">Keep listing</button></div>'
    });
  }

  function openHowItWorks() {
    U.openSheet({
      title: "How JengaConnect works",
      body: '<div class="stack">' +
        stepNote("1", "Browse nearby surplus", "Search by material, quantity, area and condition. Only the general area is public.") +
        stepNote("2", "Ask and inspect", "Send a quick question and propose an inspection time. The seller accepts or suggests another time.") +
        stepNote("3", "Agree and collect", "Confirm quantity, collection window, price and transport before you pay.") +
        stepNote("4", "Close the loop", "Mark the exchange complete only after you have collected and checked the material.") +
        '<div class="note">Sellers confirm permission before publishing. Listings are checked by moderators.</div>' +
      '</div>'
    });
  }

  function stepNote(number, title, text) {
    return '<div class="point" style="display:flex;gap:10px;align-items:flex-start"><span class="seller-avatar" style="width:24px;height:24px;font-size:11px">' + number + '</span>' +
      '<div><b style="font-size:12px">' + esc(title) + '</b><div class="hint">' + esc(text) + '</div></div></div>';
  }

  function openSafety() {
    U.openSheet({
      title: "Safety & privacy",
      body: '<div class="stack">' +
        '<div class="note"><strong>Inspect before paying.</strong> Never send a deposit before you have seen the material and agreed the quantity.</div>' +
        '<div class="note"><strong>Meet safely.</strong> Arrange inspection in daylight and tell someone where you are going.</div>' +
        '<div class="note"><strong>Address stays private.</strong> The exact site address is shared only after the seller accepts your request.</div>' +
        '<div class="note"><strong>Local demo.</strong> Names, listings and requests live in this browser only. There is no server, payment or real messaging.</div>' +
      '</div>'
    });
  }

  function openReset() {
    U.openSheet({
      title: "Reset demo data?",
      body: '<div class="stack"><p class="hint" style="margin:0">This deletes your profile, listings, requests and reports from this browser and restores the sample listings.</p>' +
        '<button class="btn danger" type="button" data-action="confirm-reset">Reset everything</button>' +
        '<button class="btn ghost" type="button" data-action="close-sheet">Keep my data</button></div>'
    });
  }

  function advanceRequest(id, stage) {
    var request = findRequest(id);
    if (!request) return;
    var now = new Date().toISOString();
    request.stage = Math.max(0, Math.min(3, Number(stage) || 0));
    request.updatedAt = now;
    if (request.stage === 1) request.inspectedAt = now;
    if (request.stage === 2) request.agreedAt = now;
    if (request.stage === 3) {
      request.collectedAt = now;
      request.status = "collected";
    }
    persist();
    render();
    if (request.stage === 3) {
      U.toast(state.role === "seller" ? "Collection confirmed." : "Exchange complete. Thanks for closing the loop.", "good");
    } else if (request.stage === 2) {
      U.toast("Collection agreed. Arrange transport.", "good");
    } else {
      U.toast("Inspection recorded.", "good");
    }
  }

  function handlePhotos(files) {
    if (!files || !files.length) return;
    capturePostDraft();
    var remaining = 5 - view.draft.photos.length;
    if (remaining <= 0) {
      U.toast("You can add up to 5 photos.", "bad");
      return;
    }
    var chosen = Array.prototype.slice.call(files, 0, remaining);
    if (files.length > remaining) U.toast("Only the first " + remaining + " photo" + (remaining === 1 ? "" : "s") + " were added.", "bad");
    U.toast("Adding photo" + (chosen.length === 1 ? "" : "s") + "…");
    Promise.all(chosen.map(function (file) { return U.readImage(file); })).then(function (results) {
      view.draft.photos = view.draft.photos.concat(results);
      render(true);
      U.toast("Photo added to the listing.", "good");
    }).catch(function (error) {
      U.toast(error && error.message ? error.message : "Could not add that photo.", "bad");
    });
  }

  function sendRequest(form) {
    var item = findListing(form.dataset.id);
    if (!item) {
      U.toast("That listing is no longer available.", "bad");
      return;
    }
    var data = new FormData(form);
    var message = String(data.get("message") || "").trim();
    var date = String(data.get("date") || "");
    var time = String(data.get("time") || "");
    if (!message) {
      U.toast("Add a quick question for the seller.", "bad");
      var field = document.getElementById("contactMessage");
      if (field) field.focus();
      return;
    }
    if (!date || !time) {
      U.toast("Choose an inspection date and time.", "bad");
      return;
    }
    if (new Date(date + "T" + time + ":00").getTime() < Date.now()) {
      U.toast("Choose an inspection time in the future.", "bad");
      return;
    }
    var request = {
      id: store.uid("r"),
      listingId: item.id,
      listingTitle: item.material,
      buyerId: state.profile.id,
      buyerName: profileName(),
      message: message,
      date: date,
      time: time,
      quantity: item.quantity,
      unit: item.unit,
      transport: estimateTransport(item.price),
      status: "new",
      stage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.requests.unshift(request);
    persist();
    navigate("request", { id: request.id });
    U.toast("Request sent to " + item.sellerName + ".", "good");
  }

  function saveListing(form) {
    capturePostDraft();
    var draft = view.draft;
    if (!String(draft.material || "").trim()) {
      U.toast("Add the material name.", "bad");
      return;
    }
    if (!Number(draft.quantity) || Number(draft.quantity) < 1) {
      U.toast("Add a quantity greater than zero.", "bad");
      return;
    }
    if (!Number(draft.price) || Number(draft.price) < 0) {
      U.toast("Add an asking price in UGX.", "bad");
      return;
    }
    if (!String(draft.neighbourhood || "").trim()) {
      U.toast("Add a general neighbourhood, not an exact address.", "bad");
      return;
    }
    if (!draft.permission) {
      U.toast("Confirm that you have permission to sell this material.", "bad");
      return;
    }

    var now = new Date().toISOString();
    if (draft.id) {
      var existing = findListing(draft.id);
      if (!existing) {
        U.toast("That listing is no longer available.", "bad");
        return;
      }
      existing.material = draft.material.trim();
      existing.quantity = Number(draft.quantity);
      existing.unit = draft.unit;
      existing.condition = draft.condition;
      existing.area = draft.area;
      existing.neighbourhood = draft.neighbourhood.trim();
      existing.price = Number(draft.price);
      existing.age = draft.age.trim();
      existing.description = draft.description.trim();
      existing.images = draft.photos.slice();
      existing.status = "pending";
      existing.updatedAt = now;
      persist();
      view.draft = emptyDraft();
      stack = [];
      view.requestsTab = "listings";
      route = { name: "requests", params: {} };
      render();
      U.toast("Changes sent for review.", "good");
      return;
    }

    var listing = {
      id: store.uid("l"),
      material: draft.material.trim(),
      quantity: Number(draft.quantity),
      unit: draft.unit,
      condition: draft.condition,
      area: draft.area,
      neighbourhood: draft.neighbourhood.trim(),
      price: Number(draft.price),
      age: draft.age.trim(),
      description: draft.description.trim(),
      sellerId: state.profile.id,
      sellerName: profileName(),
      permission: true,
      verified: false,
      status: "pending",
      images: draft.photos.slice(),
      views: 0,
      createdAt: now,
      updatedAt: now
    };
    state.listings.unshift(listing);
    persist();
    view.draft = emptyDraft();
    stack = [];
    view.requestsTab = "listings";
    route = { name: "requests", params: {} };
    render();
    U.toast("Sent for review. Approve it from My listings.", "good");
  }

  function submitReport(form) {
    var data = new FormData(form);
    var reason = String(data.get("reason") || "").trim();
    var details = String(data.get("details") || "").trim();
    if (!reason) {
      U.toast("Choose a reason for the report.", "bad");
      return;
    }
    state.reports.push({
      id: store.uid("rep"),
      listingId: form.dataset.listingId || null,
      requestId: form.dataset.requestId || null,
      reporterId: state.profile.id,
      reason: reason,
      details: details,
      createdAt: new Date().toISOString()
    });
    persist();
    U.closeSheet();
    U.toast("Report sent to moderators.", "good");
  }

  function submitReschedule(form) {
    var request = findRequest(form.dataset.id);
    if (!request) {
      U.toast("That request is no longer available.", "bad");
      return;
    }
    var data = new FormData(form);
    var date = String(data.get("date") || "");
    var time = String(data.get("time") || "");
    if (!date || !time) {
      U.toast("Choose a date and time.", "bad");
      return;
    }
    request.date = date;
    request.time = time;
    request.status = "rescheduled";
    request.updatedAt = new Date().toISOString();
    persist();
    U.closeSheet();
    render();
    U.toast("New inspection time sent to the buyer.", "good");
  }

  function onClick(event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var action = target.getAttribute("data-action");

    switch (action) {
      case "start":
        start(target.getAttribute("data-role"));
        break;
      case "nav":
        tab(target.getAttribute("data-view"));
        break;
      case "back":
        back();
        break;
      case "open-listing":
        navigate("listing", { id: target.getAttribute("data-id") });
        break;
      case "ask":
        navigate("contact", { id: target.getAttribute("data-id") });
        break;
      case "open-request":
        navigate("request", { id: target.getAttribute("data-id") });
        break;
      case "quick-question": {
        var message = document.getElementById("contactMessage");
        var text = target.getAttribute("data-text") || "";
        if (message) {
          message.value = message.value ? message.value.replace(/\s*$/, "") + " " + text : text;
          var count = document.getElementById("contactCount");
          if (count) count.textContent = String(message.value.length);
          message.focus();
        }
        break;
      }
      case "gallery-prev":
      case "gallery-next": {
        var current = findListing(route.params.id);
        var total = current && current.images ? current.images.length : 0;
        if (total > 1) {
          view.galleryIndex = (view.galleryIndex + (action === "gallery-next" ? 1 : total - 1)) % total;
          render(true);
        }
        break;
      }
      case "report":
        openReport(target.getAttribute("data-id"), target.getAttribute("data-request-id"));
        break;
      case "clear-filters":
        state.filters = { query: "", area: "all", condition: "all", minQty: 0, sort: "newest" };
        persist();
        render();
        break;
      case "requests-tab":
        view.requestsTab = target.getAttribute("data-tab");
        render(true);
        break;
      case "accept-request": {
        var accept = findRequest(target.getAttribute("data-id"));
        if (accept) {
          accept.status = "accepted";
          accept.acceptedAt = new Date().toISOString();
          accept.updatedAt = accept.acceptedAt;
          persist();
          render();
          U.toast("Inspection accepted. The buyer can now mark it inspected.", "good");
        }
        break;
      }
      case "accept-time": {
        var timeRequest = findRequest(target.getAttribute("data-id"));
        if (timeRequest) {
          timeRequest.status = "accepted";
          timeRequest.acceptedAt = new Date().toISOString();
          timeRequest.updatedAt = timeRequest.acceptedAt;
          persist();
          render();
          U.toast("New inspection time accepted.", "good");
        }
        break;
      }
      case "reschedule-request":
        openReschedule(target.getAttribute("data-id"));
        break;
      case "advance-request":
        advanceRequest(target.getAttribute("data-id"), target.getAttribute("data-stage"));
        break;
      case "cancel-request":
        openCancel(target.getAttribute("data-id"));
        break;
      case "confirm-cancel": {
        var cancelled = findRequest(target.getAttribute("data-id"));
        if (cancelled) {
          cancelled.status = "cancelled";
          cancelled.cancelledAt = new Date().toISOString();
          cancelled.updatedAt = cancelled.cancelledAt;
          persist();
          U.closeSheet();
          render();
          U.toast("Request cancelled.", "good");
        }
        break;
      }
      case "pick-photos": {
        var input = document.getElementById("photoInput");
        if (input) input.click();
        break;
      }
      case "remove-photo": {
        capturePostDraft();
        var index = Number(target.getAttribute("data-index"));
        view.draft.photos.splice(index, 1);
        render(true);
        break;
      }
      case "approve-listing": {
        var pending = findListing(target.getAttribute("data-id"));
        if (pending) {
          pending.status = "published";
          pending.verified = true;
          pending.updatedAt = new Date().toISOString();
          persist();
          render();
          U.toast("Listing published. Buyers can now find it.", "good");
        }
        break;
      }
      case "edit-listing": {
        var edit = findListing(target.getAttribute("data-id"));
        if (edit) {
          view.draft = draftFrom(edit);
          stack.push({ name: route.name, params: route.params });
          route = { name: "post", params: { id: edit.id } };
          U.closeSheet();
          render();
        }
        break;
      }
      case "delete-listing":
        openDelete(target.getAttribute("data-id"));
        break;
      case "confirm-delete": {
        var deleteId = target.getAttribute("data-id");
        state.listings = state.listings.filter(function (l) { return l.id !== deleteId; });
        persist();
        U.closeSheet();
        render();
        U.toast("Listing deleted.", "good");
        break;
      }
      case "set-role":
        setRole(target.getAttribute("data-role"));
        break;
      case "how-it-works":
        openHowItWorks();
        break;
      case "safety":
        openSafety();
        break;
      case "reset-data":
        openReset();
        break;
      case "confirm-reset":
        state = store.reset();
        stack = [];
        view = { requestsTab: "incoming", galleryIndex: 0, draft: emptyDraft() };
        route = { name: "welcome", params: {} };
        U.closeSheet();
        render();
        U.toast("Demo data reset.", "good");
        break;
      case "close-sheet":
        U.closeSheet();
        break;
      default:
        break;
    }
  }

  function onSubmit(event) {
    var form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    var type = form.getAttribute("data-form");

    if (type === "search") {
      var data = new FormData(form);
      state.filters.query = String(data.get("query") || "").trim();
      persist();
      render();
    } else if (type === "send-request") {
      sendRequest(form);
    } else if (type === "save-listing") {
      saveListing(form);
    } else if (type === "save-profile") {
      var profile = new FormData(form);
      state.profile.name = String(profile.get("name") || "").trim().slice(0, 40);
      persist();
      render(true);
      U.toast("Profile saved.", "good");
    } else if (type === "report") {
      submitReport(form);
    } else if (type === "reschedule") {
      submitReschedule(form);
    }
  }

  function onChange(event) {
    var target = event.target;
    if (target.matches('[data-action="filter"]')) {
      setFilter(target.getAttribute("data-key"), target.value);
      return;
    }
    if (target.id === "photoInput") {
      var files = target.files;
      handlePhotos(files);
      target.value = "";
      return;
    }
    if (target.matches('[data-action="set-transport"]')) {
      var request = findRequest(target.getAttribute("data-id"));
      if (request) {
        request.transport = Math.max(0, Number(target.value) || 0);
        persist();
        render(true);
      }
      return;
    }
    if (target.closest('form[data-form="save-listing"]')) {
      capturePostDraft();
    }
  }

  function onInput(event) {
    var target = event.target;
    if (target.id === "contactMessage") {
      var count = document.getElementById("contactCount");
      if (count) count.textContent = String(target.value.length);
      return;
    }
    if (target.closest('form[data-form="save-listing"]')) {
      capturePostDraft();
    }
  }

  function boot() {
    screenEl = document.getElementById("screen");
    navEl = document.getElementById("navRoot");
    if (!screenEl) return;
    if (state.role === "seller") view.requestsTab = "incoming";
    render();

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("change", onChange);
    document.addEventListener("input", onInput);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") U.closeSheet();
    });
  }

  window.JC.app = {
    get state() { return state; },
    navigate: navigate,
    render: render,
    reset: function () { state = store.reset(); render(); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
