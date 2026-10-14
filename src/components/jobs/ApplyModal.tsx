import React, { useState } from 'react';
import { CheckCircle2Icon, Loader2Icon, UploadCloudIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Modal } from '../ui/Modal';
import { UploadError } from '../../utils/upload';
import { AppError } from '../../services/db';
import type { Job } from '../../types';

const QUESTIONS = ['apply.q1', 'apply.q2', 'apply.q3', 'apply.q4', 'apply.q7'] as const;

export function ApplyModal({ job, open, onClose }: {job: Job;open: boolean;onClose: () => void;}) {
  const { t } = useTranslation();
  const { currentUser, applyToJob, uploadCv } = usePlatform();
  const firstSchool = currentUser.education?.[0];
  const latestRole = currentUser.experience?.find((e) => e.current) ?? currentUser.experience?.[0];

  // Prefilled from the profile so applying takes seconds.
  const [fullName, setFullName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone ?? '');
  const [location, setLocation] = useState(currentUser.location);
  const [education, setEducation] = useState(
    firstSchool ? [firstSchool.degree, firstSchool.school].filter(Boolean).join(', ') : currentUser.university ?? ''
  );
  const [experience, setExperience] = useState(
    latestRole ? `${latestRole.role}, ${latestRole.organization}` : currentUser.headline
  );
  const [skills, setSkills] = useState(currentUser.skills.join(', '));
  const [salary, setSalary] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState('');
  const [willing, setWilling] = useState('yes');
  // The application always uses the CV on the profile; uploading here updates it.
  const cv = currentUser.cvName ? { name: currentUser.cvName, ref: currentUser.cvRef } : null;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const field =
  'w-full rounded-lg border border-surface-border px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-ink-700';

  const pickCv = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      await uploadCv(file);
    } catch (e) {
      setUploadError(
        e instanceof UploadError ?
        e.reason === 'size' ?
        t('profile.cvErrorSize', { mb: e.limitMb ?? 5 }) :
        e.reason === 'content' ?
        t('profile.cvErrorContent') :
        t('profile.cvErrorType') :
        e instanceof AppError ?
        e.message :
        t('common.uploadFailed')
      );
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cv) {
      setUploadError(t('apply.cvRequired'));
      return;
    }
    const created = applyToJob(job.id, {
      fullName,
      email,
      phone,
      location,
      education,
      experience,
      skills,
      expectedSalary: Number(salary) || 0,
      cvName: cv.name,
      cvRef: cv.ref,
      coverLetter,
      answers: {
        ...answers,
        'apply.q5': startDate,
        'apply.q6': willing === 'yes' ? t('apply.yes') : t('apply.no')
      }
    });
    // A rejected application surfaces its reason through the shell's alert.
    if (created) setApplicationId(created.id);
  };

  const close = () => {
    setApplicationId(null);
    setUploadError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      width="lg"
      title={applicationId ? t('apply.success') : t('apply.title', { job: job.title })}>
      
      {applicationId ?
      <div className="py-6 text-center">
          <CheckCircle2Icon className="mx-auto h-12 w-12 text-leaf-500" />
          <p className="mt-4 text-sm text-ink-700">{t('apply.successBody', { id: applicationId })}</p>
          <button
          type="button"
          onClick={close}
          className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
          
            {t('common.close')}
          </button>
        </div> :

      <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="apply-name">
                {t('apply.fullName')}
              </label>
              <input
              id="apply-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="apply-email">
                {t('apply.email')}
              </label>
              <input
              id="apply-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="apply-phone">
                {t('apply.phone')}
              </label>
              <input
              id="apply-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+250 7.. ... ..."
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="apply-location">
                {t('apply.location')}
              </label>
              <input
              id="apply-location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="apply-education">
                {t('apply.education')}
              </label>
              <input
              id="apply-education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="apply-experience">
                {t('apply.experience')}
              </label>
              <input
              id="apply-experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="apply-skills">
                {t('apply.skills')}
              </label>
              <input
              id="apply-skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className={field} />
            
            </div>
            <div>
              <label className={labelCls} htmlFor="apply-salary">
                {t('apply.expectedSalary')}
              </label>
              <input
              id="apply-salary"
              inputMode="numeric"
              required
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/\D/g, ''))}
              placeholder="600000"
              className={field} />
            
            </div>
          </div>

          <div>
            <span className={labelCls}>{t('apply.cv')}</span>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-surface-border px-3 py-3 text-sm text-ink-500 transition-colors duration-150 hover:border-brand-400 hover:text-brand-700">
              {uploading ?
            <Loader2Icon className="h-5 w-5 animate-spin" /> :

            <UploadCloudIcon className="h-5 w-5" />
            }
              <span>{cv?.name || t('apply.uploadCv')}</span>
              <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              className="sr-only"
              onChange={(e) => pickCv(e.target.files?.[0])} />
            
            </label>
            <p className="mt-1 text-xs text-ink-400">{t('apply.cvHint')}</p>
          </div>

          <div>
            <label className={labelCls} htmlFor="apply-cover">
              {t('apply.coverLetter')}
            </label>
            <textarea
            id="apply-cover"
            rows={3}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className={`${field} resize-none`} />
          
          </div>

          <fieldset className="space-y-3 border-t border-surface-border pt-4">
            <legend className="mb-1 text-sm font-bold text-ink-900">{t('apply.questions')}</legend>
            {QUESTIONS.map((q) =>
          <div key={q}>
                <label className={labelCls} htmlFor={q}>
                  {t(q)}
                </label>
                <textarea
              id={q}
              rows={2}
              required
              value={answers[q] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
              className={`${field} resize-none`} />
            
              </div>
          )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="apply-start">
                  {t('apply.q5')}
                </label>
                <input
                id="apply-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={field} />
              
              </div>
              <div>
                <label className={labelCls} htmlFor="apply-willing">
                  {t('apply.q6')}
                </label>
                <select
                id="apply-willing"
                value={willing}
                onChange={(e) => setWilling(e.target.value)}
                className={field}>
                
                  <option value="yes">{t('apply.yes')}</option>
                  <option value="no">{t('apply.no')}</option>
                </select>
              </div>
            </div>
          </fieldset>

          {uploadError &&
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
              {uploadError}
            </p>
        }

          <div className="flex justify-end gap-2 border-t border-surface-border pt-4">
            <button
            type="button"
            onClick={close}
            className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200">
            
              {t('common.cancel')}
            </button>
            <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:bg-brand-200">
            
              {t('apply.submitApplication')}
            </button>
          </div>
        </form>
      }
    </Modal>);

}