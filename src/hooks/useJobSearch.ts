import { useMemo, useState } from 'react';
import { usePlatform } from '../contexts/PlatformContext';
import { useUserLocation } from '../contexts/LocationContext';
import { visibleJobs } from '../utils/jobs';
import { haversineKm, jobAddress, jobCoords, jobProvince, workMode, type LatLng } from '../utils/geo';
import type { EmploymentType, Job, WorkLocationType } from '../types';

export type SortKey = 'newest' | 'nearest' | 'farthest';

export interface JobFilterState {
  query: string;
  province: string;
  district: string;
  workMode: WorkLocationType | 'ALL';
  type: EmploymentType | 'ALL';
  experience: string;
  minSalary: number;
  radiusKm: number | null;
  sort: SortKey;
}

export interface JobResult {
  job: Job;
  at: LatLng | null;
  /** Straight-line km from the selected origin; null without origin or pin. */
  km: number | null;
}

const DEFAULTS: JobFilterState = {
  query: '',
  province: 'ALL',
  district: 'ALL',
  workMode: 'ALL',
  type: 'ALL',
  experience: 'ALL',
  minSalary: 0,
  radiusKm: null,
  sort: 'newest'
};

/** All job-search filters, combined with GPS distance, radius and sorting. */
export function useJobSearch(initial: Partial<JobFilterState> = {}) {
  const { jobs, companyById } = usePlatform();
  const { origin } = useUserLocation();
  const [filters, setFilters] = useState<JobFilterState>({ ...DEFAULTS, ...initial });

  const set = <K extends keyof JobFilterState,>(key: K, value: JobFilterState[K]) =>
  setFilters((f) => {
    const next = { ...f, [key]: value };
    // A district belongs to one province; changing province resets it.
    if (key === 'province') next.district = 'ALL';
    return next;
  });

  const experiences = useMemo(() => Array.from(new Set(jobs.map((j) => j.experience))).sort(), [jobs]);

  const { results, remoteCount, unpinnedCount } = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const radiusActive = !!origin && filters.radiusKm !== null;

    const list: JobResult[] = visibleJobs(jobs, companyById).
    filter((j) => {
      if (!q) return true;
      const haystack = [
      j.title,
      companyById(j.companyId)?.name ?? '',
      j.location,
      jobAddress(j),
      ...j.skills].

      join(' ').
      toLowerCase();
      return haystack.includes(q);
    }).
    filter((j) => filters.province === 'ALL' || jobProvince(j) === filters.province).
    filter((j) => filters.district === 'ALL' || j.district === filters.district).
    filter((j) => filters.workMode === 'ALL' || workMode(j) === filters.workMode).
    filter((j) => filters.type === 'ALL' || j.type === filters.type).
    filter((j) => filters.experience === 'ALL' || j.experience === filters.experience).
    filter((j) => j.salaryMax >= filters.minSalary).
    map((job) => {
      const at = jobCoords(job);
      return { job, at, km: origin && at ? haversineKm(origin, at) : null };
    })
    // Remote and unpinned jobs have no distance, so a radius excludes them.
    .filter((r) => !radiusActive || r.km !== null && r.km <= (filters.radiusKm as number));

    if (origin && filters.sort !== 'newest') {
      const dir = filters.sort === 'nearest' ? 1 : -1;
      list.sort((a, b) => {
        if (a.km === null && b.km === null) return 0;
        if (a.km === null) return 1;
        if (b.km === null) return -1;
        return (a.km - b.km) * dir;
      });
    }

    return {
      results: list,
      remoteCount: list.filter((r) => workMode(r.job) === 'REMOTE').length,
      unpinnedCount: list.filter((r) => workMode(r.job) !== 'REMOTE' && !r.at).length
    };
  }, [jobs, companyById, filters, origin]);

  return {
    filters,
    set,
    clear: () => setFilters(DEFAULTS),
    results,
    remoteCount,
    unpinnedCount,
    experiences,
    hasOrigin: !!origin
  };
}