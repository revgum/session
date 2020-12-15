import type { Cookie } from "../deps.ts";
import { SessionData } from "../mod.ts";

type CookieOptions = Omit<Cookie, "value" | "name">;

export default function use(session: any, options: CookieOptions = {}) {
  return async (context: any, next: any) => {
    const sid = context.cookies.get("sid");

    if (sid === undefined) {
      context.state.session = new SessionData(session);
      context.cookies.set("sid", context.state.session.sessionId, options);
    } else if (session._store.sessionExists(sid) === false) {
      context.state.session = new SessionData(session);
      context.cookies.set("sid", context.state.session.sessionId, options);
    } else {
      context.state.session = new SessionData(session, sid);
    }

    await context.state.session.init();

    await next();
  };
}
