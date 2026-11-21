"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";

// Shape of one recommended program card. Field names are placeholders until the
// agent returns structured recommendations.
export type ProgramRecommendationData = {
  id: string;
  name: string;
  summary: string;
  resourceType: string;
  resourceCategory: string;
  referralSteps: string[];
  programUrl: string;
  tablePageUrl: string;
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
};

export type ProgramRecommendationProps = {
  /** Position in the list, shown as 01, 02, ... */
  index: number;
  program: ProgramRecommendationData;
  open: boolean;
  onToggle: () => void;
};

export function ProgramRecommendation({
  index,
  program,
  open,
  onToggle,
}: ProgramRecommendationProps): ReactElement {
  const detailsId = `program-details-${program.id}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
      <div className="flex items-center gap-4 px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F3F3] text-[15px] text-[#444444]">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] text-[#202020]">{program.name}</p>
          <Link href={program.tablePageUrl} className="text-sm text-[#666666] hover:underline">
            Link to table page
          </Link>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={open ? `Hide ${program.name} details` : `Show ${program.name} details`}
          onClick={onToggle}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#F3F3F3] text-[#202020] transition-colors hover:bg-[#EBEBEB]"
        >
          <ChevronDown
            className={`size-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div id={detailsId} className="animate-fade-in border-t border-[#E5E5E5]">
          <div className="space-y-5 px-8 py-6">
            <section>
              <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-[#202020]">
                About this program
              </h3>
              <p className="mt-3 text-sm text-[#202020]">{program.summary}</p>
            </section>

            <p className="text-sm text-[#666666]">
              {program.resourceType} · {program.resourceCategory}
            </p>

            <section>
              <h3 className="text-sm font-medium text-[#202020]">Referral instructions</h3>
              <ol className="mt-1 list-inside list-decimal text-[13px] leading-relaxed text-[#666666]">
                {program.referralSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>

            <a
              href={program.programUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#666666] hover:underline"
            >
              Program link
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          <div className="space-y-1 bg-[#F3F3F3] px-8 py-4 text-sm text-[#666666]">
            <p>
              Contact <span className="ml-1 text-[#202020]">{program.contact.name}</span> ·{" "}
              {program.contact.role}
            </p>
            <p>
              {program.contact.email} · {program.contact.phone}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
