import { supabase } from '@/src/lib/supabase/client'
import type {
  ApplicationCategory,
  ApplicationStatus,
  ApplicationSummary,
  ApplicationType,
} from '@/src/types/application'

type ApplicationSummaryRow = {
  id: string
  name: string
  address: string | null
  reference: string
  status: ApplicationStatus
  type: ApplicationType
  category: ApplicationCategory
  updated_at: string
}

export const getApplications = async (): Promise<ApplicationSummary[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('id, name, address, reference, status, type, category, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw error

  return ((data ?? []) as ApplicationSummaryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    reference: row.reference,
    status: row.status,
    type: row.type,
    category: row.category,
    updatedAt: row.updated_at,
  }))
}
