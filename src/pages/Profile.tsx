import React, { useState } from 'react';
import { MapPinIcon, PencilIcon, PhoneIcon, PlusIcon, UploadCloudIcon, Loader2Icon } from 'lucide-react';
import { useTranslation } from '../i18n';
import { usePlatform } from '../contexts/PlatformContext';
import { Avatar } from '../components/ui/Avatar';
import { PostCard } from '../components/feed/PostCard';
import { CvCard } from '../components/profile/CvCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { useCvUpload } from '../hooks/useCvUpload';

type EditTab = 'basics' | 'experience' | 'education' | 'skills';

export function Profile() {
  const { t, option } = useTranslation();
  const { currentUser, posts, connections, followedCompanies } = usePlatform();
  const cv = useCvUpload();
  const [editTab, setEditTab] = useState<EditTab | null>(null);

  const myPosts = posts.filter((p) => p.authorId === currentUser.id || p.authorId === currentUser.companyId);
  const connected = Object.values(connections).filter((s) => s === 'CONNECTED').length;
  const experience = [...(currentUser.experience ?? [])].sort((a, b) =>
  a.current === b.current ? b.start.localeCompare(a.start) : a.current ? -1 : 1
  );
  const education = currentUser.education ?? [];
  const certifications = currentUser.certifications ?? [];
  const languages = currentUser.languages ?? [];

  const month = (key: string) =>
  new Intl.DateTimeFormat(option.locale, { month: 'short', year: 'numeric' }).format(new Date(`${key}-01T00:00:00`));

  const edit = (tab: EditTab) => setEditTab(tab);

  const Section = ({
    title,
    tab,
    children,
    empty,
    emptyText






  }: {title: string;tab: EditTab;children: React.ReactNode;empty: boolean;emptyText: string;}) =>
  <section className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink-900">{title}</h2>
        <button
        type="button"
        onClick={() => edit(tab)}
        aria-label={`${t('common.edit')} ${title}`}
        className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-surface-muted hover:text-ink-900">
        
          {empty ? <PlusIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
        </button>
      </div>
      {empty ?
    <button
      type="button"
      onClick={() => edit(tab)}
      className="w-full rounded-xl border border-dashed border-surface-border px-4 py-4 text-left text-sm text-ink-500 transition-colors duration-150 hover:border-brand-400 hover:text-brand-700">
      
          {emptyText}
        </button> :

    children
    }
    </section>;


  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-card">
        <div className="h-28 bg-navy-700" />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-5">
          <div className="-mt-10">
            <span className="inline-block rounded-full ring-4 ring-white">
              <Avatar name={currentUser.name} color={currentUser.avatar} photo={currentUser.photo} size="xl" />
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-2">
            <h1 className="text-2xl font-extrabold text-ink-900">{currentUser.name}</h1>
            <p className="text-sm text-ink-700">{currentUser.headline}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" /> {currentUser.location}, Rwanda
              </span>
              {currentUser.phone &&
              <span className="flex items-center gap-1.5">
                  <PhoneIcon className="h-3.5 w-3.5" /> {currentUser.phone}
                </span>
              }
              <span>
                {connected} {t('network.connections')} · {followedCompanies.length} {t('common.following')}
              </span>
            </p>
          </div>
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={cv.open}
              disabled={cv.busy}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700 disabled:opacity-60">
              
              {cv.busy ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <UploadCloudIcon className="h-4 w-4" />}
              {currentUser.cvName ? t('profile.cvReplace') : t('profile.uploadCv')}
            </button>
            <button
              type="button"
              onClick={() => edit('basics')}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
              <PencilIcon className="h-4 w-4" /> {t('profile.editProfile')}
            </button>
          </div>
        </div>
      </header>

      {/* One hidden picker shared by the header button and the CV card. */}
      <input
        ref={cv.inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        tabIndex={-1}
        aria-label={t('profile.uploadCv')}
        onChange={(e) => cv.upload(e.target.files?.[0])} />
      

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <Section title={t('profile.about')} tab="basics" empty={!currentUser.about} emptyText={t('profile.emptyAbout')}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{currentUser.about}</p>
          </Section>

          <Section title={t('profile.experience')} tab="experience" empty={experience.length === 0} emptyText={t('profile.emptyExperience')}>
            <ol className="space-y-5">
              {experience.map((item) =>
              <li key={item.id} className="flex gap-4">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.current ? 'bg-brand-600' : 'bg-ink-300'}`} />
                  <div>
                    <p className="text-sm font-bold text-ink-900">{item.role}</p>
                    <p className="text-xs text-ink-500">
                      {item.organization} · {month(item.start)} — {item.current ? t('profile.present') : month(item.end)}
                    </p>
                    {item.description && <p className="mt-1 text-sm leading-relaxed text-ink-700">{item.description}</p>}
                  </div>
                </li>
              )}
            </ol>
          </Section>

          <Section title={t('profile.educationSection')} tab="education" empty={education.length === 0} emptyText={t('profile.emptyEducation')}>
            <ul className="space-y-3">
              {education.map((item) =>
              <li key={item.id}>
                  <p className="text-sm font-bold text-ink-900">{item.school}</p>
                  <p className="text-xs text-ink-500">
                    {[item.degree, [item.startYear, item.endYear].filter(Boolean).join(' — ')].filter(Boolean).join(' · ')}
                  </p>
                </li>
              )}
            </ul>
          </Section>

          <section>
            <h2 className="mb-3 text-sm font-bold text-ink-900">{t('profile.activity')}</h2>
            <div className="space-y-4">
              {myPosts.map((post) =>
              <PostCard key={post.id} post={post} />
              )}
              {myPosts.length === 0 &&
              <p className="rounded-2xl border border-surface-border bg-white p-8 text-center text-sm text-ink-400 shadow-card">
                  {t('feed.emptyFeed')}
                </p>
              }
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <CvCard cv={cv} />

          <Section title={t('profile.skills')} tab="skills" empty={currentUser.skills.length === 0} emptyText={t('profile.emptySkills')}>
            <ul className="flex flex-wrap gap-2">
              {currentUser.skills.map((skill) =>
              <li key={skill} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  {skill}
                </li>
              )}
            </ul>
          </Section>

          <Section title={t('profile.certifications')} tab="skills" empty={certifications.length === 0} emptyText={t('profile.emptyCertifications')}>
            <ul className="space-y-2 text-sm text-ink-700">
              {certifications.map((c) =>
              <li key={c}>{c}</li>
              )}
            </ul>
          </Section>

          <Section title={t('profile.languages')} tab="skills" empty={languages.length === 0} emptyText={t('profile.emptyLanguages')}>
            <ul className="flex flex-wrap gap-2 text-sm text-ink-700">
              {languages.map((l) =>
              <li key={l} className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-700">
                  {l}
                </li>
              )}
            </ul>
          </Section>
        </aside>
      </div>

      <EditProfileModal open={editTab !== null} initialTab={editTab ?? 'basics'} onClose={() => setEditTab(null)} />
    </div>);

}