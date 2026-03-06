export default function ReflectionCard({ reflection, onChange }) {
  return (
    <div className="card">
      <div className="section-title">REFLECTION (min 150 chars)</div>
      <textarea id="reflection" value={reflection} onChange={(e) => onChange(e.target.value)} />
      <div id="charCount">{reflection.length} / 150</div>
    </div>
  );
}
