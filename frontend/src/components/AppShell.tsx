import type { ComponentChildren } from "preact";
import { useI18n } from "../lib/i18n";
import { currentGroupId, currentRoute, currentTaskId, navigate } from "../lib/routes";

function navClass(isActive: boolean): string {
  return isActive
    ? "btn btn-sm bg-ink text-base-100 border-ink"
    : "btn btn-sm btn-ghost text-ink";
}

function contextNavClass(isActive: boolean): string {
  return isActive
    ? "btn btn-xs border-ink bg-base-200 text-ink"
    : "btn btn-xs btn-ghost text-slate-600";
}

function buildShellFocus(route: string, locale: string): {
  label: string;
  headline: string;
  summary: string;
  proofPath: string;
} {
  const zh = locale === "zh-CN";

  if (route === "watch-new") {
    return {
      label: zh ? "当前重点" : "Current focus",
      headline: zh ? "把已确认的一行变成可执行 watch state" : "Turn one confirmed row into executable watch state",
      summary: zh
        ? "这里只有在 compare 结果已经站住脚之后才值得继续。先把标题、候选键和提醒人填对，再提交。"
        : "This lane only matters after the compare result is honest enough. Confirm the title, candidate key, and recipient before you commit.",
      proofPath: zh
        ? "证据路径：先保留 compare 包，再把单行 watch task 当成最后一步。"
        : "Proof path: keep the compare package first, then treat the one-row watch task as the final move.",
    };
  }

  if (route === "watch-list") {
    return {
      label: zh ? "当前重点" : "Current focus",
      headline: zh ? "先看哪些 watch 还需要人确认，不要直接继续加新 URL" : "Review which watches still need confirmation before adding more URLs",
      summary: zh
        ? "如果已有 watch 或 group 在排队，就先回到它们的证据和冷却状态，再决定是否重新 compare。"
        : "If watches or groups are already queued, return to their evidence and cooldown state before starting another compare run.",
      proofPath: zh
        ? "证据路径：watch list 只吃已经站稳的 compare 结果，不替代 compare 本身。"
        : "Proof path: the watch list only consumes compare results that already stand on solid evidence; it does not replace compare itself.",
    };
  }

  if (route === "settings") {
    return {
      label: zh ? "当前重点" : "Current focus",
      headline: zh ? "把提醒节奏调成可信执行面" : "Tune the reminder cadence into a trustworthy execution surface",
      summary: zh
        ? "这里不是主入口，但它决定后面的提醒有没有噪音。先确认收件人和冷却时间，再回 compare。"
        : "This is not the primary lane, but it decides whether later alerts become noise. Confirm the recipient and cooldown before you go back to compare.",
      proofPath: zh
        ? "证据路径：设置页负责守纪律，不负责制造结论。"
        : "Proof path: settings enforce discipline; they do not create the decision itself.",
    };
  }

  return {
    label: zh ? "当前重点" : "Current focus",
    headline: zh ? "先把 basket 比干净，再决定是否进入 watch state" : "Cleanly compare the basket before moving anything into watch state",
    summary: zh
      ? "先比较至少两条商品 URL，让 decision board 说清楚谁更强、哪里还不稳，再决定是建 group 还是只保留证据。"
      : "Compare at least two product URLs first, let the decision board explain what is strong and what is still shaky, then decide between a watch group or evidence-only review.",
    proofPath: zh
      ? "证据路径：先保存本地 evidence package；只有在 basket 足够诚实时，才继续创建 runtime package 或 watch group。"
      : "Proof path: save a local evidence package first; only move into runtime packages or watch groups once the basket is honest enough.",
  };
}

