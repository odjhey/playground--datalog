import * as d from 'datascript'
import { edn } from './utils/ednTemplateTag'

var conn = d.create_conn()

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
]

// Tx is Js Array of Object or Array
d.transact(conn, datoms, 'initial info about Igor and Ivan')
d.transact(conn, [{ ':db/add': -1, name: 'odee' }])
d.transact(conn, [{ ':db.fn/retractEntity': 3 }])

const result = d.q(
  edn`[:find ?n :in $ ?a 
          :where  [?e "friend" ?f] 
                  [?e "age" ?a] 
                  [?f "name" ?n]]`,
  d.db(conn),
  18
)

console.log(d.q(edn`[:find ?e ?a ?v :where [?e ?a ?v]]`, d.db(conn)))
console.log(
  d.q(edn`[:find ?e ?a ?v :where [?e ?a ?v][?e "name" ?v]]`, d.db(conn))
)
