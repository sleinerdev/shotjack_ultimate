import { useEffect } from "react";

type AnalyticsMode = "auto" | "development" | "production";

type BeforeSendHandler = (event: Record<string, unknown>) =>
  | Record<string, unknown>
  | void;

type PageviewPayload = {
  route?: string | null;
  path?: string | null;
};

type InjectConfig = {
  basePath?: string;
  beforeSend?: BeforeSendHandler;
  debug?: boolean;
  disableAutoTrack?: boolean;
  endpoint?: string;
  dsn?: string;
  mode?: AnalyticsMode;
  scriptSrc?: string;
  framework?: string;
};

export type AnalyticsProps = InjectConfig & PageviewPayload;

declare global {
  interface Window {
    va?: (...params: unknown[]) => void;
    vaq?: unknown[][];
    vam?: "development" | "production";
  }
}

const SDK_NAME = "@vercel/analytics";
const DEFAULT_FRAMEWORK = "next";
const SDK_VERSION = "custom";
const DEBUG_SCRIPT_SRC = "https://va.vercel-scripts.com/v1/script.debug.js";
const DEFAULT_SCRIPT_SRC = "/_vercel/insights/script.js";

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const detectEnvironment = (): "development" | "production" => {
  if (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined") {
    return import.meta.env.DEV ? "development" : "production";
  }

  if (typeof process !== "undefined" && typeof process.env !== "undefined") {
    const env = process.env.NODE_ENV;
    if (env === "development" || env === "test") {
      return "development";
    }
  }

  return "production";
};

const resolveMode = (mode?: AnalyticsMode) => {
  if (!mode || mode === "auto") {
    return detectEnvironment();
  }

  return mode;
};

const stripTrailingSlash = (value: string) => value.replace(/\/$/, "");

const ensureQueue = () => {
  if (!isBrowser()) return;
  if (typeof window.va === "function") return;

  window.va = (...params: unknown[]) => {
    window.vaq = window.vaq || [];
    window.vaq.push(params);
  };
};

const getScriptSrc = (
  mode: "development" | "production",
  basePath?: string,
  override?: string
) => {
  if (override) {
    return override;
  }

  if (mode === "development") {
    return DEBUG_SCRIPT_SRC;
  }

  if (basePath) {
    return `${stripTrailingSlash(basePath)}/insights/script.js`;
  }

  return DEFAULT_SCRIPT_SRC;
};

const inject = ({
  basePath,
  beforeSend,
  debug,
  disableAutoTrack,
  endpoint,
  dsn,
  mode,
  scriptSrc,
  framework = DEFAULT_FRAMEWORK
}: InjectConfig) => {
  if (!isBrowser()) return;

  const resolvedMode = resolveMode(mode);
  window.vam = resolvedMode;

  ensureQueue();

  if (beforeSend) {
    window.va?.("beforeSend", beforeSend);
  }

  const src = getScriptSrc(resolvedMode, basePath, scriptSrc);
  const dataAttributeValue = `${SDK_NAME}/${framework}`;
  const existing = document.head.querySelector<HTMLScriptElement>(
    `script[data-sdkn="${dataAttributeValue}"]`
  );

  if (existing) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = src;
  script.dataset.sdkn = dataAttributeValue;
  script.dataset.sdkv = SDK_VERSION;

  if (disableAutoTrack) {
    script.dataset.disableAutoTrack = "1";
  }

  if (endpoint) {
    script.dataset.endpoint = endpoint;
  } else if (basePath) {
    script.dataset.endpoint = `${stripTrailingSlash(basePath)}/insights`;
  }

  if (dsn) {
    script.dataset.dsn = dsn;
  }

  if (resolvedMode === "development" && debug === false) {
    script.dataset.debug = "false";
  }

  script.onerror = () => {
    const errorMessage =
      resolvedMode === "development"
        ? "Please check if any ad blockers are enabled and try again."
        : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";

    console.log(
      `[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`
    );
  };

  document.head.appendChild(script);
};

const pageview = ({ route, path }: PageviewPayload) => {
  if (!isBrowser()) return;
  if (!route && !path) return;

  window.va?.("pageview", { route: route ?? path ?? null, path: path ?? route ?? null });
};

export function Analytics({
  beforeSend,
  debug,
  disableAutoTrack,
  basePath,
  endpoint,
  dsn,
  mode,
  scriptSrc,
  framework,
  route,
  path
}: AnalyticsProps = {}) {
  useEffect(() => {
    if (!beforeSend || !isBrowser()) return;
    window.va?.("beforeSend", beforeSend);
  }, [beforeSend]);

  useEffect(() => {
    inject({
      basePath,
      beforeSend,
      debug,
      disableAutoTrack:
        route !== undefined || path !== undefined ? true : disableAutoTrack,
      endpoint,
      dsn,
      mode,
      scriptSrc,
      framework
    });
  }, [
    basePath,
    beforeSend,
    debug,
    disableAutoTrack,
    endpoint,
    dsn,
    mode,
    scriptSrc,
    framework,
    route,
    path
  ]);

  useEffect(() => {
    if (route === undefined && path === undefined) {
      return;
    }

    pageview({ route: route ?? null, path: path ?? null });
  }, [route, path]);

  return null;
}
