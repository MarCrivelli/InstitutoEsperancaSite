const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuarios');
require('dotenv').config();

// ═══════════════════════════════════════════════════════════════
// 🛡️ MIDDLEWARE BASE DE VERIFICAÇÃO DE TOKEN
// ═══════════════════════════════════════════════════════════════
const verificarToken = async (req, res, next) => {
    try {
        // 🔍 DEBUG: Verificar variáveis de ambiente
        console.log('🔍 [DEBUG] BYPASS_AUTH =', process.env.BYPASS_AUTH);
        console.log('🔍 [DEBUG] Tipo:', typeof process.env.BYPASS_AUTH);
        console.log('🔍 [DEBUG] Comparação:', process.env.BYPASS_AUTH === 'true');
        
        // 🚨 TEMPORÁRIO - BYPASS PARA DESENVOLVIMENTO
        if (process.env.BYPASS_AUTH === 'true') {
            console.log('⚠️ [DEV] BYPASS DE AUTENTICAÇÃO ATIVADO');
            
            // Buscar o primeiro administrador ativo do banco
            const adminReal = await Usuario.findOne({
                where: {
                    nivelDeAcesso: 'administrador',
                    ativo: true
                },
                attributes: ['id', 'nome', 'email', 'nivelDeAcesso']
            });

            if (adminReal) {
                req.user = {
                    id: adminReal.id,
                    nome: adminReal.nome,
                    email: adminReal.email,
                    nivelDeAcesso: adminReal.nivelDeAcesso
                };
                console.log(`🔓 [DEV] Autenticado automaticamente como: ${adminReal.email}`);
                return next();
            } else {
                console.log('⚠️ [DEV] Nenhum administrador encontrado no banco');
                // Fallback para usuário mock se não encontrar admin
                req.user = {
                    id: 999,
                    nome: 'Dev User',
                    email: 'dev@test.com',
                    nivelDeAcesso: 'administrador'
                };
                console.log('🔓 [DEV] Usando usuário mock');
                return next();
            }
        }

        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                erro: true,
                mensagem: 'Token de acesso requerido'
            });
        }

        const token = authorization.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                erro: true,
                mensagem: 'Token de acesso inválido'
            });
        }

        const decoded = jwt.verify(token, process.env.SEGREDO || 'chave_secreta_desenvolvimento');

        // Verificar se o usuário ainda existe e está ativo
        const usuario = await Usuario.findOne({
            where: {
                id: decoded.id,
                ativo: true
            },
            attributes: ['id', 'nome', 'email', 'nivelDeAcesso', 'ativo']
        });

        if (!usuario) {
            return res.status(401).json({
                erro: true,
                mensagem: 'Usuário não encontrado ou inativo'
            });
        }

        // Adicionar dados do usuário à requisição
        req.user = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            nivelDeAcesso: usuario.nivelDeAcesso
        };

        console.log(`🔐 Usuário autenticado: ${usuario.email} (${usuario.nivelDeAcesso})`);
        next();

    } catch (error) {
        console.error('❌ Erro na verificação do token:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                erro: true,
                mensagem: 'Token expirado'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                erro: true,
                mensagem: 'Token inválido'
            });
        }

        return res.status(500).json({
            erro: true,
            mensagem: 'Erro interno do servidor'
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// 🔒 MIDDLEWARES DE AUTORIZAÇÃO POR NÍVEL
// ═══════════════════════════════════════════════════════════════

// APENAS ADMINISTRADOR
const apenasAdministrador = (req, res, next) => {
    if (req.user.nivelDeAcesso !== 'administrador') {
        return res.status(403).json({
            erro: true,
            mensagem: 'Acesso negado. Apenas administradores têm acesso a esta funcionalidade.'
        });
    }
    next();
};

// ADMINISTRADOR OU SUB-ADMINISTRADOR
const administradorOuSub = (req, res, next) => {
    if (!['administrador', 'subAdministrador'].includes(req.user.nivelDeAcesso)) {
        return res.status(403).json({
            erro: true,
            mensagem: 'Acesso negado. Funcionalidade restrita a administradores e sub-administradores.'
        });
    }
    next();
};

// CONTRIBUINTE OU SUPERIOR 
const contribuinteOuSuperior = (req, res, next) => {
    const niveisPermitidos = ['contribuinte', 'subAdministrador', 'administrador'];
    
    if (!niveisPermitidos.includes(req.user.nivelDeAcesso)) {
        return res.status(403).json({
            erro: true,
            mensagem: 'Acesso negado. Você precisa ter nível de contribuinte ou superior.'
        });
    }
    
    console.log(`✅ Usuário ${req.user.email} autorizado com nível: ${req.user.nivelDeAcesso}`);
    next();
};

// ═══════════════════════════════════════════════════════════════
// 🔐 MIDDLEWARE PARA VERIFICAR PRÓPRIO USUÁRIO OU ADMIN
// ═══════════════════════════════════════════════════════════════
const verificarProprioUsuarioOuAdmin = async (req, res, next) => {
    try {
        const idRequisicao = parseInt(req.params.id);
        const idUsuario = req.user.id;
        const nivelAcesso = req.user.nivelDeAcesso;

        // Administrador pode acessar qualquer usuário
        if (nivelAcesso === 'administrador') {
            console.log(`🔓 Admin ${req.user.email} acessando usuário ${idRequisicao}`);
            return next();
        }

        // Sub-administrador pode editar usuarios e contribuintes, mas não outros admins/sub-admins
        if (nivelAcesso === 'subAdministrador') {
            if (idRequisicao === idUsuario) {
                // Pode editar próprio perfil
                console.log(`🔓 Sub-admin ${req.user.email} editando próprio perfil`);
                return next();
            }

            // Verificar nível do usuário alvo
            const usuarioAlvo = await Usuario.findOne({
                where: { id: idRequisicao },
                attributes: ['nivelDeAcesso']
            });

            if (!usuarioAlvo) {
                return res.status(404).json({
                    erro: true,
                    mensagem: 'Usuário não encontrado'
                });
            }

            // Sub-admin não pode editar outros admins ou sub-admins
            if (['administrador', 'subAdministrador'].includes(usuarioAlvo.nivelDeAcesso)) {
                return res.status(403).json({
                    erro: true,
                    mensagem: 'Sub-administradores não podem editar outros administradores ou sub-administradores'
                });
            }

            console.log(`🔓 Sub-admin ${req.user.email} editando usuário ${idRequisicao} (${usuarioAlvo.nivelDeAcesso})`);
            return next();
        }

        // Contribuinte pode apenas editar próprio perfil
        if (nivelAcesso === 'contribuinte') {
            if (idRequisicao !== idUsuario) {
                return res.status(403).json({
                    erro: true,
                    mensagem: 'Contribuintes podem apenas editar seu próprio perfil'
                });
            }
            console.log(`🔓 Contribuinte ${req.user.email} editando próprio perfil`);
            return next();
        }

        // Usuário comum pode apenas editar próprio perfil
        if (nivelAcesso === 'usuario') {
            if (idRequisicao !== idUsuario) {
                return res.status(403).json({
                    erro: true,
                    mensagem: 'Você pode apenas editar seu próprio perfil'
                });
            }
            console.log(`🔓 Usuário ${req.user.email} editando próprio perfil`);
            return next();
        }

        // Nível de acesso não reconhecido
        return res.status(403).json({
            erro: true,
            mensagem: 'Nível de acesso não reconhecido'
        });

    } catch (error) {
        console.error('❌ Erro na verificação de acesso:', error);
        return res.status(500).json({
            erro: true,
            mensagem: 'Erro interno do servidor'
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// 🔍 MIDDLEWARE PARA DEBUG DE PERMISSÕES
// ═══════════════════════════════════════════════════════════════
const debugPermissoes = (req, res, next) => {
    if (req.user) {
        console.log(`🔍 [DEBUG] Usuário: ${req.user.email} | Nível: ${req.user.nivelDeAcesso} | Rota: ${req.method} ${req.path}`);
    }
    next();
};

// ═══════════════════════════════════════════════════════════════
// 🎯 HELPER FUNCTIONS PARA VERIFICAR NÍVEIS
// ═══════════════════════════════════════════════════════════════
const verificarNivel = (nivelRequerido) => {
    const hierarquia = {
        'usuario': 1,
        'contribuinte': 2,
        'subAdministrador': 3,
        'administrador': 4
    };

    return (req, res, next) => {
        const nivelUsuario = hierarquia[req.user.nivelDeAcesso] || 0;
        const nivelMinimo = hierarquia[nivelRequerido] || 0;

        if (nivelUsuario < nivelMinimo) {
            return res.status(403).json({
                erro: true,
                mensagem: `Acesso negado. Nível mínimo requerido: ${nivelRequerido}`
            });
        }

        console.log(`✅ Acesso autorizado: ${req.user.email} (${req.user.nivelDeAcesso}) >= ${nivelRequerido}`);
        next();
    };
};

// ═══════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════
module.exports = {
    verificarToken,
    apenasAdministrador,
    administradorOuSub,
    contribuinteOuSuperior,
    verificarProprioUsuarioOuAdmin,
    debugPermissoes,
    verificarNivel
};