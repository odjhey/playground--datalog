import * as d from 'datascript'
import { edn } from './utils/ednTemplateTag'
import dateFns from 'date-fns'

// Define an interface for events
interface Event {
  type: string
  payload: any
  tz: Date
}

// Event handlers
const eventHandlers = {
  ADD_ENTITY: (conn, payload: any) => {
    d.transact(conn, [{ ':db/add': payload.id, ...payload }])
  },
  REMOVE_ENTITY: (conn, payload: number) => {
    d.transact(conn, [[':db.fn/retractEntity', payload]])
  },
  UPDATE_ENTITY: (
    conn,
    payload: { id: number; updates: { [key: string]: any } }
  ) => {
    const retracts = []
    // const retracts = Object.keys(payload.updates).map((attr) => ({
    //   ':db/retract': payload.id,
    //   [attr]: null,
    // }))
    const adds = Object.entries(payload.updates).map(([attr, value]) => ({
      ':db/id': payload.id,
      [attr]: value,
    }))
    console.log(adds)
    d.transact(conn, [...retracts, ...adds])
  },
}

// Dispatch an event
const dispatch = (conn, event: Event) => {
  const handler = eventHandlers[event.type]
  if (handler) {
    handler(conn, event.payload)
  } else {
    console.warn(`Unknown event type: ${event.type}`)
  }
}

// Apply a list of events to a connection
const applyEvents = (conn, events: Event[]) => {
  events.forEach((event) => dispatch(conn, event))
}

// Create a state reconstruction from the current events
const createStateReconstruction = (events: Event[]) => {
  const conn = d.create_conn()

  d.listen(conn, 'main', (report) => {
    console.log('saving', d.serializable(report.db_after))
  })

  applyEvents(conn, events)

  return [d.db(conn), conn]
}

// Query the database
const query = (db, queryString: string) => {
  return d.q(queryString, db)
}

// Example usage
const events: Event[] = [
  {
    type: 'ADD_ENTITY',
    payload: { id: 1, name: 'John Doe', age: 30 },
    tz: new Date(),
  },
  {
    type: 'ADD_ENTITY',
    payload: { id: 2, name: 'Jane Doe', age: 25 },
    tz: new Date(),
  },
  { type: 'REMOVE_ENTITY', payload: 1, tz: new Date() },
  {
    type: 'UPDATE_ENTITY',
    payload: { id: 2, updates: { nick: 'Johan' } },
    tz: dateFns.add(new Date(), { weeks: 1 }),
  },
  {
    type: 'UPDATE_ENTITY',
    payload: { id: 2, updates: { nick: 'Kiru' } },
    tz: dateFns.add(new Date(), { weeks: 5 }),
  },
]
const [stateReconstruction, conn] = createStateReconstruction(
  events.filter((e) => {
    return dateFns.isBefore(e.tz, dateFns.add(new Date(), { weeks: 6 }))
  })
)

// Query the state reconstruction
const result = query(
  stateReconstruction,
  edn`[:find ?e ?name ?age 
        :where 
          [?e "name" ?name] 
          [?e "age" ?age]]`
)

console.log(events)
console.log(d.pull(d.db(conn), '[*]', 2))
