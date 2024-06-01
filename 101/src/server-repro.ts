import * as d from 'datascript' // version "1.6.5"

const conn = d.create_conn()
d.transact(conn, [{ ':db/add': 1, name: 'John Doe', age: 30 }])
d.transact(conn, [{ ':db/retractEntity': 1 }]) // <--- this is wrong
d.transact(conn, [[':db/retractEntity', 1]]) // <--- should be like this
// d.transact(conn, [{ ':db.fn/retractEntity': 1 }]) // <--- also tried this and it does not work

console.log(
  d.q(
    `[:find ?e ?name ?age 
        :where 
          [?e "name" ?name] 
          [?e "age" ?age]]`,
    d.db(conn)
  )
)

console.log(d.q(`[:find ?e ?a ?v :where [?e ?a ?v]]`, d.db(conn)))

// my output:
// [ [ 1, 'John Doe', 30 ] ]

// my expected output:
// []
