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

;[
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
].forEach((day) => {
  const result = d.q(queryLiftsByDay, d.db(conn), day, 'bxp')
  console.log(day, result)
})
