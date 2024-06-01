declare module "datascript" {
  // Unique symbol for branding
  declare const DBBrand: unique symbol;
  declare const ConnBrand: unique symbol;

  // Branded DB type
  export type DB = {
    [DBBrand]: true;
  };
  export type Conn = { [ConnBrand]: true };

  export type Datom = {
    e: number;
    a: string;
    v: any;
    tx: number;
    added: boolean;
  };

  export type TxReport = {
    db_before: DB;
    db_after: DB;
    tx_data: Datom[];
    tempids: Record<string, number>;
    tx_meta?: any;
  };

  export function empty_db(schema?: any): DB;
  export function init_db(datoms: Datom[], schema?: any): DB;
  export function serializable(db: DB): any;
  export function from_serializable(serialized: any): DB;
  export function q(query: string, ...sources: any[]): any;
  export function pull(db: DB, pattern: string, eid: any): any;
  export function pull_many(db: DB, pattern: string, eids: any[]): any;
  export function db_with(db: DB, entities: any[]): DB;
  export function entity(db: DB, eid: any): any;
  export function touch(entity: any): any;
  export function entity_db(entity: any): DB;
  export function filter(db: DB, predicate: (datom: Datom) => boolean): DB;
  export function is_filtered(db: DB): boolean;
  export function create_conn(schema?: any): Conn;
  export function conn_from_db(db: DB): Conn;
  export function conn_from_datoms(datoms: Datom[], schema?: any): Conn;
  export function db(conn: Conn): DB;
  export function transact(
    conn: Conn,
    entities: any[],
    tx_meta?: any
  ): TxReport;
  export function reset_conn(conn: Conn, db: DB, tx_meta?: any): DB;
  export function listen(
    conn: Conn,
    name: string,
    callback: (report: TxReport) => void
  ): void;
  export function unlisten(
    conn: Conn,
    callback: (report: TxReport) => void
  ): void;
  export function resolve_tempid(
    tempids: Record<string, number>,
    tempid: string
  ): number;
  export function datoms(db: DB, index: string, ...components: any[]): Datom[];
  export function seek_datoms(
    db: DB,
    index: string,
    ...components: any[]
  ): Datom[];
  export function index_range(
    db: DB,
    attr: string,
    start: any,
    end: any
  ): Datom[];
  export function squuid(): string;
  export function squuid_time_millis(uuid: string): number;
}
