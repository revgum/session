// deno-lint-ignore-file
import { IStore } from "./interface.ts";
import { connect } from "../deps.ts";
import { ISessionOptions } from "../mod.ts";

type RedisStoreOptions = Omit<ISessionOptions, "framework" | "store">;
export default class RedisStore implements IStore {
  private _sessionRedisStore: any;
  private _hostname = "localhost";
  private _port = 6379;
  private _ttl = 5;

  constructor(options: RedisStoreOptions) {
    if (options.hostname) this._hostname = options.hostname;
    if (options.port) this._port = options.port;
    if (options.ttl) this._ttl += options.ttl;
  }

  public async init() {
    this._sessionRedisStore = await connect({
      hostname: this._hostname,
      port: this._port,
    });
  }

  public async sessionExists(sessionId: string): Promise<boolean> {
    if (await this._sessionRedisStore.get(sessionId) !== undefined) {
      return true;
    } else {
      return false;
    }
  }

  public async getSessionById(sessionId: string): Promise<any> {
    return JSON.parse(await this._sessionRedisStore.get(sessionId));
  }

  public async createSession(sessionId: string): Promise<void> {
    await this._sessionRedisStore.set(
      sessionId,
      JSON.stringify({}),
      { ex: this._ttl },
    );
  }

  public async setSessionVariable(
    sessionId: string,
    sessionVariableKey: any,
    sessionVariableValue: any,
  ): Promise<void> {
    const session = await this.getSessionById(sessionId);
    session[sessionVariableKey] = sessionVariableValue;

    await this._sessionRedisStore.set(
      sessionId,
      JSON.stringify(session),
      { ex: this._ttl },
    );
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await this._sessionRedisStore.set(sessionId, null);
  }
}
