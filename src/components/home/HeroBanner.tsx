import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { IMAGES } from '../../data/posts';

export function HeroBanner() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-navy-800">
      <img
        src={IMAGES.hero}
        alt=""
        aria-hidden="true"
        className="absolute inset-y-0 right-0 h-full w-full object-cover object-right" />
      
      <div className="absolute inset-0 bg-gradient-to-r from-navy-800 via-navy-800/90 to-navy-800/10" />

      <div className="relative flex min-h-[240px] flex-col justify-center gap-5 p-7 lg:max-w-[60%]">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {t('hero.title')}
            <br />
            {t('hero.titleLine2')} <span className="text-gold-400">{t('hero.highlight')}</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-100">{t('hero.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/jobs"
            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-700">
            
            {t('hero.findJobs')}
          </Link>
          <Link
            to="/network"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-navy-800 transition-colors duration-150 hover:bg-navy-50">
            
            {t('hero.buildNetwork')}
          </Link>
        </div>
      </div>

      <p className="pointer-events-none absolute right-7 top-6 hidden text-right font-script text-3xl leading-tight text-white/95 lg:block">
        {t('hero.motto')}
      </p>
    </section>);

}