/* JengaConnect — seed data and local persistence */
(function () {
  "use strict";

  var KEY = "jengaconnect.v2";
  var DAY = 86400000;

  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function daysAgo(n) {
    return new Date(Date.now() - n * DAY).toISOString();
  }

  function hoursAgo(n) {
    return new Date(Date.now() - n * 3600000).toISOString();
  }

  var SEED_LISTINGS = [
    {
      id: "l-bricks",
      material: "Red clay bricks",
      quantity: 350,
      unit: "pieces",
      condition: "Used",
      area: "Kampala",
      neighbourhood: "Ntinda",
      price: 220000,
      age: "4 months in storage",
      description: "Clean bricks from a demolished boundary wall. About 30 have chipped corners; the rest are sound. Buyer arranges pick-up and transport.",
      sellerId: "seed-kato",
      sellerName: "Kato S.",
      permission: true,
      verified: true,
      status: "published",
      images: [],
      views: 41,
      createdAt: daysAgo(2)
    },
    {
      id: "l-cement",
      material: "Simba cement 32.5N",
      quantity: 12,
      unit: "bags",
      condition: "New",
      area: "Wakiso",
      neighbourhood: "Najjera",
      price: 384000,
      age: "2 weeks in storage",
      description: "Unopened bags left over from a slab. Stored indoors on pallets, no hardened bags. Selling as one lot only.",
      sellerId: "seed-nakato",
      sellerName: "Nakato M.",
      permission: true,
      verified: true,
      status: "published",
      images: [],
      views: 63,
      createdAt: daysAgo(1)
    },
    {
      id: "l-timber",
      material: "Timber offcuts (2x2 and 2x3)",
      quantity: 40,
      unit: "pieces",
      condition: "Used",
      area: "Kampala",
      neighbourhood: "Katwe",
      price: 160000,
      age: "6 months in storage",
      description: "Sorted offcuts between 1.2 m and 2.4 m. Good for noggins, formwork and small repairs. A few pieces have old nail holes.",
      sellerId: "seed-muhindo",
      sellerName: "Muhindo J.",
      permission: true,
      verified: false,
      status: "published",
      images: [],
      views: 18,
      createdAt: daysAgo(4)
    },
    {
      id: "l-roofing",
      material: "Uganda Baati roofing sheets",
      quantity: 18,
      unit: "sheets",
      condition: "Used",
      area: "Wakiso",
      neighbourhood: "Nansana",
      price: 450000,
      age: "1 year in storage",
      description: "30-gauge sheets removed from a store. Straight, with a few nail holes. Ideal for a shed or store. Collection only.",
      sellerId: "seed-auma",
      sellerName: "Auma G.",
      permission: true,
      verified: true,
      status: "published",
      images: [],
      views: 29,
      createdAt: daysAgo(3)
    },
    {
      id: "l-sand",
      material: "Lake sand",
      quantity: 3,
      unit: "trips",
      condition: "New",
      area: "Wakiso",
      neighbourhood: "Kira",
      price: 210000,
      age: "Delivered this week",
      description: "Three tipped trips of washed lake sand. Clean, no clay. The seller can share a trusted transporter contact after the inspection.",
      sellerId: "seed-kato",
      sellerName: "Kato S.",
      permission: true,
      verified: true,
      status: "published",
      images: [],
      views: 12,
      createdAt: hoursAgo(20)
    },
    {
      id: "l-rebar",
      material: "12mm steel rebar",
      quantity: 25,
      unit: "lengths",
      condition: "New",
      area: "Kampala",
      neighbourhood: "Kawempe",
      price: 275000,
      age: "3 weeks in storage",
      description: "12 m lengths, uncut and surface-rust free. Left over after a column casting. Bring a vehicle with a roof rack.",
      sellerId: "seed-muhindo",
      sellerName: "Muhindo J.",
      permission: true,
      verified: false,
      status: "published",
      images: [],
      views: 34,
      createdAt: daysAgo(5)
    },
    {
      id: "l-tiles",
      material: "Ceramic wall tiles (30x60)",
      quantity: 8,
      unit: "boxes",
      condition: "New",
      area: "Kampala",
      neighbourhood: "Nakawa",
      price: 96000,
      age: "2 months in storage",
      description: "Eight unopened boxes of white gloss wall tiles. Two boxes have torn packaging but the tiles are intact. About 10 m² in total.",
      sellerId: "seed-nakato",
      sellerName: "Nakato M.",
      permission: true,
      verified: true,
      status: "published",
      images: [],
      views: 22,
      createdAt: daysAgo(6)
    },
    {
      id: "l-ballast",
      material: "Aggregate ballast",
      quantity: 4,
      unit: "tonnes",
      condition: "New",
      area: "Wakiso",
      neighbourhood: "Kyengera",
      price: 320000,
      age: "1 week in storage",
      description: "Four tonnes of clean ballast, tipped on a hard standing. Buyer loads and transports. Inspection welcome before you commit.",
      sellerId: "seed-auma",
      sellerName: "Auma G.",
      permission: true,
      verified: false,
      status: "published",
      images: [],
      views: 9,
      createdAt: daysAgo(7)
    },
    {
      id: "l-plywood",
      material: "Marine plywood offcuts",
      quantity: 20,
      unit: "pieces",
      condition: "Used",
      area: "Kampala",
      neighbourhood: "Bwaise",
      price: 140000,
      age: "5 months in storage",
      description: "Assorted 12 mm marine ply offcuts, mostly 60 x 90 cm. Dry and flat. Useful for shelving and cabinet backs.",
      sellerId: "seed-kato",
      sellerName: "Kato S.",
      permission: true,
      verified: true,
      status: "published",
      images: [],
      views: 17,
      createdAt: daysAgo(8)
    },
    {
      id: "l-paint",
      material: "Weather Guard paint (white)",
      quantity: 5,
      unit: "buckets",
      condition: "New",
      area: "Wakiso",
      neighbourhood: "Entebbe Road",
      price: 125000,
      age: "2 months in storage",
      description: "Five 4-litre buckets of white exterior paint. Sealed and within date. One bucket has a dent but is not leaking.",
      sellerId: "seed-nakato",
      sellerName: "Nakato M.",
      permission: true,
      verified: false,
      status: "published",
      images: [],
      views: 26,
      createdAt: daysAgo(9)
    }
  ];

  function defaultState() {
    return {
      version: 2,
      role: null,
      profile: { id: uid("u"), name: "" },
      listings: SEED_LISTINGS.map(function (item) { return Object.assign({}, item, { images: [] }); }),
      requests: [],
      reports: [],
      filters: { query: "", area: "all", condition: "all", minQty: 0, sort: "newest" }
    };
  }

  function normalize(saved) {
    var base = defaultState();
    if (!saved || typeof saved !== "object") return base;
    var state = Object.assign(base, saved);
    state.version = 2;
    state.profile = Object.assign(base.profile, saved.profile || {});
    if (!state.profile.id) state.profile.id = uid("u");
    if (!Array.isArray(state.listings) || !state.listings.length) state.listings = base.listings;
    if (!Array.isArray(state.requests)) state.requests = [];
    if (!Array.isArray(state.reports)) state.reports = [];
    state.filters = Object.assign(base.filters, saved.filters || {});
    if (state.role !== "buyer" && state.role !== "seller") state.role = null;
    return state;
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      return normalize(raw ? JSON.parse(raw) : null);
    } catch (err) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      var copy = {
        version: state.version,
        role: state.role,
        profile: state.profile,
        listings: state.listings,
        requests: state.requests,
        reports: state.reports,
        filters: state.filters
      };
      window.localStorage.setItem(KEY, JSON.stringify(copy));
      return true;
    } catch (err) {
      return false;
    }
  }

  function reset() {
    try { window.localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
    return defaultState();
  }

  window.JC = window.JC || {};
  window.JC.store = {
    KEY: KEY,
    load: load,
    save: save,
    reset: reset,
    defaultState: defaultState,
    uid: uid,
    seed: SEED_LISTINGS
  };
})();
