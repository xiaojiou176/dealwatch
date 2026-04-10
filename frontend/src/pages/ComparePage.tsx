import { useEffect, useMemo, useState } from "preact/hooks";
import { ApiError } from "../lib/api";
import { useI18n } from "../lib/i18n";
import {
  useComparePreview,
  useCreateCompareEvidencePackage,
  useCreateWatchGroup,
  useNotificationSettings,
} from "../lib/hooks";
import { navigate, setWatchTaskDraft } from "../lib/routes";
import type {
  CompareEvidencePackageArtifact,
  ComparePreviewComparison,
  SavedCompareEvidencePackage,
  WatchGroupCandidateInput,
} from "../types";
import {
  EVIDENCE_STORAGE_KEY,
  MAX_SAVED_EVIDENCE_PACKAGES,
  defaultUrls,
  type DraftMessage,
} from "./compare/copy";
import {
  buildCandidateScoreIndex,
  buildCompareSchema,
  buildCreateGroupSchema,
  buildDecisionBoard,
  buildShareSummary,
  buildSavedEvidencePackage,
  buildSavedPackageId,
  defaultGroupTitle,
  loadSavedEvidencePackages,
  normalizeUrls,
  resolveCompareCopy,
  resolveUiMessage,
} from "./compare/helpers";
import {
  CompareDecisionSection,
  SavedEvidenceSection,
  CandidateEvidenceSection,
  GroupBuilderSection,
  PairEvidenceSection,
  type CompareGroupFormState,
} from "./compare/sections";

function compareExecutionCopy(
  locale: string,
  values: {
    hasDecision: boolean;
    hasSavedPackage: boolean;
    hasRuntimePackage: boolean;
    groupReadyCount: number;
  },
): {
  laneTitle: string;
  laneSummary: string;
  proofTitle: string;
  proofSummary: string;
  commitTitle: string;
  commitSummary: string;
  saveLabel: string;
  runtimeLabel: string;
  jumpLabel: string;
} {
  if (locale === "zh-CN") {
    return {
      laneTitle: values.hasDecision ? "下一步：按 decision board 行动" : "下一步：先跑出 compare 结果",
      laneSummary: values.hasDecision
        ? "别直接跳去建 watch。先看 decision board 推荐的是继续 review、建 group，还是只保留证据。"
        : "先提交至少两条 URL，让 compare 结果把 basket 里最强的一行和最该警惕的风险说清楚。",
      proofTitle: values.hasRuntimePackage
        ? "证据已进入 runtime 包"
        : values.hasSavedPackage
          ? "证据已本地保存，仍可继续加固"
          : "证据还没落袋",
      proofSummary: values.hasRuntimePackage
        ? "这轮 compare 已经有 runtime-backed proof，可以带着清楚的边界继续往下走。"
        : values.hasSavedPackage
          ? "本地 evidence package 已保存。下一步只有在这篮子还站得住时，才值得继续铸成 runtime 包。"
          : "先把 evidence package 存下来，再谈 commit。这样你回头复核时不会只剩一张好看的页面。",
      commitTitle: values.groupReadyCount >= 2 ? "可以考虑进入 compare-aware watch group" : "还不到 commit 成 group 的时机",
      commitSummary: values.groupReadyCount >= 2
        ? `当前已有 ${values.groupReadyCount} 个 group-ready 行，可以进入 watch group builder，但前提还是证据先站稳。`
        : "现在更像 review lane，不像 commit lane。先把支持度不足的行留在证据层，不要急着变成长期 watch state。",
      saveLabel: "先保存本地证据",
      runtimeLabel: "再铸成 runtime 包",
      jumpLabel: "查看 commit 入口",
    };
  }

  return {
    laneTitle: values.hasDecision ? "Next move: follow the decision board" : "Next move: generate a clean compare result",
    laneSummary: values.hasDecision
      ? "Do not jump straight into watch creation. Use the decision board to decide whether this basket should stay in review, become a group, or stop at evidence."
      : "Submit at least two URLs first so the compare run can name the strongest row and the sharpest risk inside the basket.",
    proofTitle: values.hasRuntimePackage
      ? "Proof already has a runtime-backed package"
      : values.hasSavedPackage
        ? "Proof is saved locally and still reviewable"
        : "Proof is not stored yet",
    proofSummary: values.hasRuntimePackage
      ? "This compare run already has a runtime-backed proof package, so the next move can stay honest without pretending the basket is final."
      : values.hasSavedPackage
        ? "A local evidence package exists. Promote it only if the basket still stands up after review."
        : "Save the evidence package before you commit anything. That way the proof survives even if the basket needs one more review pass.",
    commitTitle: values.groupReadyCount >= 2 ? "This basket can move toward a compare-aware watch group" : "This basket is not ready to commit into a group yet",
    commitSummary: values.groupReadyCount >= 2
      ? `${values.groupReadyCount} rows are group-ready, so the group builder can become the final lane after the proof is preserved.`
      : "This still behaves like a review lane, not a commit lane. Keep weaker rows in evidence instead of freezing them into long-lived watch state.",
    saveLabel: "Save local proof first",
    runtimeLabel: "Then mint runtime proof",
    jumpLabel: "Open commit lane",
  };
}

