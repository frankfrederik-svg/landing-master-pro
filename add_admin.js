import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://rvwzgemftprccgngixii.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2d3pnZW1mdHByY2NnbmdpeGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY5MDEzMiwiZXhwIjoyMDkzMjY2MTMyfQ.hHGVKeCAjwvahI0D2TnnYTAETMBXXjQJrDYHHdLLENY'
);

async function addAdmin() {
  console.log("Buscando usuário...");
  const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (userError) {
    console.error("Erro ao buscar usuários:", userError);
    return;
  }

  if (users.users.length === 0) {
    console.log("Nenhum usuário encontrado no banco.");
    return;
  }

  const user = users.users.find(u => u.email === 'frankfonteles@gmail.com') || users.users[0];
  console.log("Usuário encontrado:", user.email, user.id);

  console.log("Dando permissão de admin na tabela nova...");
  const { error: insertError } = await supabaseAdmin
    .from("feirao_user_roles")
    .upsert(
      { user_id: user.id, role: 'admin' },
      { onConflict: 'user_id, role' }
    );

  if (insertError) {
    console.error("Erro ao inserir permissão:", insertError);
  } else {
    console.log("SUCESSO! Permissão de admin concedida ao usuário:", user.email);
  }
}

addAdmin();
