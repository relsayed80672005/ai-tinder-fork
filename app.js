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
function pickTags() { return Array.from(new Set(Array.from({length:4}, () => sample(TAGS)))); }
function imgFor(seed) {
  return `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;
}

// create 4 photos per profile so "double tap" truly cycles photos
function makePhotoSet() {
  const seeds = [
    sample(UNSPLASH_SEEDS),
    sample(UNSPLASH_SEEDS),
    sample(UNSPLASH_SEEDS),
    sample(UNSPLASH_SEEDS),
  ];
  // make sure they're not all identical
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
      photos,          // array of photo urls
      photoIndex: 0,   // which photo is currently shown
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

// Return the TOP card element (the last one appended)
function getTopCardEl() {
  return deckEl.lastElementChild;
}

// Return the TOP profile (the last profile in the array)
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
// Actions (buttons + swipes call these)
// -------------------
function removeTopProfileAndRerender() {
  if (!profiles.length) return;
  profiles.pop();
  renderDeck();
}

function handleLike() {
  // Like = remove top card
  removeTopProfileAndRerender();
}

function handleReject() {
  // Reject = remove top card
  removeTopProfileAndRerender();
}

function handleSuperLike() {
  // Super like = remove top card
  removeTopProfileAndRerender();
}

function handleNextPhoto() {
  const p = getTopProfile();
  const card = getTopCardEl();
  if (!p || !card) return;

  p.photoIndex = (p.photoIndex + 1) % p.photos.length;

  // Update only the image (no full rerender)
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
// Gestures (mobile touch + desktop mouse drag)
// -------------------
const SWIPE_X = 80;
const SWIPE_Y = 80;

let startX = 0;
let startY = 0;
let mouseDown = false;

// For double tap / double click (custom logic that always works)
let lastTapTime = 0;
let lastTapTargetWasCard = false;

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

// Touch
deckEl.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
}, { passive: true });

deckEl.addEventListener("touchend", (e) => {
  const t = e.changedTouches[0];
  const endX = t.clientX;
  const endY = t.clientY;

  const dx = endX - startX;
  const dy = endY - startY;

  const moved = Math.hypot(dx, dy);

  // If it's basically a tap, treat it as tap/double-tap
  if (moved <= 25) {
    const now = Date.now();
    const tappedOnCard = !!e.target.closest(".card");

    if (tappedOnCard && lastTapTargetWasCard && (now - lastTapTime) <= 300) {
      handleNextPhoto();
      lastTapTime = 0;
      lastTapTargetWasCard = false;
    } else {
      lastTapTime = now;
      lastTapTargetWasCard = tappedOnCard;
    }
    return;
  }

  processSwipe(dx, dy);
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

  processSwipe(dx, dy);
});

// Double click (desktop) -> next photo
// We use a click-based timer instead of relying on dblclick (more reliable)
deckEl.addEventListener("click", (e) => {
  const clickedOnCard = !!e.target.closest(".card");
  if (!clickedOnCard) return;

  const now = Date.now();
  if (lastTapTargetWasCard && (now - lastTapTime) <= 300) {
    handleNextPhoto();
    lastTapTime = 0;
    lastTapTargetWasCard = false;
  } else {
    lastTapTime = now;
    lastTapTargetWasCard = true;
  }
});

// -------------------
// Boot
// -------------------
resetDeck();