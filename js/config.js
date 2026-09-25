// Navigation + workspace registry. Add a workspace here and it appears on
// the dashboard, in the dock list, and gets a route at #/<id>.

export const overview = { id: 'overview', label: 'Overview', icon: 'overview' };

export const workspaces = [
  {
    id: 'job-matches',
    label: 'Job Matches',
    icon: 'briefcase',
    description: 'Roles matched to your profiles, ranked by fit.',
    empty: {
      title: 'No matches yet',
      body: 'Add a profile and matching roles will start showing up here.',
      cta: 'Find matches',
    },
  },
  {
    id: 'my-profiles',
    label: 'My Profiles',
    icon: 'user',
    description: 'The resumes and profiles you apply with.',
    empty: {
      title: 'No profiles yet',
      body: 'Upload a resume or build a profile from scratch.',
      cta: 'Create profile',
    },
  },
  {
    id: 'answer-studio',
    label: 'Answer Studio',
    icon: 'pen',
    description: 'Draft and save answers to common application questions.',
    empty: {
      title: 'No saved answers',
      body: 'Paste an application question to draft your first answer.',
      cta: 'New answer',
    },
  },
  {
    id: 'cover-letter',
    label: 'Cover Letter',
    icon: 'file',
    description: 'Cover letters tailored to each application.',
    empty: {
      title: 'No cover letters yet',
      body: 'Pick a job match to generate a tailored letter.',
      cta: 'Write cover letter',
    },
  },
];

// Plans, as the landing page prices them (demo: features/pricing, where they
// are "Free" and "Premium"). `id` is what services.js stores as user.plan.
export const plans = [
  {
    id: 'standard',
    name: 'Standard',
    price: '$0',
    period: 'forever',
    features: ['5 autofill applications a day', '3 standard AI credits for written answers', 'Local data storage'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$5',
    period: 'per month',
    features: ['Unlimited autofill applications', 'Unlimited high-quality AI answers', 'Encrypted cloud backup & sync'],
  },
];
