// ✅ File: /app/lib/jopatternstate.js

let selectedJoPatternId = null;

export function setJoPatternId(id) {
  selectedJoPatternId = id;
}

export function getJoPatternId() {
  return selectedJoPatternId;
}
