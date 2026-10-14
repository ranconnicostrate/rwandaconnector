import { useEffect, useMemo, useState } from 'react';
import type { Advertisement, AdvertisementStatus, AdvertisementType } from '../../../types';

export type AdSort = 'startDesc' | 'startAsc' | 'endAsc' | 'updated';
export const PAGE_SIZE = 6;

/** Search, filter, sort and pagination for the admin advertisement table. */
export function useAdvertisementTable(ads: Advertisement[]) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<AdvertisementType | 'ALL'>('ALL');
  const [status, setStatus] = useState<AdvertisementStatus | 'ALL'>('ALL');
  const [sort, setSort] = useState<AdSort>('startDesc');
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const byStatus: Record<AdvertisementStatus | 'ALL', number> = {
      ALL: ads.length,
      DRAFT: 0,
      PUBLISHED: 0,
      UNPUBLISHED: 0,
      EXPIRED: 0
    };
    ads.forEach((a) => {
      byStatus[a.status] += 1;
    });
    return byStatus;
  }, [ads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = ads.
    filter((a) => type === 'ALL' || a.type === type).
    filter((a) => status === 'ALL' || a.status === status).
    filter((a) => !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    const compare: Record<AdSort, (a: Advertisement, b: Advertisement) => number> = {
      startDesc: (a, b) => b.startDate.localeCompare(a.startDate),
      startAsc: (a, b) => a.startDate.localeCompare(b.startDate),
      endAsc: (a, b) => a.endDate.localeCompare(b.endDate),
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt)
    };
    return [...rows].sort(compare[sort]);
  }, [ads, query, type, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Any filter change returns to the first page; deletions clamp the page.
  useEffect(() => setPage(1), [query, type, status, sort]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    query,
    setQuery,
    type,
    setType,
    status,
    setStatus,
    sort,
    setSort,
    page,
    setPage,
    pageCount,
    rows,
    total: filtered.length,
    counts,
    filtersActive: !!query || type !== 'ALL' || status !== 'ALL',
    clear: () => {
      setQuery('');
      setType('ALL');
      setStatus('ALL');
    }
  };
}