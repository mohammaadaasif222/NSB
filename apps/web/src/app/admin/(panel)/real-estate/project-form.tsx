"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import type { AdminProject, ProjectDuplicate } from "@nsb/shared";
import { Modal } from "@/components/admin/dialog";
import { Button } from "@/components/admin/form";
import { useSessionUploads } from "@/components/admin/image-upload";
import { useToast } from "@/components/admin/toast";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { useSteppedForm } from "@/components/admin/use-stepped-form";
import { adminClient } from "@/lib/admin-client";
import { sitePath } from "@/lib/admin-links";
import { StepErrors, StepNav } from "@/components/admin/step-nav";
import { bodyOf, type Draft, draftEditors, draftOf, firstProblem, STEPS, stepOfError } from "./project-draft";
import { Preview } from "./project-preview";
import { AmenitiesStep } from "./steps/amenities-step";
import { BasicsStep } from "./steps/basics-step";
import { MediaStep } from "./steps/media-step";
import { NearbyStep } from "./steps/nearby-step";
import { OverviewStep } from "./steps/overview-step";
import { PricingStep } from "./steps/pricing-step";
import { PublishStep } from "./steps/publish-step";
import { SeoStep } from "./steps/seo-step";

/** "Already listed": checked while the name or location is typed. */
function useDuplicateCheck(rawName: string, area: string, id?: string) {
  const [found, setFound] = useState<ProjectDuplicate | null>(null);

  useEffect(() => {
    const name = rawName.trim();
    if (!name) return;
    const check = new AbortController();
    const timer = setTimeout(() => {
      const query = new URLSearchParams({ name, area });
      if (id) query.set("exclude", id);
      adminClient
        .get<{ duplicate: ProjectDuplicate | null }>(`/admin/projects/duplicate?${query}`, { signal: check.signal, on401: "throw" })
        .then((r) => setFound(r.duplicate))
        .catch(() => {
          if (!check.signal.aborted) setFound(null);
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      check.abort();
    };
  }, [rawName, area, id]);

  // A blank name has no duplicate, whatever the last check found.
  return rawName.trim() ? found : null;
}

/** Create (no `project`) or edit a real estate listing. These fields are the sections of the project page. */
export function ProjectForm({
  project,
  maxUploadBytes,
  planPrice,
  actions,
}: {
  project?: AdminProject;
  maxUploadBytes: number;
  /** The real estate plan price from Settings › Slot pricing. */
  planPrice: number;
  actions?: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [id, setId] = useState(project?.id);
  const { step, goTo, errors, setErrors, showErrors, stepsWithErrors } = useSteppedForm(STEPS.length, stepOfError);
  const [d, setDraft] = useState<Draft>(() => draftOf(project));
  const edit = useMemo(() => draftEditors(setDraft), []);
  const duplicate = useDuplicateCheck(d.name, d.area, id);
  const [saved, setSaved] = useState<AdminProject | null>(null);
  // Set once the project exists; it never changes after.
  const [savedSlug, setSavedSlug] = useState(project?.slug ?? null);

  async function save(event?: FormEvent) {
    event?.preventDefault();
    const problem = firstProblem(d, duplicate);
    if (problem) {
      goTo(problem[0]);
      toast.error(problem[1]);
      return;
    }
    const body = bodyOf(d);
    const result = await run(() => (id ? adminClient.patch<AdminProject>(`/admin/projects/${id}`, body) : adminClient.post<AdminProject>("/admin/projects", body)), {
      refresh: false,
    });
    if (!result.ok) {
      showErrors(result.error.fieldErrors);
      return;
    }
    setErrors({});
    if (!id) {
      // Further saves edit this project; the address bar follows without leaving the form.
      setId(result.data.id);
      window.history.replaceState(null, "", `/admin/real-estate/${result.data.id}`);
    }
    setSavedSlug(result.data.slug);
    setSaved(result.data);
  }

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>{project ? "Edit real estate listing" : "Add real estate listing"}</h2>
          <p>These fields are the sections of the project page. The preview updates as you type.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
          <Link href="/admin/real-estate" className="a-btn g">
            Cancel
          </Link>
          <Button onClick={() => void save()} pending={pending}>
            {pending ? "Saving…" : "Save listing"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:items-start">
        <form onSubmit={save} className="a-card flex min-w-0 flex-col gap-5" noValidate>
          <StepErrors errors={errors} shown={Object.entries(errors)} labels={STEPS} steps={stepsWithErrors} />
          <StepNav labels={STEPS} step={step} stepsWithErrors={stepsWithErrors} goTo={goTo} />

          {/* Every step stays mounted, so moving between steps keeps what was typed. */}
          <BasicsStep hidden={step !== 0} values={d} errors={errors} edit={edit} duplicate={duplicate} />
          <MediaStep hidden={step !== 1} values={d} errors={errors} edit={edit} trackUpload={trackUpload} maxUploadBytes={maxUploadBytes} />
          <OverviewStep hidden={step !== 2} values={d} errors={errors} edit={edit} />
          <PricingStep hidden={step !== 3} values={d} errors={errors} edit={edit} trackUpload={trackUpload} maxUploadBytes={maxUploadBytes} />
          <AmenitiesStep hidden={step !== 4} values={d} errors={errors} edit={edit} />
          <NearbyStep hidden={step !== 5} values={d} errors={errors} edit={edit} />
          <SeoStep hidden={step !== 6} values={d} errors={errors} edit={edit} savedSlug={savedSlug} />
          <PublishStep hidden={step !== 7} values={d} errors={errors} edit={edit} planPrice={planPrice} pending={pending} />

          <div className="flex justify-between gap-2 border-t border-zinc-200 pt-4">
            <Button variant="secondary" onClick={() => goTo(step - 1)} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 && (
              <Button variant="secondary" className="a-next" onClick={() => goTo(step + 1)}>
                Next
              </Button>
            )}
          </div>
        </form>

        <Preview draft={d} />
      </div>

      <Modal open={saved !== null} onClose={() => setSaved(null)} title="Listing saved" size="sm">
        <p className="text-sm text-zinc-600">
          {saved?.status === "live" ? "It is live on the site now." : "Saved as a draft. It will not show on the site until the status is Live."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => router.push("/admin/real-estate")}>
            Back to listings
          </Button>
          {saved?.status === "live" && (
            <a className="a-btn" href={sitePath(`/real-estate/${saved.slug}`)} target="_blank" rel="noreferrer">
              View on site
            </a>
          )}
        </div>
      </Modal>
    </>
  );
}
