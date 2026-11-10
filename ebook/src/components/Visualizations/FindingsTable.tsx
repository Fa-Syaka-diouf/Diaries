import { formatP, observations, type SeriesId } from '../../data/environmentalData'
import { locationByKey, type LocationKey } from '../../data/locations'
import { seriesDisplay } from '../../data/seriesDisplay'
import { rateOf } from './StatisticalResults'

/** Every computed result in one table (list view and print edition). */
export function FindingsTable() {
  const ids = Object.keys(observations) as SeriesId[]
  return (
    <div className="table-wrap">
      <table className="findings-table">
        <thead>
          <tr>
            <th>Place</th>
            <th>Variable</th>
            <th>Period</th>
            <th>Sen’s slope (95 % CI)</th>
            <th>Mann–Kendall</th>
            <th>Dataset</th>
          </tr>
        </thead>
        <tbody>
          {ids.map((id) => {
            const s = observations[id]
            const r = rateOf(id)
            const place = s.location === 'global' ? 'Global background' : locationByKey[s.location as LocationKey].name
            return (
              <tr key={id}>
                <td>{place}</td>
                <td>{seriesDisplay[id].short}</td>
                <td>{s.coverage}</td>
                <td>
                  {r.value} {r.unit} ({r.lo} to {r.hi})
                </td>
                <td>
                  {s.trend.significant ? 'significant' : 'not significant'}, {formatP(s.trend.pValue)}, τ = {s.trend.kendallTau}
                </td>
                <td>
                  <a href={s.landing}>{s.dataset}</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
