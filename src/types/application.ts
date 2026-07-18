export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'approved'
  | 'rejected'

export type ApplicationType =
  | 'full-plans'
  | 'building-notice'
  | 'regularisation'
  | 'demolition-notice'

export type ApplicationCategory = 'domestic' | 'commercial' | 'other'

export type ApplicationSummary = {
  id: string
  name: string
  address: string | null
  reference: string
  status: ApplicationStatus
  type: ApplicationType
  category: ApplicationCategory
  updatedAt: string
}

/** The detail page also needs the locked-site fields the list omits. */
export type ApplicationDetail = ApplicationSummary & {
  postcode: string | null
  easting: string | null
  northing: string | null
}

export type ApplicationDocument = {
  id: string
  fileName: string
  sizeBytes: number
  contentType: string | null
  createdAt: string
  storagePath: string
}

/** Short status label, shared by the dashboard and the detail page so the
    two never diverge. */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  review: 'Under review',
  approved: 'Approved',
  rejected: 'Changes requested',
}

export const statusLabel = (status: ApplicationStatus) => STATUS_LABELS[status]

/* Placeholder lists per the wizard design — swap for the real
   building-control types/categories when they're confirmed. */
export const APPLICATION_TYPES: {
  id: ApplicationType
  title: string
  description: string
}[] = [
  {
    id: 'full-plans',
    title: 'Full Plans',
    description: 'Submit detailed drawings for full approval before work starts.',
  },
  {
    id: 'building-notice',
    title: 'Building Notice',
    description: 'Start work quickly without detailed plans — for simpler projects.',
  },
  {
    id: 'regularisation',
    title: 'Regularisation',
    description: 'Get retrospective approval for work already carried out.',
  },
  {
    id: 'demolition-notice',
    title: 'Demolition Notice',
    description: 'Tell us before you demolish a building or structure.',
  },
]

export const APPLICATION_CATEGORIES: {
  id: ApplicationCategory
  name: string
  sub: string
}[] = [
  { id: 'domestic', name: 'Domestic', sub: 'Homes & households' },
  { id: 'commercial', name: 'Commercial', sub: 'Business premises' },
  { id: 'other', name: 'Other', sub: 'Something else' },
]

export const APPLICATION_NAME_MAX = 60

export type WizardDraft = {
  name: string
  site: {
    postcode: string
    found: boolean
    address: string
    easting: string
    northing: string
  }
  type: {
    kind: ApplicationType | ''
    category: ApplicationCategory | ''
  }
}

export const EMPTY_WIZARD_DRAFT: WizardDraft = {
  name: '',
  site: { postcode: '', found: false, address: '', easting: '', northing: '' },
  type: { kind: '', category: '' },
}

export type CreateApplicationInput = {
  name: string
  postcode: string | null
  address: string | null
  easting: string | null
  northing: string | null
  type: ApplicationType
  category: ApplicationCategory
}

export type UpdateApplicationInput = {
  name: string
  type: ApplicationType
  category: ApplicationCategory
}
