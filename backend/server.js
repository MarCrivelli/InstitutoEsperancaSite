const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// ============================================================================
// CONFIGURAÇÃO DE CORS - MUITO IMPORTANTE!
// ============================================================================
app.use(cors({
  origin: [
    'http://localhost:3000',  // React padrão
    'http://localhost:3001',  // Next.js padrão
    'http://localhost:5173',  // Vite padrão
    'http://localhost:4173',  // Vite preview
    'http://127.0.0.1:5173',  // Vite alternativo
    'http://127.0.0.1:3000',  // React alternativo
    'http://127.0.0.1:3001',  // Next.js alternativo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  force: true
}));

// ============================================================================
// MIDDLEWARES
// ============================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log de requisições para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

// ============================================================================
// ROTAS
// ============================================================================
const routes = require('./routers/routes');
app.use('/', routes);

// ============================================================================
// ROTA DE TESTE PARA VERIFICAR SE ESTÁ FUNCIONANDO
// ============================================================================
app.get('/teste-cors', (req, res) => {
  res.json({
    erro: false,
    mensagem: 'CORS está funcionando!',
    timestamp: new Date().toISOString(),
    origin: req.get('origin')
  });
});

// ============================================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================================================
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    erro: true,
    mensagem: 'Erro interno do servidor'
  });
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Backend: http://localhost:${PORT}`);
  console.log(`✅ CORS habilitado para:`);
  console.log(`   - http://localhost:3000`);
  console.log(`   - http://localhost:3001`);
  console.log(`   - http://localhost:5173`);
  console.log(`📋 Teste: http://localhost:${PORT}/teste`);
  console.log(`🔧 Teste CORS: http://localhost:${PORT}/teste-cors`);
});

module.exports = app;