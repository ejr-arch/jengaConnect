/* JengaConnect — shared UI helpers */
(function () {
  "use strict";

  var ICONS = {
    browse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4.5 4.5"></path></svg>',
    post: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"></rect><path d="M12 8v8M8 12h8"></path></svg>',
    requests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h16v11H8l-4 3.5z"></path><path d="M8 9.5h8M8 13h5"></path></svg>',
    account: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.8-4 3.3-6 7-6s6.2 2 7 6"></path></svg>',
    back: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"></path></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"></path><path d="M9 12l2 2 4-4"></path></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"></path><circle cx="12" cy="13" r="3.2"></circle></svg>',
    alert: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l9 16H3z"></path><path d="M12 10v4M12 17.2v.1"></path></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg>',
    close: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>',
    trash: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l.8 13h9.4l.8-13"></path></svg>',
    edit: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16z"></path><path d="M13.5 6.5l4 4"></path></svg>',
    eye: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"></path><circle cx="12" cy="12" r="2.6"></circle></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>',
    empty: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5L7 4h10l3 4.5V20H4z"></path><path d="M4 8.5h16M9 12h6"></path></svg>'
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function icon(name) {
    return ICONS[name] || "";
  }

  function money(amount) {
    var n = Math.round(Number(amount) || 0);
    return "UGX " + n.toLocaleString("en-UG");
  }

  function initials(name) {
    var parts = String(name || "JC").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "JC";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function toneFor(text) {
    var hash = 0;
    var str = String(text || "");
    for (var i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    return hash % 5;
  }

  function photoPlaceholder(label) {
    var tone = toneFor(label);
    return '<div class="photo-ph tone-' + tone + '" role="img" aria-label="Photo placeholder: ' + esc(label) + '">' +
      '<span class="ph-mark">' + esc(initials(label)) + '</span>' +
      '<span class="ph-label">' + esc(label) + '</span>' +
      '</div>';
  }

  function photo(item, options) {
    options = options || {};
    var images = (item && item.images) || [];
    var index = options.index || 0;
    if (images.length) {
      var src = images[index % images.length];
      return '<img src="' + src + '" alt="' + esc((item && item.material) || "Listing photo") + '" loading="lazy">';
    }
    return photoPlaceholder((item && item.material) || options.label || "Material");
  }

  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    if (!then || isNaN(then)) return "recently";
    var diff = Math.max(0, Date.now() - then);
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + "h ago";
    var days = Math.floor(hours / 24);
    if (days < 7) return days + "d ago";
    var weeks = Math.floor(days / 7);
    if (weeks < 5) return weeks + "w ago";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }

  function formatTime(value) {
    if (!value) return "";
    var parts = String(value).split(":");
    var h = Number(parts[0]);
    var m = parts[1] || "00";
    if (isNaN(h)) return value;
    var suffix = h >= 12 ? "PM" : "AM";
    var hour = h % 12 || 12;
    return hour + ":" + m + " " + suffix;
  }

  function isoDaysFromNow(days) {
    var d = new Date(Date.now() + days * 86400000);
    return d.toISOString().slice(0, 10);
  }

  function statusInfo(request) {
    if (!request) return { label: "Unknown", cls: "dash" };
    if (request.status === "collected") return { label: "Collected", cls: "green" };
    if (request.status === "cancelled") return { label: "Cancelled", cls: "bad" };
    if (request.status === "rescheduled") return { label: "New time", cls: "warn" };
    if (request.status === "accepted") return { label: "Accepted", cls: "green" };
    return { label: "New", cls: "dash" };
  }

  function tracker(request) {
    var steps = ["Contacted", "Inspected", "Agreed", "Collected"];
    var dates = [request.createdAt, request.inspectedAt, request.agreedAt, request.collectedAt];
    var stage = Math.max(0, Math.min(3, Number(request.stage) || 0));
    return '<div class="tracker">' + steps.map(function (label, index) {
      var cls = index < stage ? "done" : (index === stage ? "current" : "");
      var date = dates[index] ? formatDate(dates[index]) : "—";
      return '<div class="tstep ' + cls + '">' +
        '<span class="dot"></span>' +
        '<span class="tl">' + label + '</span>' +
        '<span class="td">' + esc(date) + '</span>' +
        '</div>';
    }).join("") + '</div>';
  }

  function toast(message, tone) {
    var wrap = document.getElementById("toastWrap");
    if (!wrap) return;
    var node = document.createElement("div");
    node.className = "toast" + (tone ? " " + tone : "");
    node.textContent = message;
    wrap.appendChild(node);
    window.setTimeout(function () {
      node.style.transition = "opacity .18s ease";
      node.style.opacity = "0";
      window.setTimeout(function () { node.remove(); }, 220);
    }, 3200);
  }

  function openSheet(options) {
    var root = document.getElementById("sheetRoot");
    if (!root) return;
    root.innerHTML = '<div class="sheet-overlay" data-action="close-sheet">' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(options.title || "Sheet") + '">' +
      '<div class="sheet-handle"></div>' +
      '<div class="sheet-head"><h2>' + esc(options.title || "") + '</h2>' +
      '<button class="close" type="button" data-action="close-sheet" aria-label="Close">' + icon("close") + '</button></div>' +
      (options.body || "") +
      (options.footer ? '<div class="stack" style="margin-top:16px">' + options.footer + '</div>' : "") +
      '</div></div>';
    var sheet = root.querySelector(".sheet");
    if (sheet) sheet.addEventListener("click", function (event) { event.stopPropagation(); });
    if (typeof options.onOpen === "function") options.onOpen(root);
  }

  function closeSheet() {
    var root = document.getElementById("sheetRoot");
    if (root) root.innerHTML = "";
  }

  function sheetOpen() {
    var root = document.getElementById("sheetRoot");
    return !!root && !!root.firstElementChild;
  }

  function readImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file.type || file.type.indexOf("image/") !== 0) {
        reject(new Error("Please choose an image file."));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Could not read that image.")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("Could not read that image.")); };
        img.onload = function () {
          var max = 900;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function todayInput() {
    return new Date().toISOString().slice(0, 10);
  }

  function plural(count, singular, pluralWord) {
    return count + " " + (count === 1 ? singular : (pluralWord || singular + "s"));
  }

  window.JC = window.JC || {};
  window.JC.ui = {
    esc: esc,
    icon: icon,
    money: money,
    initials: initials,
    photo: photo,
    photoPlaceholder: photoPlaceholder,
    timeAgo: timeAgo,
    formatDate: formatDate,
    formatTime: formatTime,
    isoDaysFromNow: isoDaysFromNow,
    statusInfo: statusInfo,
    tracker: tracker,
    toast: toast,
    openSheet: openSheet,
    closeSheet: closeSheet,
    sheetOpen: sheetOpen,
    readImage: readImage,
    todayInput: todayInput,
    plural: plural
  };
})();
