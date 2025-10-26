// const { createClient } = require('@supabase/supabase-js');

// const supabase = createClient(
//   'https://uxyswnliamxlfmuupbjx.supabase.co',
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eXN3bmxpYW14bGZtdXVwYmp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MjM0ODQsImV4cCI6MjA2MDM5OTQ4NH0.KWhM3xtSuQXf1a0-ZkxVswsOXS9j2ee91wglhhcLd7E'
// );

// module.exports = supabase;

// const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config();

// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// module.exports = supabase;

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,  //URL of my Supabase project
  process.env.SUPABASE_SERVICE_ROLE_KEY //special API key with full admin privileges
);

module.exports = supabase;
