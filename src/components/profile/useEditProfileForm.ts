import { useEffect, useState } from 'react';
import { usePlatform } from '../../contexts/PlatformContext';
import type { EducationItem, ExperienceItem, Person } from '../../types';

export interface ProfileDraft {
  name: string;
  headline: string;
  location: string;
  phone: string;
  about: string;
  photo: string | null;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  certifications: string[];
  languages: string[];
}

const tempId = () => `tmp-${Math.random().toString(36).slice(2, 10)}`;

function fromPerson(p: Person): ProfileDraft {
  return {
    name: p.name,
    headline: p.headline,
    location: p.location,
    phone: p.phone ?? '',
    about: p.about ?? '',
    photo: p.photo ?? null,
    experience: (p.experience ?? []).map((e) => ({ ...e })),
    education: (p.education ?? []).map((e) => ({ ...e })),
    skills: [...(p.skills ?? [])],
    certifications: [...(p.certifications ?? [])],
    languages: [...(p.languages ?? [])]
  };
}

/** Editable copy of the profile; nothing is saved until `save` succeeds. */
export function useEditProfileForm(open: boolean, onSaved: () => void) {
  const { currentUser, updateProfile } = usePlatform();
  const [draft, setDraft] = useState<ProfileDraft>(() => fromPerson(currentUser));

  useEffect(() => {
    if (open) setDraft(fromPerson(currentUser));
    // Reset only when the dialog opens, not on every store update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof ProfileDraft,>(key: K, value: ProfileDraft[K]) =>
  setDraft((d) => ({ ...d, [key]: value }));

  const addExperience = () =>
  set('experience', [
  ...draft.experience,
  { id: tempId(), role: '', organization: '', start: '', end: '', current: false, description: '' }]
  );
  const updateExperience = (id: string, patch: Partial<ExperienceItem>) =>
  set(
    'experience',
    draft.experience.map((e) => e.id === id ? { ...e, ...patch } : e)
  );
  const removeExperience = (id: string) => set('experience', draft.experience.filter((e) => e.id !== id));

  const addEducation = () =>
  set('education', [...draft.education, { id: tempId(), school: '', degree: '', startYear: '', endYear: '' }]);
  const updateEducation = (id: string, patch: Partial<EducationItem>) =>
  set(
    'education',
    draft.education.map((e) => e.id === id ? { ...e, ...patch } : e)
  );
  const removeEducation = (id: string) => set('education', draft.education.filter((e) => e.id !== id));

  const save = () => {
    const ok = updateProfile({
      ...draft,
      photo: draft.photo,
      // Temporary ids are replaced with permanent ones by the data layer.
      experience: draft.experience.map((e) => e.id.startsWith('tmp-') ? { ...e, id: '' } : e),
      education: draft.education.map((e) => e.id.startsWith('tmp-') ? { ...e, id: '' } : e)
    });
    if (ok) onSaved();
  };

  return {
    draft,
    set,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    save
  };
}