export function AppShell(props: { children: ComponentChildren }) {
  const { locale, setLocale, t } = useI18n();
  const hasContextActions =
    currentRoute.value === "watch-new" || Boolean(currentTaskId.value) || Boolean(currentGroupId.value);
  const shellFocus = buildShellFocus(currentRoute.value, locale);

  return (
    <div class="min-h-screen bg-mesh grid-fade text-ink">
      <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-6">
        <header class="mb-6 rounded-[2rem] border border-base-300/70 bg-base-100/90 p-5 shadow-card backdrop-blur">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
                {t("shell.eyebrow")}
              </p>
              <h1 class="mt-2 font-serif text-4xl font-semibold text-ink">
                {t("shell.title")}
              </h1>
              <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {t("shell.summary")}
              </p>
            </div>
            <div class="flex flex-col gap-3 md:items-end">
              <div class="rounded-2xl border border-base-300 bg-base-200/80 px-4 py-3 text-sm text-slate-600">
                <div class="font-semibold text-ink">{t("shell.productShapeLabel")}</div>
                <div>{t("shell.productShapeValue")}</div>
              </div>
              <div
                aria-label={t("common.languageLabel")}
                class="inline-flex items-center gap-2 rounded-2xl border border-base-300 bg-base-100/90 px-3 py-2 text-xs text-slate-600"
                role="group"
              >
                <span class="font-semibold text-ink">{t("common.languageLabel")}</span>
                <button
                  class={locale === "en" ? "btn btn-xs border-ink bg-ink text-base-100" : "btn btn-xs btn-ghost text-ink"}
                  onClick={() => setLocale("en")}
                  type="button"
                >
                  {t("common.locale.en")}
                </button>
                <button
                  class={locale === "zh-CN" ? "btn btn-xs border-ink bg-ink text-base-100" : "btn btn-xs btn-ghost text-ink"}
                  onClick={() => setLocale("zh-CN")}
                  type="button"
                >
                  {t("common.locale.zh-CN")}
                </button>
              </div>
            </div>
          </div>

          <div class="mt-5 border-t border-base-300/70 pt-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t("shell.primaryPathLabel")}
              </span>
              <span class="badge badge-outline border-ember/30 bg-base-200/70 text-ember">
                1. {t("shell.primaryPathCompare")}
              </span>
              <span class="text-slate-400">-&gt;</span>
              <span class="badge badge-outline border-ink/15 bg-base-200/70 text-ink">
                2. {t("shell.primaryPathDecision")}
              </span>
              <span class="text-slate-400">-&gt;</span>
              <span class="badge badge-outline border-ink/15 bg-base-200/70 text-ink">
                3. {t("shell.primaryPathCommit")}
              </span>
            </div>

            <div class="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div class="flex flex-col gap-2">
                <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {t("shell.primaryNavLabel")}
                </span>
                <nav class="flex flex-wrap gap-2">
                  <button
                    class={navClass(currentRoute.value === "compare")}
                    onClick={() => navigate("compare")}
                    type="button"
                  >
                    {t("shell.nav.compare")}
                  </button>
                  <button
                    class={navClass(currentRoute.value === "watch-list")}
                    onClick={() => navigate("watch-list")}
                    type="button"
                  >
                    {t("shell.nav.watchList")}
                  </button>
                  <button
                    class={navClass(currentRoute.value === "settings")}
                    onClick={() => navigate("settings")}
                    type="button"
                  >
                    {t("shell.nav.settings")}
                  </button>
                </nav>
              </div>

              <div class="flex flex-col gap-2 xl:items-end">
                <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {t("shell.secondaryNavLabel")}
                </span>
                <div class="flex flex-wrap items-center gap-2">
                  {currentRoute.value === "watch-new" ? (
                    <button
                      class={contextNavClass(true)}
                      onClick={() => navigate("watch-new")}
                      type="button"
                    >
                      {t("shell.nav.watchNew")}
                    </button>
                  ) : null}
                  {currentTaskId.value ? (
                    <button
                      class={contextNavClass(currentRoute.value === "watch-detail")}
                      onClick={() => navigate("watch-detail")}
                      type="button"
                    >
                      {t("shell.nav.watchDetail")}
                    </button>
                  ) : null}
                  {currentGroupId.value ? (
                    <button
                      class={contextNavClass(currentRoute.value === "watch-group-detail")}
                      onClick={() => navigate("watch-group-detail")}
                      type="button"
                    >
                      {t("shell.nav.watchGroupDetail")}
                    </button>
                  ) : null}
                  {!hasContextActions ? (
                    <span class="text-xs text-slate-500">{t("shell.secondaryHint")}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-3 xl:grid-cols-[1.3fr,0.7fr]">
              <div class="rounded-[1.5rem] border border-ink/10 bg-gradient-to-r from-base-100 via-base-100 to-base-200/70 px-4 py-4 shadow-sm">
                <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {shellFocus.label}
                </div>
                <div class="mt-2 text-lg font-semibold text-ink">{shellFocus.headline}</div>
                <p class="mt-2 text-sm leading-6 text-slate-600">{shellFocus.summary}</p>
              </div>
              <div class="rounded-[1.5rem] border border-ember/20 bg-ember/5 px-4 py-4">
                <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember">
                  {locale === "zh-CN" ? "证据路径" : "Proof path"}
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-700">{shellFocus.proofPath}</p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1">{props.children}</main>
      </div>
    </div>
  );
}
