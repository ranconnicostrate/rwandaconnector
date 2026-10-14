import type { Job } from '../types';

type JobGeo = Pick<
  Job,
  'workLocationType' | 'latitude' | 'longitude' | 'country' | 'province' | 'district' | 'sector' | 'streetAddress'>;


/**
 * Workplace pins for the bundled demo jobs, placed at real, named Rwandan
 * landmarks. Applied once to databases that predate job locations.
 */
export const DEMO_JOB_LOCATIONS: Record<string, JobGeo> = {
  j1: {
    workLocationType: 'ON_SITE',
    latitude: -1.95357,
    longitude: 30.09283,
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kimihurura',
    streetAddress: 'Kigali Heights, KG 7 Ave'
  },
  j2: {
    workLocationType: 'ON_SITE',
    latitude: -1.94412,
    longitude: 30.06188,
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Nyarugenge',
    streetAddress: 'Kigali City Tower, KN 2 St'
  },
  j3: {
    workLocationType: 'ON_SITE',
    latitude: -1.97716,
    longitude: 30.10342,
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Kicukiro',
    sector: 'Kicukiro',
    streetAddress: 'Kicukiro Centre, KK 15 Rd'
  },
  j4: {
    workLocationType: 'HYBRID',
    latitude: -1.94067,
    longitude: 30.08383,
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kacyiru',
    streetAddress: 'KG 9 Ave, Kacyiru'
  },
  j5: {
    workLocationType: 'ON_SITE',
    latitude: -1.94944,
    longitude: 30.12618,
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kimironko',
    streetAddress: 'KG 11 Ave, Kimironko'
  },
  j6: {
    workLocationType: 'ON_SITE',
    latitude: -2.59667,
    longitude: 29.73944,
    country: 'Rwanda',
    province: 'Southern Province',
    district: 'Huye',
    sector: 'Ngoma',
    streetAddress: 'Huye town centre'
  },
  j7: {
    workLocationType: 'ON_SITE',
    latitude: -1.95302,
    longitude: 30.06051,
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Nyarugenge',
    streetAddress: 'KN 3 Ave, Kiyovu'
  },
  j8: {
    workLocationType: 'ON_SITE',
    latitude: -1.95773,
    longitude: 30.11272,
    country: 'Rwanda',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Remera',
    streetAddress: 'KG 17 Ave, Remera'
  },
  j9: {
    workLocationType: 'ON_SITE',
    latitude: -1.49983,
    longitude: 29.63472,
    country: 'Rwanda',
    province: 'Northern Province',
    district: 'Musanze',
    sector: 'Muhoza',
    streetAddress: 'Musanze town centre'
  },
  j10: {
    workLocationType: 'REMOTE',
    country: 'Rwanda'
  }
};