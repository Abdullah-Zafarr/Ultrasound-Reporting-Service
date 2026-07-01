import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data, error } = await supabase.from('worksheets').select('*').limit(3);
  console.log("Error:", error);
  if (data && data.length > 0) {
    data.forEach(d => {
      console.log(`ID: ${d.id}`);
      console.log(`Has data column: ${'data' in d}`);
      console.log(`data value:`, d.data);
      console.log(`form_data value:`, d.form_data);
      console.log('---');
    });
  } else {
    console.log("No worksheets found");
  }
}

checkData();
