import { useState } from "react";

export default function ChipInput({ values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  function commit(raw) {
    const parts = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...values];
    parts.forEach((p) => {
      if (!next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    });
    onChange(next);
    setDraft("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="chip-input">
      {values.map((v) => (
        <span className="chip" key={v}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        placeholder={values.length ? "" : placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && commit(draft)}
      />
    </div>
  );
}