function readComparePrefillFromUrl(): { rawUrls: string; used: boolean } {
  if (typeof window === "undefined") {
    return { rawUrls: defaultUrls, used: false };
  }

  const current = new URL(window.location.href);
  const batch = current.searchParams.get("dealwatch_submitted_urls");
  const single = current.searchParams.get("dealwatch_submitted_url");
  const raw = batch ?? single;
  if (!raw) {
    return { rawUrls: defaultUrls, used: false };
  }

  const values = raw
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    rawUrls: values.join("\n"),
    used: values.length > 0,
  };
}

export function ComparePage() {
  const { locale, t } = useI18n();
  const [{ rawUrls: initialRawUrls, used: usedPrefill }] = useState(() => readComparePrefillFromUrl());
  const compareSchema = useMemo(() => buildCompareSchema(), []);
  const createGroupSchema = useMemo(() => buildCreateGroupSchema(), []);
  const mutation = useComparePreview();
  const settingsQuery = useNotificationSettings();
  const createGroupMutation = useCreateWatchGroup();
  const createEvidencePackageMutation = useCreateCompareEvidencePackage();

  const [zipCode, setZipCode] = useState("98004");
  const [rawUrls, setRawUrls] = useState(initialRawUrls);
  const [error, setError] = useState("");
  const [groupError, setGroupError] = useState("");
  const [evidenceError, setEvidenceError] = useState("");
  const [evidenceNotice, setEvidenceNotice] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [draftPackageId, setDraftPackageId] = useState<string | null>(null);
  const [savedPackages, setSavedPackages] = useState<SavedCompareEvidencePackage[]>(() => loadSavedEvidencePackages());
  const [groupForm, setGroupForm] = useState<CompareGroupFormState>({
    title: "",
    zipCode: "98004",
    cadenceMinutes: 360,
    thresholdType: "effective_price_below",
    thresholdValue: 0,
    cooldownMinutes: 240,
    recipientEmail: "owner@example.com",
    notificationsEnabled: true,
  });
  const compareText = (
    key: string,
    fallback: DraftMessage,
    values?: Record<string, string | number>,
  ) => resolveCompareCopy(t, locale, key, fallback, values);

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }
    setGroupForm((current) => ({
      ...current,
      cooldownMinutes: settingsQuery.data.cooldownMinutes,
      recipientEmail:
        current.recipientEmail === "owner@example.com"
          ? settingsQuery.data.defaultRecipientEmail
          : current.recipientEmail,
      notificationsEnabled: settingsQuery.data.notificationsEnabled,
    }));
  }, [settingsQuery.data]);

  useEffect(() => {
    if (!usedPrefill || typeof window === "undefined") {
      return;
    }
    const current = new URL(window.location.href);
    current.searchParams.delete("dealwatch_submitted_url");
    current.searchParams.delete("dealwatch_submitted_urls");
    window.history.replaceState({}, "", `${current.pathname}${current.search}${current.hash}`);
  }, [usedPrefill]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(EVIDENCE_STORAGE_KEY, JSON.stringify(savedPackages));
    } catch {
      // Ignore local persistence failures and keep the in-memory review surface usable.
    }
  }, [savedPackages]);

  useEffect(() => {
    if (!selectedPackageId && savedPackages[0]) {
      setSelectedPackageId(savedPackages[0].id);
    }
  }, [savedPackages, selectedPackageId]);

  async function onSubmit(event: Event) {
    event.preventDefault();
    const parsed = compareSchema.safeParse({
      zipCode,
      submittedUrls: normalizeUrls(rawUrls),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "compare.notices.invalidCompare");
      return;
    }

    setError("");
    setGroupError("");
    setEvidenceError("");
    setEvidenceNotice("");
    setDraftPackageId(null);

    try {
      await mutation.mutateAsync(parsed.data);
      setGroupForm((current) => ({ ...current, zipCode: parsed.data.zipCode }));
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setError(mutationError.message);
        return;
      }
      setError("compare.notices.compareFailed");
    }
  }

  const result = mutation.data;
  const scoreByCandidate = useMemo(
    () => (result ? buildCandidateScoreIndex(result.matches) : {}),
    [result],
  );

  const comparisonByCandidateKey = useMemo(() => {
    const next = new Map<string, ComparePreviewComparison>();
    for (const item of result?.comparisons ?? []) {
      if (item.candidateKey) {
        next.set(item.candidateKey, item);
      }
    }
    return next;
  }, [result]);

  const successfulCandidates = useMemo<WatchGroupCandidateInput[]>(
    () =>
      (result?.comparisons ?? [])
        .filter((item) => item.fetchSucceeded && item.offer && item.storeKey && item.candidateKey)
        .map((item) => ({
          submittedUrl: item.submittedUrl,
          titleSnapshot: item.offer!.title,
          storeKey: item.storeKey!,
          candidateKey: item.candidateKey!,
          brandHint: item.brandHint,
          sizeHint: item.sizeHint,
          similarityScore: scoreByCandidate[item.candidateKey!] ?? 0,
        })),
    [result, scoreByCandidate],
  );
  const groupReadyCandidates = useMemo<WatchGroupCandidateInput[]>(
    () =>
      successfulCandidates.filter((candidate) =>
        comparisonByCandidateKey.get(candidate.candidateKey)?.supportContract?.canCreateWatchGroup,
      ),
    [comparisonByCandidateKey, successfulCandidates],
  );

  const decisionBoard = useMemo(
    () => (result ? buildDecisionBoard(locale, t, result, successfulCandidates, groupReadyCandidates) : null),
    [groupReadyCandidates, locale, result, successfulCandidates, t],
  );
  const compareAIExplain = result?.aiExplain ?? null;

  const selectedSavedPackage = useMemo(
    () => savedPackages.find((item) => item.id === selectedPackageId) ?? savedPackages[0] ?? null,
    [savedPackages, selectedPackageId],
  );
  const currentRuntimePackage = useMemo(() => {
    if (!draftPackageId) {
      return null;
    }
    return savedPackages.find((item) => item.id === draftPackageId)?.runtimeArtifact ?? null;
  }, [draftPackageId, savedPackages]);
  const executionRail = compareExecutionCopy(locale, {
    hasDecision: Boolean(decisionBoard),
    hasSavedPackage: savedPackages.length > 0 || Boolean(draftPackageId),
    hasRuntimePackage: Boolean(currentRuntimePackage),
    groupReadyCount: groupReadyCandidates.length,
  });

  useEffect(() => {
    if (!groupReadyCandidates.length) {
      return;
    }
    const bestObservedPrice = Math.min(
      ...groupReadyCandidates.map((candidate) => {
        const comparison = result?.comparisons.find((item) => item.candidateKey === candidate.candidateKey);
        return comparison?.offer?.price ?? Number.POSITIVE_INFINITY;
      }),
    );
    const nextTitle = defaultGroupTitle(groupReadyCandidates, locale, t);
    const nextThresholdValue = Number.isFinite(bestObservedPrice)
      ? Number(bestObservedPrice.toFixed(2))
      : undefined;
    setGroupForm((current) => {
      const resolvedTitle = current.title || nextTitle;
      const resolvedThresholdValue = nextThresholdValue ?? current.thresholdValue;
      if (
        current.title === resolvedTitle &&
        current.zipCode === zipCode &&
        current.thresholdValue === resolvedThresholdValue
      ) {
        return current;
      }
      return {
        ...current,
        title: resolvedTitle,
        zipCode,
        thresholdValue: resolvedThresholdValue,
      };
    });
  }, [groupReadyCandidates, locale, result, t, zipCode]);

  function updateGroupForm<K extends keyof CompareGroupFormState>(
    key: K,
    value: CompareGroupFormState[K],
  ) {
    setGroupForm((current) => ({ ...current, [key]: value }));
  }

  function useComparisonForTask(
    submittedUrl: string,
    normalizedUrl: string | undefined,
    offerTitle: string,
    storeKey: string | undefined,
    candidateKey: string | undefined,
    brandHint: string | undefined,
    sizeHint: string | undefined,
  ) {
    setWatchTaskDraft({
      submittedUrl,
      normalizedUrl: normalizedUrl ?? submittedUrl,
      title: offerTitle,
      storeKey: storeKey ?? "unknown",
      candidateKey: candidateKey ?? "unknown",
      brandHint,
      sizeHint,
      defaultRecipientEmail: settingsQuery.data?.defaultRecipientEmail ?? "owner@example.com",
      zipCode,
    });
    navigate("watch-new");
  }

  function upsertCurrentEvidencePackage(runtimeArtifact: CompareEvidencePackageArtifact | null) {
    if (!result || !decisionBoard) {
      return null;
    }

    const nextId = draftPackageId ?? buildSavedPackageId();
    const submittedUrls = normalizeUrls(rawUrls);
    const nextPackage = buildSavedEvidencePackage({
      id: nextId,
      result,
      zipCode,
      submittedUrls,
      decisionBoard,
      runtimeArtifact,
      locale,
      t,
    });

    setSavedPackages((current) => {
      const existing = current.find((item) => item.id === nextId);
      const merged: SavedCompareEvidencePackage = existing
        ? {
            ...existing,
            ...nextPackage,
            runtimeArtifact: runtimeArtifact ?? existing.runtimeArtifact,
          }
        : nextPackage;

      const withoutExisting = current.filter((item) => item.id !== nextId);
      return [merged, ...withoutExisting].slice(0, MAX_SAVED_EVIDENCE_PACKAGES);
    });

    setDraftPackageId(nextId);
    setSelectedPackageId(nextId);
    return nextPackage;
  }

  function handleSaveEvidencePackage() {
    if (!result || !decisionBoard) {
      return;
    }
    upsertCurrentEvidencePackage(null);
    setEvidenceError("");
    setEvidenceNotice("compare.notices.saveLocal");
  }

  async function handleCreateRuntimeEvidencePackage() {
    if (!result || !decisionBoard) {
      return;
    }
    setEvidenceError("");
    setEvidenceNotice("");
    try {
      const runtimeArtifact = await createEvidencePackageMutation.mutateAsync({
        submittedUrls: normalizeUrls(rawUrls),
        zipCode,
        compareResult: result,
      });
      upsertCurrentEvidencePackage(runtimeArtifact);
      setEvidenceNotice("compare.notices.runtimeCreated");
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setEvidenceError(mutationError.message);
        return;
      }
      setEvidenceError("compare.notices.runtimeFailed");
    }
  }

  async function handleCopyEvidenceSummary(payload: SavedCompareEvidencePackage | null) {
    if (!payload) {
      return;
    }
    try {
      await navigator.clipboard.writeText(buildShareSummary(locale, t, payload));
      setEvidenceError("");
      setEvidenceNotice("compare.notices.copiedSummary");
    } catch {
      setEvidenceError("compare.notices.clipboardFailed");
    }
  }

  async function onCreateGroup() {
    const parsed = createGroupSchema.safeParse(groupForm);
    if (!parsed.success) {
      setGroupError(parsed.error.issues[0]?.message ?? "compare.notices.invalidGroup");
      return;
    }
    if (groupReadyCandidates.length < 2) {
      setGroupError("compare.notices.needTwoCandidates");
      return;
    }
    setGroupError("");
    try {
      const group = await createGroupMutation.mutateAsync({
        ...parsed.data,
        title: parsed.data.title?.trim() || undefined,
        candidates: groupReadyCandidates,
      });
      navigate("watch-group-detail", group.id);
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setGroupError(mutationError.message);
        return;
      }
      setGroupError("compare.notices.createGroupFailed");
    }
  }

  const currentSharePayload = result && decisionBoard
    ? buildSavedEvidencePackage({
        id: draftPackageId ?? "current-compare-preview",
        result,
        zipCode,
        submittedUrls: normalizeUrls(rawUrls),
        decisionBoard,
        runtimeArtifact: null,
        locale,
        t,
      })
    : null;

  return (
    <section class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <div class="rounded-[1.75rem] border border-base-300 bg-base-100/95 p-6 shadow-card">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ember">{t("compare.route.eyebrow")}</p>
          <h2 class="mt-2 text-2xl font-semibold text-ink">{t("compare.route.title")}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">{t("compare.route.summary")}</p>

          <div class="mt-5 grid gap-3 md:grid-cols-3">
            <div class="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-4">
              <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">1</div>
              <div class="mt-2 text-base font-semibold text-ink">{t("compare.route.stepCompareTitle")}</div>
              <p class="mt-2 text-sm leading-6 text-slate-600">{t("compare.route.stepCompareSummary")}</p>
            </div>
            <div class="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-4">
              <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">2</div>
              <div class="mt-2 text-base font-semibold text-ink">{t("compare.route.stepDecisionTitle")}</div>
              <p class="mt-2 text-sm leading-6 text-slate-600">{t("compare.route.stepDecisionSummary")}</p>
            </div>
            <div class="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-4">
              <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">3</div>
              <div class="mt-2 text-base font-semibold text-ink">{t("compare.route.stepCommitTitle")}</div>
              <p class="mt-2 text-sm leading-6 text-slate-600">{t("compare.route.stepCommitSummary")}</p>
            </div>
          </div>
        </div>

        <div class="rounded-[1.75rem] border border-base-300 bg-base-100/95 p-6 shadow-card">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ember">{t("compare.form.eyebrow")}</p>
          <h2 class="mt-2 text-2xl font-semibold text-ink">
            {t("compare.form.title")}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {t("compare.form.summary")}
          </p>

          <form class="mt-6 grid gap-4" onSubmit={onSubmit}>
            <label class="form-control gap-2">
              <span class="label-text block font-medium">{t("compare.form.zipCode")}</span>
              <input
                class="input input-bordered"
                onInput={(event) => setZipCode((event.currentTarget as HTMLInputElement).value)}
                value={zipCode}
              />
            </label>

            <label class="form-control gap-2">
              <span class="label-text block font-medium">{t("compare.form.productUrls")}</span>
              <textarea
                class="textarea textarea-bordered min-h-48"
                onInput={(event) => setRawUrls((event.currentTarget as HTMLTextAreaElement).value)}
                value={rawUrls}
              />
              <span class="label-text-alt mt-2 text-slate-500">{t("compare.form.productUrlsHelp")}</span>
            </label>

            {error ? <div class="alert alert-error">{resolveUiMessage(error, t)}</div> : null}
            {mutation.isPending ? <div class="alert alert-info">{t("compare.form.loading")}</div> : null}

            <div class="pt-2">
              <button class="btn btn-primary" type="submit">{t("compare.form.submit")}</button>
            </div>
          </form>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[1.1fr,0.9fr,0.9fr]">
        <div class="rounded-[1.5rem] border border-ink/10 bg-base-100/95 p-5 shadow-card">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {locale === "zh-CN" ? "执行路线" : "Execution lane"}
          </p>
          <h3 class="mt-2 text-lg font-semibold text-ink">{executionRail.laneTitle}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">{executionRail.laneSummary}</p>
        </div>

        <div class="rounded-[1.5rem] border border-ember/20 bg-ember/5 p-5 shadow-card">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember">
            {locale === "zh-CN" ? "证明路线" : "Proof lane"}
          </p>
          <h3 class="mt-2 text-lg font-semibold text-ink">{executionRail.proofTitle}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-700">{executionRail.proofSummary}</p>
          {result ? (
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="btn btn-outline btn-sm" onClick={handleSaveEvidencePackage} type="button">
                {executionRail.saveLabel}
              </button>
              <button
                class="btn btn-primary btn-sm"
                disabled={createEvidencePackageMutation.isPending}
                onClick={handleCreateRuntimeEvidencePackage}
                type="button"
              >
                {executionRail.runtimeLabel}
              </button>
            </div>
          ) : null}
        </div>

        <div class="rounded-[1.5rem] border border-base-300 bg-base-100/95 p-5 shadow-card">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {locale === "zh-CN" ? "提交路线" : "Commit lane"}
          </p>
          <h3 class="mt-2 text-lg font-semibold text-ink">{executionRail.commitTitle}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">{executionRail.commitSummary}</p>
          {result ? (
            <div class="mt-4">
              <a class="btn btn-ghost btn-sm" href="#group-builder-panel">
                {executionRail.jumpLabel}
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {decisionBoard && result ? (
        <CompareDecisionSection
          compareAIExplain={compareAIExplain}
          recommendation={result.recommendation}
          compareText={compareText}
          copyCurrentEvidenceSummary={() => handleCopyEvidenceSummary(currentSharePayload)}
          createRuntimeEvidencePackage={handleCreateRuntimeEvidencePackage}
          createRuntimePending={createEvidencePackageMutation.isPending}
          decisionBoard={decisionBoard}
          evidenceError={evidenceError}
          evidenceNotice={evidenceNotice}
          locale={locale}
          result={result}
          saveEvidencePackage={handleSaveEvidencePackage}
          t={t}
        />
      ) : null}

      {result ? (
        <CandidateEvidenceSection
          compareText={compareText}
          comparisonByCandidateKey={comparisonByCandidateKey}
          groupReadyCandidates={groupReadyCandidates}
          locale={locale}
          result={result}
          scoreByCandidate={scoreByCandidate}
          t={t}
          useComparisonForTask={useComparisonForTask}
        />
      ) : null}

      {result ? (
        <div class="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <div id="group-builder-panel">
            <GroupBuilderSection
              compareText={compareText}
              comparisonByCandidateKey={comparisonByCandidateKey}
              createGroup={onCreateGroup}
              createGroupPending={createGroupMutation.isPending}
              groupError={groupError}
              groupForm={groupForm}
              groupReadyCandidates={groupReadyCandidates}
              locale={locale}
              t={t}
              updateGroupForm={updateGroupForm}
            />
          </div>
          <PairEvidenceSection
            compareText={compareText}
            comparisonByCandidateKey={comparisonByCandidateKey}
            locale={locale}
            matches={result.matches}
            t={t}
          />
        </div>
      ) : null}

      {savedPackages.length > 0 || result ? (
        <div id="saved-evidence-panel">
          <SavedEvidenceSection
            compareText={compareText}
            copySavedEvidenceSummary={handleCopyEvidenceSummary}
            locale={locale}
            savedPackages={savedPackages}
            selectedPackageId={selectedPackageId}
            selectedSavedPackage={selectedSavedPackage}
            selectSavedPackage={setSelectedPackageId}
            t={t}
          />
        </div>
      ) : null}
    </section>
  );
}
