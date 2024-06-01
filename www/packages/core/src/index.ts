import * as d from "datascript"; // version "1.6.5"

export const helloWorld = () => "yaharu";

export const store = (
  hydrateValue: string | undefined,
  {
    storage,
  }: {
    storage: { save: (v: string) => void };
  }
) => {
  const snapshot = hydrateValue ? JSON.parse(hydrateValue) : undefined;
  console.log("snapshot", snapshot);
  const db = snapshot ? d.from_serializable(snapshot) : d.empty_db();
  const conn = db ? d.conn_from_db(db) : d.create_conn();

  d.listen(conn, "main", (r) => {
    storage.save(JSON.stringify(d.serializable(r.db_after)));
  });

  const addEntity = (conn: any, e: { name: string; age: number }) => {
    const { name, age } = e;
    d.transact(conn, [{ ":db/add": -1, name, age }]);
  };

  const removeEntity = (conn: any, e: { id: number }) => {
    const { id } = e;
    d.transact(conn, [[":db/retractEntity", id]]);
  };

  console.log(d.q(`[:find ?e ?a ?v :where [?e ?a ?v]]`, d.db(conn)));

  const self = {
    conn,
    add: (e: { name: string; age: number }) => addEntity(conn, e),
    remove: (e: { id: number }) => removeEntity(conn, e),
    q: () => {
      return d.q(
        `[:find ?e ?name ?age 
        :where 
          [?e "name" ?name] 
          [?e "age" ?age]]`,
        d.db(conn)
      );
    },
  };

  return self;
};
