/**
 * FeatureTiles.tsx — Action tiles below the prayer grid (city page).
 *
 * PURPOSE: Qibla, Monthly Table, and Yearly Calendar entry points. The Qibla
 *   tile shows the live bearing; each tile opens its modal.
 * DOM contract (city-page.spec): .ftile (filtered by text "Qibla"/"Monthly"/
 *   "Yearly"); .ftile-bearing (contains "°").
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

interface Props {
  qiblaDeg: number;
  qiblaCompass: string;
  onOpenQibla: () => void;
  onOpenMonthly: () => void;
  onOpenYearly: () => void;
}

export default function FeatureTiles({
  qiblaDeg,
  qiblaCompass,
  onOpenQibla,
  onOpenMonthly,
  onOpenYearly,
}: Props) {
  return (
    <div className="ftile-grid">
      <button type="button" className="ftile ftile--qibla" onClick={onOpenQibla}>
        <span className="ftile-icon" aria-hidden="true">🧭</span>
        <span className="ftile-title">Qibla</span>
        <span className="ftile-bearing">{Math.round(qiblaDeg)}° {qiblaCompass}</span>
      </button>

      <button type="button" className="ftile ftile--monthly" onClick={onOpenMonthly}>
        <span className="ftile-icon" aria-hidden="true">📅</span>
        <span className="ftile-title">Monthly Table</span>
        <span className="ftile-sub">This month's times</span>
      </button>

      <button type="button" className="ftile ftile--yearly" onClick={onOpenYearly}>
        <span className="ftile-icon" aria-hidden="true">🗓️</span>
        <span className="ftile-title">Yearly Calendar</span>
        <span className="ftile-sub">Full year overview</span>
      </button>
    </div>
  );
}
