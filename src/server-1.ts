import * as d from 'datascript'
import { edn } from './utils/ednTemplateTag'

// Use regular JS API for create connection and add data to DB',
// schema is JS Object
var schema = {
  aka: { ':db/cardinality': ':db.cardinality/many' },
  friend: { ':db/valueType': ':db.type/ref' },
}

var conn = d.create_conn(schema)
var reports = []

d.listen(conn, 'main', (report) => {
  reports.push(report)
})

var datoms = [
  {
    ':db/id': -1,
    name: 'Ivan',
    age: 18,
    aka: ['X', 'Y'],
  },
  {
    ':db/id': -2,
    name: 'Igor',
    aka: ['Grigory', 'Egor'],
  },
  [':db/add', -1, 'friend', -2],
]

// Tx is Js Array of Object or Array
d.transact(conn, datoms, 'initial info about Igor and Ivan')

// report is regular JS object'
// query mori values from conn with CLJS API

// show whole DB

const result = d.q(
  edn`[:find ?n :in $ ?a 
          :where  [?e "friend" ?f] 
                  [?e "age" ?a] 
                  [?f "name" ?n]]`,
  d.db(conn),
  18
)

console.log(result)
