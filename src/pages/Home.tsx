import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { HeroBanner } from '../components/home/HeroBanner';
import { HomeAside } from '../components/home/HomeAside';
import { LatestJobs } from '../components/home/LatestJobs';
import { NearbyJobs } from '../components/home/NearbyJobs';
import { RightRail } from '../components/home/RightRail';
import { AdCarousel } from '../components/ads/AdCarousel';
import { PostComposer } from '../components/feed/PostComposer';
import { PostCard } from '../components/feed/PostCard';

type FeedTab = 'forYou' | 'following' | 'recent';

export function Home() {
  const { t } = useTranslation();
  const { posts, followedCompanies, followedPeople, role } = usePlatform();
  const [tab, setTab] = useState<FeedTab>('forYou');

  const visible = posts.filter((p) => {
    if (tab === 'following') {
      return followedCompanies.includes(p.authorId) || followedPeople.includes(p.authorId);
    }
    return true;
  });

  const ordered =
  tab === 'recent' ?
  [...visible].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) :
  visible;

  const tabs: {key: FeedTab;label: string;}[] = [
  { key: 'forYou', label: t('feed.forYou') },
  { key: 'following', label: t('feed.following') },
  { key: 'recent', label: t('feed.recent') }];


  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <HeroBanner />

        <AdCarousel layout="banner" />

        {role === 'JOB_SEEKER' && <LatestJobs />}
        {role === 'JOB_SEEKER' && <NearbyJobs />}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1">
            <HomeAside />
          </div>

          <div className="order-1 min-w-0 space-y-4 lg:order-2">
            <PostComposer />

            <div
              role="tablist"
              aria-label={t('nav.home')}
              className="flex items-center gap-2 rounded-2xl border border-surface-border bg-white p-2 shadow-card">
              
              {tabs.map((tb) =>
              <button
                key={tb.key}
                role="tab"
                aria-selected={tab === tb.key}
                type="button"
                onClick={() => setTab(tb.key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-150 ${
                tab === tb.key ?
                'bg-brand-600 text-white' :
                'text-ink-500 hover:bg-surface-muted hover:text-ink-900'}`
                }>
                
                  {tb.label}
                </button>
              )}
            </div>

            {ordered.length === 0 ?
            <p className="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-ink-400 shadow-card">
                {t('feed.emptyFeed')}
              </p> :

            ordered.map((post) => <PostCard key={post.id} post={post} />)
            }
          </div>
        </div>
      </div>

      <div className="xl:order-last">
        <RightRail />
      </div>
    </div>);

}