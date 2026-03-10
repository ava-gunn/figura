// src/index.ts
function toMiniNotation(figure) {
  const notesParts = [];
  const structParts = [];
  const velocityParts = [];
  for (const ev of figure.events) {
    if (ev.note === "~") {
      notesParts.push("~");
      structParts.push("f");
      velocityParts.push("0");
    } else {
      const vel = ev.velocity === 0 ? "0" : ev.velocity === 1 ? "1" : "0.8";
      if (ev.tie) {
        notesParts.push(`${ev.note}_`);
        structParts.push("f");
        velocityParts.push(vel);
      } else if (ev.duration === 0.5) {
        notesParts.push(`${ev.note}/2`);
        structParts.push("t");
        velocityParts.push(vel);
      } else {
        notesParts.push(ev.note);
        structParts.push("t");
        velocityParts.push(vel);
      }
    }
  }
  return {
    notes: notesParts.join(" "),
    struct: structParts.join(" "),
    velocity: velocityParts.join(" ")
  };
}
export {
  toMiniNotation
};
