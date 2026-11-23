require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// 1. Middleware obrigatório antes das rotas para ler JSON
app.use(express.json());

// Configuração do cliente Supabase (certifique-se de ter essas variáveis no seu .env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Endpoint exato solicitado na ficha: POST /api/pacientes
app.post('/api/pacientes', async (req, res) => {
  const { nome, cpf, sintomas, prioridade } = req.body;

  // 3. Validação dos campos obrigatórios (nome, cpf, sintomas)
  if (!nome || !cpf || !sintomas) {
    return res.status(400).json({
      erro: 'Campos obrigatórios faltando. Por favor, envie nome, cpf e sintomas.'
    });
  }

  try {
    // 4. Inserção no Supabase usando .insert([ ... ]).select()
    const { data, error } = await supabase
      .from('pacientes')
      .insert([
        {
          nome,
          cpf,
          sintomas,
          // Se prioridade não for enviada, o banco assume 'Normal' automaticamente
          ...(prioridade && { prioridade })
        }
      ])
      .select();

    // Tratamento caso o Supabase retorne algum erro
    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    // 5. Retorno com status 201 (Created) e o registro criado (com id e created_at)
    return res.status(201).json(data[0]);

  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});