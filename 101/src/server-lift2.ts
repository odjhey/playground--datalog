import * as d from 'datascript'
import { edn } from './utils/ednTemplateTag'

const schema = {
  ':lift/tags': {
    ':db/valueType': ':db.type/ref',
    ':db/cardinality': ':db.cardinality/many',
  },
  ':schedule/tags': {
    ':db/valueType': ':db.type/ref',
    ':db/cardinality': ':db.cardinality/many',
  },
}

const conn = d.create_conn(schema)
const reports: any[] = []
d.listen(conn, 'main', (report) => {
  reports.push(report)
})

const TAGS = {
  PUSH: [-1, 'push'],
  PULL: [-2, 'pull'],
  LEG: [-3, 'leg'],
}

const tags = Object.keys(TAGS)
  .map((v) => {
    return { ':db/id': TAGS[v][0], ':tag/name': TAGS[v][1] }
  })
  .concat([{ ':db/id': -4, ':tag/name': 'bxp' }])

const id = (v) => v[0]

// @todo find ways to better handle id's

// lifts by push, pull, leg
const liftsByTagDb = {
  [id(TAGS.PUSH)]: [
    'bench press',
    'inclined dumbbell press',
    'shoulder press',
    'dumbbell fly',
    'tri push-down',
    'single arm tri',
  ],
  [id(TAGS.PULL)]: ['lat pulldown'],
  [id(TAGS.LEG)]: ['squat', 'dead-lift', 'leg curl', 'leg extension'],
}

// convert to liftsDb like structure
const liftsDb = Object.entries(liftsByTagDb).flatMap(([tagId, lifts]) => {
  return lifts.map((lift) => [lift, [+tagId]] as const)
})

const extraTags = [{ 'bench press': [-4] }]

const lifts = liftsDb.map(([name, tags], i) => {
  const matchTag = extraTags.find((v) => v[name])
  const tagId = matchTag ? matchTag[name] : []

  return {
    ':db/id': 1000 * (i + 1) * -1,
    ':lift/name': name,
    ':lift/tags': [...tags, ...tagId],
  }
})

const schedules = [
  { ':db/id': -20, ':schedule/day': 'monday', ':schedule/tags': [-1] },
  { ':db/id': -21, ':schedule/day': 'tuesday', ':schedule/tags': [-2] },
  { ':db/id': -22, ':schedule/day': 'wednesday', ':schedule/tags': [-3] },
  { ':db/id': -23, ':schedule/day': 'thursday', ':schedule/tags': [] },
  { ':db/id': -24, ':schedule/day': 'friday', ':schedule/tags': [-1] },
  { ':db/id': -25, ':schedule/day': 'saturday', ':schedule/tags': [-2] },
  { ':db/id': -26, ':schedule/day': 'sunday', ':schedule/tags': [-3] },
]

const txData = [...tags, ...lifts, ...schedules]

d.transact(conn, txData, 'initial')

const queryLiftsByDay = edn`[
    :find ?liftName
    :in $ ?scheduleDay ?place
    :where
      [?scheduleRef ":schedule/day" ?scheduleDay]
      [?scheduleRef ":schedule/tags" ?tag]
      [?tag ":tag/name" ?tagName]
      [?lift ":lift/tags" ?tag]
      [?lift ":lift/name" ?liftName]
      [?lift ":lift/tags" ?allTags]
      [?allTags ":tag/name" ?place]
    ]`

// ;[
//   'monday',
//   'tuesday',
//   'wednesday',
//   'thursday',
//   'friday',
//   'saturday',
//   'sunday',
// ].forEach((day) => {
//   const result = d.q(queryLiftsByDay, d.db(conn), day, 'bxp')
//   console.log(day, result)
// })

const snapshot = {
  count: 6,
  tx0: 536870912,
  'max-eid': 3,
  'max-tx': 536870913,
  schema: '{"age" {:db/index true}}',
  attrs: ['age', 'name'],
  keywords: [],
  eavt: [
    [1, 0, 15, 1],
    [1, 1, 'Ivan', 1],
    [2, 0, 37, 1],
    [2, 1, 'Petr', 1],
    [3, 0, 37, 1],
    [3, 1, 'Ivan', 1],
  ],
  aevt: [0, 2, 4, 1, 3, 5],
  avet: [0, 2, 4],
}
const people_db = d.from_serializable(snapshot)
const conn2 = d.conn_from_db(people_db)

d.listen(conn2, 'main', (report) => {
  console.log(report)
})

d.transact(conn2, [{ ':db/id': 5, name: 'Josh', age: 15 }], 'initial')

// var people_db = d.db_with(d.empty_db({ age: { ':db/index': true } }), [
//   { ':db/id': 1, name: 'Ivan', age: 15 },
//   { ':db/id': 2, name: 'Petr', age: 37 },
//   { ':db/id': 3, name: 'Ivan', age: 37 },
// ])
console.log(test_q_rules())
// get age
console.log(d.pull(people_db, '["age"]', 1))

function test_q_rules() {
  var res = d.q(
    edn`[:find ?e1 ?e2 
                  :in $ % 
                  :where (mate ?e1 ?e2) 
                      [(< ?e1 ?e2)]] ;;index compare  ?
                      `,
    people_db,
    edn`[[(mate ?e1 ?e2)   
                  [?e1 "name" ?n]  
                  [?e2 "name" ?n]] 
                  [(mate ?e1 ?e2)   
                    [?e1 "age" ?a]   
                    [?e2 "age" ?a]]]`
  )
  //  assert_eq_set(
  //    [
  //      [1, 3],
  //      [2, 3],
  //    ],
  //    res
  //  )
  return res
}
