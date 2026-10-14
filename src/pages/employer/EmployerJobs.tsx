import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2Icon, PlusIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Modal } from '../../components/ui/Modal';
import { TYPE_KEY } from '../../components/jobs/JobCard';
import {
  EMPTY_JOB_LOCATION,
  JobLocationField,
  locationFromJob,
  type JobLocationValue } from
'../../components/employer/JobLocationField';
import { jobCoords, workMode } from '../../utils/geo';
import type { EmploymentType, Job } from '../../types';

const EMPTY = {
  title: '',
  salaryMin: '',
  salaryMax: '',
  type: 'FULL_TIME' as EmploymentType,
  experience: '1-2 years',
  education: "Bachelor's degree",
  positions: '1',
  deadline: '',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  skills: '',
  announce: true
};

export function EmployerJobs() {
  const { t, formatSalary, formatDate } = useTranslation();
  const { jobs, currentUser, applications, toggleJobOpen, createJob, updateJob, error } = usePlatform();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [geo, setGeo] = useState<JobLocationValue>(EMPTY_JOB_LOCATION);
  const [editing, setEditing] = useState<Job | null>(null);
  const [editGeo, setEditGeo] = useState<JobLocationValue>(EMPTY_JOB_LOCATION);

  const openLocationEditor = (job: Job) => {
    setEditGeo(locationFromJob(job));
    setEditing(job);
  };
  const saveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (updateJob(editing.id, editGeo)) setEditing(null);
  };
  const [created, setCreated] = useState<string | null>(null);
  const myJobs = jobs.filter((j) => j.ownerId === currentUser.id);

  const field =
  'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-ink-700';

  const set = (key: keyof typeof EMPTY, value: string | boolean) =>
  setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = (value: string) =>
    value.
    split(/\n|,/).
    map((s) => s.trim()).
    filter(Boolean);

    const job = createJob(
      {
        title: form.title,
        ...geo,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || Number(form.salaryMin) || 0,
        type: form.type,
        experience: form.experience,
        education: form.education,
        positions: Math.max(1, Number(form.positions) || 1),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : '',
        description: form.description,
        responsibilities: list(form.responsibilities),
        requirements: list(form.requirements),
        benefits: list(form.benefits),
        skills: list(form.skills)
      },
      form.announce
    );

    // A rejected submission keeps the form open; the shell shows the reason.
    if (!job) return;
    setCreated(job.title);
    setForm(EMPTY);
    setGeo(EMPTY_JOB_LOCATION);
    setCreateOpen(false);
    window.setTimeout(() => setCreated(null), 5000);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-ink-900">{t('nav.jobs')}</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
          
          <PlusIcon className="h-4 w-4" /> {t('employer.createJob')}
        </button>
      </header>

      {created &&
      <p
        role="status"
        className="flex animate-fade-up items-center gap-2 rounded-xl border border-leaf-500/30 bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-600">
        
          <CheckCircle2Icon className="h-4 w-4" />
          {t('employer.jobPublished', { title: created })}
        </p>
      }

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-ink-400">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('jobs.jobTitle')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.employmentType')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.salary')}</th>
              <th className="px-5 py-3 font-semibold">{t('nav.applicants')}</th>
              <th className="px-5 py-3 font-semibold">{t('jobs.deadline')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.status')}</th>
              <th className="px-5 py-3 font-semibold">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {myJobs.map((job) =>
            <tr key={job.id} className="border-b border-surface-border last:border-b-0">
                <td className="px-5 py-3">
                  <Link to={`/jobs/${job.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                    {job.title}
                  </Link>
                  <p className="flex items-center gap-1.5 text-xs text-ink-400">
                    {workMode(job) === 'REMOTE' ? t('geo.remote') : job.location}
                    {workMode(job) !== 'REMOTE' &&
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    jobCoords(job) ? 'bg-leaf-50 text-leaf-600' : 'bg-amber-50 text-amber-700'}`
                    }>
                    
                        {jobCoords(job) ? t('geo.pinned') : t('geo.notPinnedShort')}
                      </span>
                  }
                  </p>
                </td>
                <td className="px-5 py-3 text-ink-700">{t(TYPE_KEY[job.type])}</td>
                <td className="px-5 py-3 text-ink-700">{formatSalary(job.salaryMin, job.salaryMax)}</td>
                <td className="px-5 py-3 tabular-nums text-ink-700">
                  {applications.filter((a) => a.jobId === job.id).length}
                </td>
                <td className="px-5 py-3 text-ink-500">{formatDate(job.deadline)}</td>
                <td className="px-5 py-3">
                  <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  job.open ? 'bg-leaf-50 text-leaf-600' : 'bg-surface-muted text-ink-500'}`
                  }>
                  
                    {job.open ? t('admin.active') : t('employer.closeJob')}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Link
                    to="/employer/applicants"
                    className="rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:text-brand-700">
                    
                      {t('employer.viewApplicants')}
                    </Link>
                    <button
                    type="button"
                    onClick={() => openLocationEditor(job)}
                    className="whitespace-nowrap rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:text-brand-700">
                    
                      {t('geo.editLocation')}
                    </button>
                    <button
                    type="button"
                    onClick={() => toggleJobOpen(job.id)}
                    className="rounded-lg border border-surface-border px-2.5 py-1.5 text-xs font-semibold text-ink-500 transition-colors duration-150 hover:border-red-200 hover:text-red-600">
                    
                      {job.open ? t('employer.closeJob') : t('admin.restore')}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title={t('employer.createJob')} width="lg">
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="nj-title">
                {t('jobs.jobTitle')}
              </label>
              <input
                id="nj-title"
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Software Developer"
                className={field} />
              
            </div>
            <div className="sm:col-span-2">
              <JobLocationField value={geo} onChange={setGeo} />
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-min">
                {t('jobs.salary')} — min (RWF)
              </label>
              <input
                id="nj-min"
                inputMode="numeric"
                required
                value={form.salaryMin}
                onChange={(e) => set('salaryMin', e.target.value.replace(/\D/g, ''))}
                placeholder="500000"
                className={field} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-max">
                {t('jobs.salary')} — max (RWF)
              </label>
              <input
                id="nj-max"
                inputMode="numeric"
                required
                value={form.salaryMax}
                onChange={(e) => set('salaryMax', e.target.value.replace(/\D/g, ''))}
                placeholder="800000"
                className={field} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-type">
                {t('jobs.employmentType')}
              </label>
              <select
                id="nj-type"
                value={form.type}
                onChange={(e) => set('type', e.target.value as EmploymentType)}
                className={field}>
                
                <option value="FULL_TIME">{t('jobs.fullTime')}</option>
                <option value="PART_TIME">{t('jobs.partTime')}</option>
                <option value="CONTRACT">{t('jobs.contract')}</option>
                <option value="INTERNSHIP">{t('jobs.internship')}</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-deadline">
                {t('jobs.deadline')}
              </label>
              <input
                id="nj-deadline"
                type="date"
                required
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
                className={field} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-exp">
                {t('jobs.experience')}
              </label>
              <input
                id="nj-exp"
                value={form.experience}
                onChange={(e) => set('experience', e.target.value)}
                className={field} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-edu">
                {t('jobs.education')}
              </label>
              <input
                id="nj-edu"
                value={form.education}
                onChange={(e) => set('education', e.target.value)}
                className={field} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-positions">
                {t('jobs.positions')}
              </label>
              <input
                id="nj-positions"
                inputMode="numeric"
                value={form.positions}
                onChange={(e) => set('positions', e.target.value.replace(/\D/g, ''))}
                className={field} />
              
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="nj-skills">
                {t('apply.skills')}
              </label>
              <input
                id="nj-skills"
                value={form.skills}
                onChange={(e) => set('skills', e.target.value)}
                placeholder="React, Node.js, SQL"
                className={field} />
              
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="nj-desc">
              {t('jobs.description')}
            </label>
            <textarea
              id="nj-desc"
              rows={4}
              required
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={`${field} resize-none`} />
            
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="nj-resp">
                {t('jobs.responsibilities')}
              </label>
              <textarea
                id="nj-resp"
                rows={3}
                value={form.responsibilities}
                onChange={(e) => set('responsibilities', e.target.value)}
                placeholder={t('employer.onePerLine')}
                className={`${field} resize-none`} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-req">
                {t('jobs.requirements')}
              </label>
              <textarea
                id="nj-req"
                rows={3}
                value={form.requirements}
                onChange={(e) => set('requirements', e.target.value)}
                placeholder={t('employer.onePerLine')}
                className={`${field} resize-none`} />
              
            </div>
            <div>
              <label className={labelCls} htmlFor="nj-ben">
                {t('jobs.benefits')}
              </label>
              <textarea
                id="nj-ben"
                rows={3}
                value={form.benefits}
                onChange={(e) => set('benefits', e.target.value)}
                placeholder={t('employer.onePerLine')}
                className={`${field} resize-none`} />
              
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-surface-border p-3">
            <input
              type="checkbox"
              checked={form.announce}
              onChange={(e) => set('announce', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-surface-border text-brand-600" />
            
            <span>
              <span className="block text-sm font-semibold text-ink-900">{t('employer.announceJob')}</span>
              <span className="block text-xs text-ink-500">{t('employer.announceJobHelp')}</span>
            </span>
          </label>

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700">
              
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
              {t('employer.publishJob')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={t('geo.editLocation')}
        subtitle={editing?.title}
        width="lg">
        
        <form className="space-y-4" onSubmit={saveLocation}>
          {editing && <JobLocationField value={editGeo} onChange={setEditGeo} />}
          {error &&
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
              {error}
            </p>
          }
          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700">
              
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
              {t('geo.saveLocation')}
            </button>
          </div>
        </form>
      </Modal>
    </div>);

}