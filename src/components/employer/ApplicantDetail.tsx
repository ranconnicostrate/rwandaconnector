import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileTextIcon, MailIcon, MapPinIcon, MessageSquareIcon, PhoneIcon } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { usePlatform } from '../../contexts/PlatformContext';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { STATUS_KEY, STATUS_TONE } from '../../utils/status';
import type { Application, ApplicationStatus } from '../../types';

const QUESTION_ORDER = [
'apply.q1',
'apply.q2',
'apply.q3',
'apply.q4',
'apply.q7',
'apply.q5',
'apply.q6'];


/** Quick decisions, ordered the way a recruiter actually moves a candidate. */
const QUICK: {status: ApplicationStatus;tone: string;}[] = [
{ status: 'UNDER_REVIEW', tone: 'border-surface-border text-ink-700 hover:border-blue-200 hover:text-blue-700' },
{ status: 'SHORTLISTED', tone: 'border-surface-border text-ink-700 hover:border-violet-200 hover:text-violet-700' },
{ status: 'INTERVIEW', tone: 'border-surface-border text-ink-700 hover:border-amber-200 hover:text-amber-700' },
{ status: 'HIRED', tone: 'border-surface-border text-ink-700 hover:border-leaf-200 hover:text-leaf-600' },
{ status: 'REJECTED', tone: 'border-surface-border text-ink-500 hover:border-red-200 hover:text-red-600' }];


interface ApplicantDetailProps {
  application: Application | null;
  onClose: () => void;
}

export function ApplicantDetail({ application, onClose }: ApplicantDetailProps) {
  const { t, formatDate, formatSalary } = useTranslation();
  const { personById, jobById, setApplicationStatus, openConversation, openCv } = usePlatform();
  const navigate = useNavigate();

  if (!application) return null;

  const person = personById(application.applicantId);
  const job = jobById(application.jobId);

  const message = () => {
    const id = openConversation(application.applicantId);
    if (id) navigate('/messages');
  };

  const Field = ({ label, value }: {label: string;value: string;}) =>
  <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink-900">{value || '—'}</dd>
    </div>;


  return (
    <Modal open onClose={onClose} width="lg" title={t('employer.reviewApplication')}>
      <div className="space-y-5">
        <header className="flex flex-wrap items-start gap-4 border-b border-surface-border pb-5">
          <Avatar name={person?.name ?? ''} color={person?.avatar} photo={person?.photo} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-extrabold text-ink-900">{application.fullName}</h3>
            <p className="text-sm text-ink-700">{person?.headline}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" /> {application.location}
              </span>
              <span className="flex items-center gap-1.5">
                <MailIcon className="h-3.5 w-3.5" /> {application.email}
              </span>
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="h-3.5 w-3.5" /> {application.phone || '—'}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_TONE[application.status]}`}>
              {t(STATUS_KEY[application.status])}
            </span>
            <span className="font-mono text-[11px] text-ink-400">{application.id}</span>
          </div>
        </header>

        <dl className="grid gap-4 sm:grid-cols-3">
          <Field label={t('employer.appliedFor')} value={job?.title ?? '—'} />
          <Field label={t('applications.date')} value={formatDate(application.appliedAt)} />
          <Field label={t('apply.expectedSalary')} value={formatSalary(application.expectedSalary)} />
          <Field label={t('apply.education')} value={application.education} />
          <Field label={t('apply.experience')} value={application.experience} />
          <Field label={t('apply.skills')} value={application.skills} />
        </dl>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface-muted p-3">
          <FileTextIcon className="h-4 w-4 text-ink-400" />
          <span className="text-sm font-semibold text-ink-900">{application.cvName || '—'}</span>
          <span className="text-xs text-ink-400">{t('employer.cvOnFile')}</span>
          {application.cvRef &&
          <button
            type="button"
            onClick={async () => {
              const tab = window.open('', '_blank');
              try {
                const url = await openCv(application.applicantId, application.cvRef as string);
                if (tab) tab.location.href = url;
              } catch {
                tab?.close();
                window.alert(t('profile.cvUnavailable'));
              }
            }}
            className="ml-auto rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
            
              {t('profile.cvView')}
            </button>
          }
        </div>

        {application.coverLetter &&
        <section>
            <h4 className="mb-1.5 text-sm font-bold text-ink-900">{t('apply.coverLetter')}</h4>
            <p className="whitespace-pre-line rounded-xl border border-surface-border p-4 text-sm leading-relaxed text-ink-700">
              {application.coverLetter}
            </p>
          </section>
        }

        <section>
          <h4 className="mb-2 text-sm font-bold text-ink-900">{t('apply.questions')}</h4>
          <dl className="space-y-3">
            {QUESTION_ORDER.filter((key) => application.answers[key]).map((key) =>
            <div key={key} className="rounded-xl border border-surface-border p-4">
                <dt className="text-xs font-semibold text-ink-500">{t(key)}</dt>
                <dd className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-900">
                  {application.answers[key]}
                </dd>
              </div>
            )}
            {QUESTION_ORDER.every((key) => !application.answers[key]) &&
            <p className="text-sm text-ink-400">{t('employer.noAnswers')}</p>
            }
          </dl>
        </section>

        <footer className="space-y-3 border-t border-surface-border pt-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {t('employer.changeStatus')}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map(({ status, tone }) =>
              <button
                key={status}
                type="button"
                onClick={() => setApplicationStatus(application.id, status)}
                disabled={application.status === status}
                className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}>
                
                  {t(STATUS_KEY[status])}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {person &&
            <Link
              to={`/people/${person.id}`}
              className="rounded-lg border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors duration-150 hover:border-brand-200 hover:text-brand-700">
              
                {t('common.viewProfile')}
              </Link>
            }
            <button
              type="button"
              onClick={message}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
              
              <MessageSquareIcon className="h-4 w-4" /> {t('employer.messageCandidate')}
            </button>
          </div>
        </footer>
      </div>
    </Modal>);

}