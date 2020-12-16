// deno-lint-ignore-file
export interface IStore {
  init(): Promise<void>;
  sessionExists(sessionId: string): Promise<boolean>;
  getSessionById(sessionId: string): Promise<any>;
  createSession(sessionId: string): Promise<void>;
  setSessionVariable(
    sessionId: string,
    sessionVariableKey: any,
    sessionVariableValue: any,
  ): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
}
