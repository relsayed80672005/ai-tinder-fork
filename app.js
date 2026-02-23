// app.js
// Plain global JS, no modules.

// -------------------
// Data generator
// -------------------
const TAGS = [
  "Coffee","Hiking","Movies","Live Music","Board Games","Cats","Dogs","Traveler",
  "Foodie","Tech","Art","Runner","Climbing","Books","Yoga","Photography"
];
const FIRST_NAMES = [
  "Alex","Sam","Jordan","Taylor","Casey","Avery","Riley","Morgan","Quinn","Cameron",
  "Jamie","Drew","Parker","Reese","Emerson","Rowan","Shawn","Harper","Skyler","Devon"
];
const CITIES = [
  "Brooklyn","Manhattan","Queens","Jersey City","Hoboken","Astoria",
  "Williamsburg","Bushwick","Harlem","Lower East Side"
];
const JOBS = [
  "Product Designer","Software Engineer","Data Analyst","Barista","Teacher",
  "Photographer","Architect","Chef","Nurse","Marketing Manager","UX Researcher"
];
const BIOS = [
  "Weekend hikes and weekday lattes.",
  "Dog parent. Amateur chef. Karaoke enthusiast.",
  "Trying every taco in the city — for science.",
  "Bookstore browser and movie quote machine.",
  "Gym sometimes, Netflix always.",
  "Looking for the best slice in town.",
  "Will beat you at Mario Kart.",
  "Currently planning the next trip."
];

