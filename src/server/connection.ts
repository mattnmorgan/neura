/**
 * Login credentials for database
 */
type Credential = string | object;

export default abstract class Connection<DB> {
  /**
   * Database instance for this connection
   */
  private db: DB;

  /**
   * Database credentials for this connection
   */
  private credential: Credential;

  protected constructor(credential: Credential) {
    this.credential = credential;
  }

  /**
   * Initializes this connection
   */
  public async initialize(): Promise<void> {
    this.db = await this.connect(this.credential);
  }

  /**
   * @param credential Login credentials for use in connecting to the db
   * @returns The database connection
   */
  protected abstract connect(credential: string | object): Promise<DB>;

  /**
   * @returns The database connection
   */
  public get database(): DB {
    return this.db;
  }
}
