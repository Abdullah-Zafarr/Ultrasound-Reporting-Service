const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('worksheets').select('*').limit(1);
  if (error) {
    console.error("Query Error:", error);
  } else if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
    console.log("Sample Data:", JSON.stringify(data[0], null, 2));
  } else {
    console.log("No data found, but query succeeded.");
    // Attempt an insert to see what fails
    const { error: insertError } = await supabase.from('worksheets').insert({ study_id: '123e4567-e89b-12d3-a456-426614174000' });
    console.log("Insert Error:", insertError);
  }
}

check();