const UNSPLASH_SEEDS = [
  "1515462277126-2b47b9fa09e6",
  "1520975916090-3105956dac38",
  "1519340241574-2cec6aef0c01",
  "1554151228-14d9def656e4",
  "1548142813-c348350df52b",
  "1517841905240-472988babdf9",
  "1535713875002-d1d0cf377fde",
  "1545996124-0501ebae84d0",
  "1524504388940-b1c1722653e1",
  "1531123897727-8f129e1688ce",
];

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickTags() { return Array.from(new Set(Array.from({ length: 4 }, () => sample(TAGS)))); }
function imgFor(seed) {
  return `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;
}

// ✅ FIX 1: sample-without-replacement so these are actually distinct photos
function makePhotoSet() {
  const pool = [...UNSPLASH_SEEDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const seeds = pool.slice(0, 4);
  return seeds.map((s, i) => `${imgFor(s)}&sig=${i}`);
}

function generateProfiles(count = 12) {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    const photos = makePhotoSet();
    profiles.push({
      id: `p_${i}_${Date.now().toString(36)}`,
      name: sample(FIRST_NAMES),
      age: 18 + Math.floor(Math.random() * 22),
      city: sample(CITIES),
      title: sample(JOBS),
      bio: sample(BIOS),
      tags: pickTags(),
      photos,
      photoIndex: 0,
    });
  }
  return profiles;
}

// -------------------
// UI rendering
// -------------------
const deckEl = document.getElementById("deck");
const shuffleBtn = document.getElementById("shuffleBtn");
const likeBtn = document.getElementById("likeBtn");
const nopeBtn = document.getElementById("nopeBtn");
const superLikeBtn = document.getElementById("superLikeBtn");

let profiles = [];

function getTopCardEl() {
  return deckEl.lastElementChild;
}

function getTopProfile() {
  return profiles.length ? profiles[profiles.length - 1] : null;
}

function renderDeck() {
  deckEl.setAttribute("aria-busy", "true");
  deckEl.innerHTML = "";

  profiles.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.className = "card__media";
    img.src = p.photos[p.photoIndex];
    img.alt = `${p.name} — profile photo`;

    const body = document.createElement("div");
    body.className = "card__body";

    const titleRow = document.createElement("div");
    titleRow.className = "title-row";
    titleRow.innerHTML = `
      <h2 class="card__title">${p.name}</h2>
      <span class="card__age">${p.age}</span>
    `;

    const meta = document.createElement("div");
    meta.className = "card__meta";
    meta.textContent = `${p.title} • ${p.city}`;

    const chips = document.createElement("div");
    chips.className = "card__chips";
    p.tags.forEach((t) => {
      const c = document.createElement("span");
      c.className = "chip";
      c.textContent = t;
      chips.appendChild(c);
    });

    body.appendChild(titleRow);
    body.appendChild(meta);
    body.appendChild(chips);

    card.appendChild(img);
    card.appendChild(body);

    deckEl.appendChild(card);
  });

  deckEl.removeAttribute("aria-busy");
}

function resetDeck() {
  profiles = generateProfiles(12);
  renderDeck();
}

// -------------------
// Actions
// -------------------
function removeTopProfileAndRerender() {
  if (!profiles.length) return;
  profiles.pop();
  renderDeck();
}

function handleLike() {
  removeTopProfileAndRerender();
}

function handleReject() {
  removeTopProfileAndRerender();
}

function handleSuperLike() {
  removeTopProfileAndRerender();
}

function handleNextPhoto() {
  const p = getTopProfile();
  const card = getTopCardEl();
  if (!p || !card) return;

  p.photoIndex = (p.photoIndex + 1) % p.photos.length;

  const img = card.querySelector(".card__media");
  if (img) img.src = p.photos[p.photoIndex];
}

// -------------------
// Buttons
// -------------------
likeBtn.addEventListener("click", handleLike);
nopeBtn.addEventListener("click", handleReject);
superLikeBtn.addEventListener("click", handleSuperLike);
shuffleBtn.addEventListener("click", resetDeck);

// -------------------
// Gestures (touch + mouse) + Double-tap/click
// -------------------
const SWIPE_X = 80;
const SWIPE_Y = 80;
const TAP_MOVE = 25;
const DOUBLE_TAP_MS = 300;

let startX = 0;
let startY = 0;
let mouseDown = false;

// ✅ FIX 2: isolate touch and click paths (no shared double-tap state)
let touchLastTapTime = 0;
let clickLastTapTime = 0;

// ✅ FIX 2 & 3: suppress synthetic/stray clicks after touch or swipe
let recentTouch = false;
let suppressNextClick = false;

function processSwipe(dx, dy) {
  // horizontal swipe
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > SWIPE_X) { handleLike(); return true; }
    if (dx < -SWIPE_X) { handleReject(); return true; }
    return false;
  }

  // vertical swipe (up)
  if (dy < -SWIPE_Y) { handleSuperLike(); return true; }

  return false;
}

// Touch start
deckEl.addEventListener("touchstart", (e) => {
  recentTouch = true;
  window.setTimeout(() => { recentTouch = false; }, 400);

  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
}, { passive: true });

// Touch end
deckEl.addEventListener("touchend", (e) => {
  const t = e.changedTouches[0];
  const endX = t.clientX;
  const endY = t.clientY;

  const dx = endX - startX;
  const dy = endY - startY;

  const moved = Math.hypot(dx, dy);

  // Tap / double-tap (touch only)
  if (moved <= TAP_MOVE) {
    const now = Date.now();
    const tappedOnCard = !!e.target.closest(".card");
    if (!tappedOnCard) return;

    if ((now - touchLastTapTime) <= DOUBLE_TAP_MS) {
      handleNextPhoto();
      touchLastTapTime = 0;
    } else {
      touchLastTapTime = now;
    }
    return;
  }

  // Swipe
  const didSwipe = processSwipe(dx, dy);

  // ✅ prevent the synthetic click after touch from doing anything
  if (didSwipe) {
    suppressNextClick = true;
    window.setTimeout(() => { suppressNextClick = false; }, 0);
  }
}, { passive: true });

// Mouse drag (desktop)
deckEl.addEventListener("mousedown", (e) => {
  mouseDown = true;
  startX = e.clientX;
  startY = e.clientY;
});

window.addEventListener("mouseup", (e) => {
  if (!mouseDown) return;
  mouseDown = false;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  const didSwipe = processSwipe(dx, dy);

  // ✅ FIX 3: consume the click that happens after a drag swipe
  if (didSwipe) {
    suppressNextClick = true;
    window.setTimeout(() => { suppressNextClick = false; }, 0);
  }
});

// Double click / double tap (desktop clicks only)
// ✅ click-based double click (more consistent than dblclick)
// ✅ ignores touch-generated clicks and suppressed clicks
deckEl.addEventListener("click", (e) => {
  if (recentTouch) return;
  if (suppressNextClick) return;

  const clickedOnCard = !!e.target.closest(".card");
  if (!clickedOnCard) return;

  const now = Date.now();
  if ((now - clickLastTapTime) <= DOUBLE_TAP_MS) {
    handleNextPhoto();
    clickLastTapTime = 0;
  } else {
    clickLastTapTime = now;
  }
});

// -------------------
// Boot
// -------------------
resetDeck();