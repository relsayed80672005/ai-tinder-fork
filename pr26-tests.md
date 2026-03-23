# PR #26 - Partition Testing Results

## What we tested
We used partition testing and divided the app into:
- Swipe gestures
- Photo cycling
- Action buttons
- Push notifications
- Backend/security

---

## Test Results

### Swipe Tests
- Swipe left → Pass
- Swipe right → Pass
- Swipe up → Pass
- Small swipe reset → Pass
- Fast swiping → Pass

### Photo Tests
- Double-tap changes photo → Pass
- Cycling works → Pass
- Last photo loops → Pass
- Image flicker → Fail (sometimes blank before loading)

### Button Tests
- Like button → Pass
- Dislike button → Pass
- Super like → Pass

### Push Notification Tests
- App loads normally → Pass
- Allow notifications → Pass
- Deny notifications → Pass
- Error handling → Needs improvement

### Security Tests
- /server/db.js → FAIL (accessible)
- /server/view-db.js → FAIL (accessible)
- /server/tinder.db → FAIL (accessible)

---

## Conclusion
Partition testing helped us find issues in:
- image loading behavior
- push notification error handling
- backend security (exposed files)
