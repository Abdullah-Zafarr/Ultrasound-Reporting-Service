
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function dump() {
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, email, role, organization_id')
  
  if (pError) {
    console.error('Error fetching profiles:', pError)
    return
  }

  const { data: orgs, error: oError } = await supabase
    .from('organizations')
    .select('id, name, code')
  
  if (oError) {
    console.error('Error fetching orgs:', oError)
    return
  }

  console.log('--- ORGANIZATIONS ---')
  orgs?.forEach(o => console.log(`${o.id} | ${o.name} | ${o.code}`))

  console.log('\n--- PROFILES ---')
  profiles?.forEach(p => console.log(`${p.id} | ${p.email} | ${p.role} | ${p.organization_id}`))
}

dump()
