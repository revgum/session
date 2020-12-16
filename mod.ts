import { v4 } from "./deps.ts";
import Memory from "./stores/memory.ts";
import Redis from "./stores/redis.ts";
import Oak from "./frameworks/oak.ts";

type StoreLibs = typeof Memory | typeof Redis;
type Stores = Memory | Redis;
type Frameworks = typeof Oak;

const stores: { [key: string]: StoreLibs } = {
  "memory": Memory,
  "redis": Redis,
};

const frameworks: { [key: string]: Frameworks } = {
  "oak": Oak,
};

export interface ISessionOptions {
  framework: string;
  store: string;
  hostname?: string;
  port?: number;
  ttl?: number;
}

export class Session {
  private _frameworkLib: Frameworks;
  private _storeLib: StoreLibs;
  private _options: ISessionOptions;
  public _store?: Stores;

  constructor(options?: ISessionOptions) {
    this._options = options ?? {
      framework: "oak",
      store: "memory",
    };
    this._frameworkLib = frameworks[this._options.framework];
    this._storeLib = stores[this._options.store];
  }

  public async init() {
    this._store = new this._storeLib(this._options);
    await this._store.init();
  }

  public use() {
    return this._frameworkLib;
  }
}

export class SessionData {
  // deno-lint-ignore no-explicit-any
  private _session: any;
  public sessionId: string;

  // deno-lint-ignore no-explicit-any
  constructor(session: any, sessionId?: string) {
    this._session = session;
    if (sessionId) {
      this.sessionId = sessionId;
    } else {
      this.sessionId = v4.generate();
    }
  }

  public async init(): Promise<void> {
    if (await this._session._store.sessionExists(this.sessionId) === false) {
      await this._session._store.createSession(this.sessionId);
    }
  }

  // deno-lint-ignore no-explicit-any
  public async get(sessionVariableKey: string): Promise<any> {
    let sessionData = await this._session._store.getSessionById(this.sessionId);
    sessionData = sessionData[sessionVariableKey];
    return sessionData;
  }

  public async set(
    sessionVariableKey: string,
    sessionVariableValue: string,
  ): Promise<void> {
    await this._session._store.setSessionVariable(
      this.sessionId,
      sessionVariableKey,
      sessionVariableValue,
    );
  }
}
