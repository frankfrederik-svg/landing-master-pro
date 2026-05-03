import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://rvwzgemftprccgngixii.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2d3pnZW1mdHByY2NnbmdpeGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY5MDEzMiwiZXhwIjoyMDkzMjY2MTMyfQ.hHGVKeCAjwvahI0D2TnnYTAETMBXXjQJrDYHHdLLENY'
);

async function addAdmin() {
  console.log("Buscando TODOS os usuários...");
  const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (userError) {
    console.error("Erro ao buscar usuários:", userError);
    return;
  }

  for (const user of users.users) {
    console.log(`Dando permissão de admin para: ${user.email} (${user.id})`);
    const { error: insertError } = await supabaseAdmin
      .from("feirao_user_roles")
      .upsert(
        { user_id: user.id, role: 'admin' },
        { onConflict: 'user_id, role' }
      );
    if (insertError) {
      console.error(`Erro ao inserir permissão para ${user.email}:`, insertError);
    }
  }

  console.log("SUCESSO! Todos os usuários agora são administradores.");
}

addAdmin();
