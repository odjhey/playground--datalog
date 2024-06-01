import * as d from 'datascript'
import * as dateFns from 'date-fns'
import { edn } from './utils/ednTemplateTag'

// Define an interface for workout events
interface WorkoutEvent {
  type: 'RECORD_WORKOUT'
  payload: {
    id: number
    exercise: string
    weight: number
    reps: number
    sets: number
    remarks?: string
  }
  tz: Date
}

// Event handler
const eventHandlers = {
  RECORD_WORKOUT: (conn, payload: any) => {
    d.transact(conn, [{ ':db/add': payload.id, ...payload }])
  },
}

// Dispatch an event
const dispatch = (conn, event: WorkoutEvent) => {
  const handler = eventHandlers[event.type]
  if (handler) {
    handler(conn, event.payload)
  } else {
    console.warn(`Unknown event type: ${event.type}`)
  }
}

// Apply a list of events to a connection
const applyEvents = (conn, events: WorkoutEvent[]) => {
  events.forEach((event) => dispatch(conn, event))
}

// Create a state reconstruction from the current events
const createStateReconstruction = (events: WorkoutEvent[]) => {
  const conn = d.create_conn()

  d.listen(conn, 'main', (report) => {
    // console.log('saving', d.serializable(report.db_after))
  })

  applyEvents(conn, events)

  return [d.db(conn), conn]
}

// Function to query the database
const query = (db, queryString: string) => {
  return d.q(queryString, db)
}

// Example usage
const events: WorkoutEvent[] = [
  {
    type: 'RECORD_WORKOUT',
    payload: {
      id: 1,
      exercise: 'Bench Press',
      weight: 100,
      reps: 10,
      sets: 3,
      remarks: 'Felt strong',
    },
    tz: new Date(),
  },
  {
    type: 'RECORD_WORKOUT',
    payload: { id: 2, exercise: 'Squat', weight: 150, reps: 8, sets: 4 },
    tz: new Date(),
  },
  {
    type: 'RECORD_WORKOUT',
    payload: {
      id: 3,
      exercise: 'Bench Press',
      weight: 105,
      reps: 9,
      sets: 3,
      remarks: 'Tough but good',
    },
    tz: dateFns.add(new Date(), { days: 1 }),
  },
  {
    type: 'RECORD_WORKOUT',
    payload: { id: 4, exercise: 'Deadlift', weight: 200, reps: 6, sets: 3 },
    tz: dateFns.add(new Date(), { days: 2 }),
  },
]

const [stateReconstruction, conn] = createStateReconstruction(events)

// Query to get the latest workout for each exercise
const latestWorkoutsQuery = edn`
  [:find ?max-id ?exercise ?weight ?reps ?sets ?remarks
    :where 
      [?e "id" ?id]
      [?e "exercise" ?exercise]
      [?e "weight" ?weight]
      [?e "reps" ?reps]
      [?e "sets" ?sets]
      [(get-else $ ?e "remarks" "") ?remarks]
      [?e "id" ?max-id]
      [(max ?id) ?max-id]]
      `

// Query the latest workouts
const latestWorkouts = query(stateReconstruction, latestWorkoutsQuery)

console.log('Latest workouts:', latestWorkouts)
