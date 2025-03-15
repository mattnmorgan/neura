import Connection from "./connection";
import { open, Database } from "sqlite";
import { Database as Driver } from "sqlite3";

export default class Connector extends Connection<Database> {
  public constructor(credential: string) {
    super(credential);
  }

  protected async connect(credential: string): Promise<Database> {
    return await open({
      filename: credential,
      driver: Driver,
    });
  }
}
