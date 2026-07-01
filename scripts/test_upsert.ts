import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUpsert() {
  const row = {
    study_id: 'd9b9b3e1-5b5c-4f1d-9c3f-7e9b4b9b9b9b', // fake UUID
    sonographer_id: 'd9b9b3e1-5b5c-4f1d-9c3f-7e9b4b9b9b9b', // fake UUID
    organization_id: 'd9b9b3e1-5b5c-4f1d-9c3f-7e9b4b9b9b9b', // fake UUID
    status: 'draft',
    form_data: { test: true },
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('worksheets').upsert(row, { onConflict: 'id' }).select('*').single();
  console.log("Error:", error);
  console.log("Data:", data);
}

testUpsert();
