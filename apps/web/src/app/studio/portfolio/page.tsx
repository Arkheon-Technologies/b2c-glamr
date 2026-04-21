"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import {
  createPortfolioUploadIntent,
  createPortfolioItem,
  fetchPortfolio,
  uploadFileToPresignedUrl,
  updatePortfolioPublishState,
  type PortfolioListItem,
  type PortfolioUploadVariant,
} from "@/lib/mvp-api";

function safeVerticalLabel(vertical: string | null) {
  if (!vertical) {
    return "General";
  }

  return vertical
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StudioPortfolioPage() {
  const [businessId, setBusinessId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceVertical, setServiceVertical] = useState("");
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [consentType, setConsentType] = useState("none");
  const [entries, setEntries] = useState<PortfolioListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function uploadPortfolioAsset(file: File, variant: PortfolioUploadVariant) {
    const contentType = file.type || "image/jpeg";

    const intent = await createPortfolioUploadIntent({
      business_id: businessId.trim(),
      file_name: file.name,
      content_type: contentType,
      variant,
    });

    return uploadFileToPresignedUrl(intent, file);
  }

  async function loadPortfolio() {
    if (!businessId.trim()) {
      setErrorMessage("Business ID is required to load portfolio items.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result = await fetchPortfolio({
        business_id: businessId.trim(),
        include_unpublished: true,
        limit: 100,
      });
      setEntries(result);
    } catch (error) {
      const fallback = "Unable to load portfolio items.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!businessId.trim() || !technicianId.trim()) {
      setErrorMessage("Business ID and Technician ID are required.");
      return;
    }

    if (!afterFile) {
      setErrorMessage("After image file is required.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);
    setIsUploading(true);

    try {
      const [afterAssetUrl, beforeAssetUrl] = await Promise.all([
        uploadPortfolioAsset(afterFile, "after"),
        beforeFile ? uploadPortfolioAsset(beforeFile, "before") : Promise.resolve(undefined),
      ]);

      await createPortfolioItem({
        business_id: businessId.trim(),
        technician_id: technicianId.trim(),
        service_name: serviceName.trim() || undefined,
        service_vertical: serviceVertical.trim() || undefined,
        before_url: beforeAssetUrl,
        after_url: afterAssetUrl,
        tags: tagInput
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
        consent_type: consentType.trim() || "none",
      });

      setServiceName("");
      setServiceVertical("");
      setBeforeFile(null);
      setAfterFile(null);
      setTagInput("");
      setConsentType("none");
      setSuccessMessage("Portfolio item created from uploaded media. Use publish to make it visible publicly.");

      await loadPortfolio();
    } catch (error) {
      const fallback = "Unable to upload media or create portfolio item.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  }

  async function handlePublishToggle(item: PortfolioListItem) {
    setActiveItemId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updatePortfolioPublishState(item.id, !item.is_published);
      setSuccessMessage(
        !item.is_published
          ? "Portfolio item published to public gallery."
          : "Portfolio item moved to draft.",
      );
      await loadPortfolio();
    } catch (error) {
      const fallback = "Unable to update publish status.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setActiveItemId(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low min-h-screen pt-28 pb-20 px-6 md:px-8">
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary-fixed font-bold mb-3">
                Studio Operations
              </p>
              <h1 className="font-headline font-black uppercase tracking-tighter text-primary text-4xl md:text-6xl leading-[0.92]">
                Portfolio Console
              </h1>
              <p className="font-body text-sm md:text-base text-on-surface-variant mt-3 max-w-2xl">
                Upload before and after photos, create draft entries, and manage publish state from one console.
              </p>
            </div>

            <Link
              href="/portfolio"
              className="font-label text-[10px] uppercase tracking-[0.2em] font-bold text-primary-fixed hover:underline"
            >
              Open public gallery →
            </Link>
          </div>

          {(errorMessage || successMessage) && (
            <div className="mb-6 space-y-3">
              {errorMessage && (
                <div className="border border-error/50 bg-error-container/20 px-4 py-3 text-xs font-label uppercase tracking-wider text-error">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="border border-primary-fixed/40 bg-primary-fixed/10 px-4 py-3 text-xs font-label uppercase tracking-wider text-primary-fixed">
                  {successMessage}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8">
            <aside className="bg-surface-container-lowest border border-outline-variant/20 p-6 md:p-8 h-fit">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={businessId}
                    onChange={(event) => setBusinessId(event.target.value)}
                    placeholder="Business ID"
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                  <input
                    value={technicianId}
                    onChange={(event) => setTechnicianId(event.target.value)}
                    placeholder="Technician ID"
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                </div>

                <input
                  value={serviceName}
                  onChange={(event) => setServiceName(event.target.value)}
                  placeholder="Service name (optional)"
                  className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                />

                <input
                  value={serviceVertical}
                  onChange={(event) => setServiceVertical(event.target.value)}
                  placeholder="Service vertical (e.g. lashes, hair)"
                  className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                />

                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold block mb-2">
                    After image (required)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    onChange={(event) => setAfterFile(event.target.files?.[0] ?? null)}
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                  {afterFile && (
                    <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Selected: {afterFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold block mb-2">
                    Before image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    onChange={(event) => setBeforeFile(event.target.files?.[0] ?? null)}
                    className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                  />
                  {beforeFile && (
                    <p className="mt-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Selected: {beforeFile.name}
                    </p>
                  )}
                </div>

                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Tags (comma-separated)"
                  className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                />

                <select
                  value={consentType}
                  onChange={(event) => setConsentType(event.target.value)}
                  className="w-full bg-transparent border border-outline-variant focus:border-primary-fixed focus:outline-none py-2.5 px-3 text-xs font-label tracking-wider"
                >
                  <option value="none">Consent: none</option>
                  <option value="verbal">Consent: verbal</option>
                  <option value="signed">Consent: signed</option>
                  <option value="digital">Consent: digital</option>
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-primary-fixed text-white font-label text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 hover:bg-primary transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : isSubmitting ? "Creating..." : "Upload & Create Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={loadPortfolio}
                    disabled={isLoading}
                    className="border border-outline-variant font-label text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 hover:border-primary-fixed transition-colors"
                  >
                    {isLoading ? "Loading..." : "Load Entries"}
                  </button>
                </div>
              </form>
            </aside>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-primary">
                  Portfolio Items
                </h2>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {entries.length} items
                </span>
              </div>

              {entries.length === 0 ? (
                <div className="border border-outline-variant/30 bg-surface-container-lowest p-8 text-center font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                  No items loaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/20 border border-outline-variant/20">
                  {entries.map((item) => (
                    <article key={item.id} className="bg-surface-container-lowest p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-headline text-lg font-black text-primary leading-tight">
                            {item.service_name || "Portfolio Item"}
                          </p>
                          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
                            {item.technician.display_name} • {safeVerticalLabel(item.service_vertical)}
                          </p>
                        </div>
                        <span
                          className={`font-label text-[10px] uppercase tracking-widest px-2.5 py-1 border ${
                            item.is_published
                              ? "border-primary-fixed text-primary-fixed"
                              : "border-outline-variant text-on-surface-variant"
                          }`}
                        >
                          {item.is_published ? "Published" : "Draft"}
                        </span>
                      </div>

                      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {item.view_count} views • {item.book_tap_count} taps
                      </p>

                      <div className="flex flex-wrap gap-2 min-h-7">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
                            className="text-[10px] font-label uppercase tracking-wider border border-outline-variant px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePublishToggle(item)}
                        disabled={activeItemId === item.id}
                        className="mt-1 border border-outline-variant font-label text-[10px] font-bold uppercase tracking-widest px-3 py-2 hover:border-primary-fixed hover:text-primary-fixed transition-colors disabled:opacity-50"
                      >
                        {activeItemId === item.id
                          ? "Saving..."
                          : item.is_published
                            ? "Move to Draft"
                            : "Publish"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
