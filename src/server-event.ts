import * as d from 'datascript'
import { edn } from './utils/ednTemplateTag'

// Define an interface for events
interface Event {
  type: string
  payload: any
}

// Event handlers
const eventHandlers = {
  ADD_ENTITY: (conn, payload: any) => {
    d.transact(conn, [{ ':db/add': payload.id, ...payload }])
  },
  REMOVE_ENTITY: (conn, payload: number) => {
    d.transact(conn, [[':db.fn/retractEntity', payload]])
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
    // console.log(report.tx_data)
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
  { type: 'ADD_ENTITY', payload: { id: 1, name: 'John Doe', age: 30 } },
  { type: 'ADD_ENTITY', payload: { id: 2, name: 'Jane Doe', age: 25 } },
  { type: 'REMOVE_ENTITY', payload: 1 },
]
const [stateReconstruction, conn] = createStateReconstruction(events)

// Query the state reconstruction
const result = query(
  stateReconstruction,
  edn`[:find ?e ?name ?age 
        :where 
          [?e "name" ?name] 
          [?e "age" ?age]]`
)

console.log(result) // Output should show the state after applying all events
