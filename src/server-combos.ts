import * as d from 'datascript'
import { edn } from './utils/ednTemplateTag'

const schema = {
  'state/name': { ':db/unique': ':db.unique/identity' },
  'move/from': { ':db/valueType': ':db.type/ref' },
  'move/to': { ':db/valueType': ':db.type/ref' },
}

const conn = d.create_conn(schema)
const reports: any[] = []
d.listen(conn, 'main', (report) => {
  reports.push(report)
})

let tempIdCounter = -1

function nId(): number {
  return tempIdCounter--
}

const states = [
  { ':db/id': nId(), 'state/name': 'rest' },
  { ':db/id': nId(), 'state/name': 'overhead slash' },
  { ':db/id': nId(), 'state/name': 'side slash' },
  { ':db/id': nId(), 'state/name': 'rising slash' },
  { ':db/id': nId(), 'state/name': 'morph to sword' },
  { ':db/id': nId(), 'state/name': 'forward slash' },
  { ':db/id': nId(), 'state/name': 'forward overhead slash' },
  { ':db/id': nId(), 'state/name': 'rising slash' },
  { ':db/id': nId(), 'state/name': 'wild swing' },
  { ':db/id': nId(), 'state/name': 'roll' },
  { ':db/id': nId(), 'state/name': 'heavy slam' },
  { ':db/id': nId(), 'state/name': 'wide sweep' },
  { ':db/id': nId(), 'state/name': 'rising slash' },
]

// Create a map to track state names to their temporary IDs
const m = states.reduce((map, state) => {
  map[state['state/name']] = state[':db/id']
  return map
}, {} as Record<string, number>)

const moves = [
  { 'move/from': m['rest'], 'move/to': m['overhead slash'] },
  { 'move/from': m['overhead slash'], 'move/to': m['side slash'] },
  { 'move/from': m['side slash'], 'move/to': m['rising slash'] },
  { 'move/from': m['rising slash'], 'move/to': m['rest'] },
]

d.transact(conn, [...states, ...moves])
function findNextMoves(db: any, state: string): any[] {
  const stateId = d.q(
    edn`[:find ?e 
          :in $ ?name 
          :where [?e "state/name" ?name]]`,
    db,
    state
  )[0][0]

  return d.q(
    edn`[:find ?to-name 
          :in $ ?state-id 
          :where 
            [?m "move/from" ?state-id] 
            [?m "move/to" ?to-id] 
            [?to-id "state/name" ?to-name]]`,
    db,
    stateId
  )
}

function buildCombo(
  db: any,
  state: string,
  combo: string[],
  visited: Set<string>
): string[][] {
  if (visited.has(state)) {
    return [combo.concat('loop')]
  }

  const nextMoves = findNextMoves(db, state)
  if (nextMoves.length === 0) {
    return [combo.concat('end')]
  }

  visited.add(state)

  const combos = nextMoves.flatMap((nextMove: any) => {
    const newVisited = new Set(visited)
    return buildCombo(db, nextMove[0], combo.concat(nextMove), newVisited)
  })

  visited.delete(state)

  return combos
}

console.log(buildCombo(d.db(conn), 'rest', ['rest'], new Set<string>()))
