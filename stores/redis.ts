import { IStore } from "./interface.ts";
import { connect } from "../deps.ts";

export default class RedisStore implements IStore {
  private _sessionRedisStore: any;
  private _hostname: string;
  private _port: number;
  private _ttl = 5;

  constructor(options: any) {
    this._hostname = options.hostname;
    this._port = options.port;
    if (options.ttl) {
      this._ttl += options.ttl;
    }
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
    await this._sessionRedisStore.setex(
      sessionId,
      this._ttl,
      JSON.stringify({}),
    );
  }

  public async setSessionVariable(
    sessionId: any,
    sessionVariableKey: any,
    sessionVariableValue: any,
  ): Promise<void> {
    const session = await this.getSessionById(sessionId);
    session[sessionVariableKey] = sessionVariableValue;

    await this._sessionRedisStore.setex(
      sessionId,
      this._ttl,
      JSON.stringify(session),
    );
  }

  public async deleteSession(sessionId: any): Promise<void> {
    await this._sessionRedisStore.set(sessionId, null);
  }
}
