import type {
  Context,
  CookiesSetDeleteOptions,
  RouterContext,
} from "../deps.ts";
import { SessionData } from "../mod.ts";

export default function use(
  // deno-lint-ignore no-explicit-any
  session: any,
  options: CookiesSetDeleteOptions = {},
) {
  return async (
    context: Context | RouterContext,
    next: () => Promise<void>,
  ) => {
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
