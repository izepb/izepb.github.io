import { parse as parseYaml } from 'yaml';
import { parse as parseBib } from '@retorquere/bibtex-parser';
import cvRaw from '../data/cv.yaml?raw';
import talksRaw from '../data/talks.yaml?raw';
import bibRaw from '../data/publications.bib?raw';

export const ME = 'Buphamalai';

const visible = <T>(xs: T[] = []) => xs.filter((x: any) => !x?.hidden);

export function getCV() {
  const cv = parseYaml(cvRaw);
  for (const k of ['experience', 'education', 'awards', 'service', 'press']) cv[k] = visible(cv[k]);
  cv.experience = cv.experience.map((e: any) => ({
    ...e,
    roles: visible(e.roles),
    highlights: visible(e.highlights),
  }));
  return cv;
}

export type Talk = {
  event: string; location?: string; date: string; kind: 'poster' | 'talk' | 'attended';
  title?: string; award?: string; poster?: string; thumb?: string;
  links?: { label: string; url: string }[]; hidden?: boolean;
};

export function getTalks(): Talk[] {
  return visible<Talk>(parseYaml(talksRaw)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export type Author = { first: string; last: string; others?: boolean };
export type Pub = {
  key: string; type: 'journal' | 'chapter' | 'preprint' | 'other';
  title: string; authors: Author[]; venue: string; year: number;
  volume?: string; number?: string; pages?: string; doi?: string; note?: string;
  short?: string; links: { label: string; url: string }[]; tags: string[]; selected: boolean; bibtex: string;
};

const TYPE: Record<string, Pub['type']> = {
  article: 'journal', incollection: 'chapter', inbook: 'chapter', book: 'chapter',
  misc: 'preprint', unpublished: 'preprint', online: 'preprint',
};

export function getPubs(): Pub[] {
  const lib = parseBib(bibRaw, { sentenceCase: false });
  return lib.entries
    .map((e: any): Pub => {
      const f = e.fields;
      const authors: Author[] = (f.author ?? []).map((a: any) =>
        a.name === 'others' || a.lastName === 'others'
          ? { first: '', last: '…', others: true }
          : { first: a.firstName ?? '', last: a.lastName ?? a.name ?? '' });
      const links = (['pdf', 'code', 'poster', 'slides', 'url'] as const)
        .filter((k) => f[k]).map((k) => ({ label: k, url: String(f[k]) }));
      return {
        key: e.key,
        type: TYPE[e.type] ?? 'other',
        title: f.title,
        authors,
        venue: f.journal ?? f.booktitle ?? f.publisher ?? f.howpublished ?? '',
        year: Number(f.year),
        short: f.short, volume: f.volume, number: f.number, pages: f.pages, doi: f.doi, note: f.note,
        links,
        tags: String(f.tags ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        selected: String(f.selected ?? '') === 'true',
        bibtex: e.input.replace(/^\s*(tags|selected|short|pdf|code|poster|slides|note)\s*=.*\n/gm, ''),
      };
    })
    .sort((a, b) => b.year - a.year);
}

export const fmtRange = (s?: string, e?: string) => (s && e ? `${s} — ${e}` : s ?? e ?? '');
