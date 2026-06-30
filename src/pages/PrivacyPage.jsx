import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';
import logoImg from '../assets/lavazap_final_logo_nobg.png';

export default function PrivacyPage() {
    return (
        <div className="legal-page">
            <div className="legal-stars" aria-hidden="true"></div>
            <div className="legal-ambient" aria-hidden="true"></div>

            {/* Nav */}
            <header className="legal-nav-wrap">
                <nav className="legal-nav">
                    <Link to="/" className="legal-logo">
                        <img src={logoImg} alt="LavaZap" style={{ height: '44px', objectFit: 'contain' }} />
                    </Link>
                    <Link to="/" className="legal-back">
                        <i className="fa-solid fa-arrow-left"></i>
                        Voltar ao início
                    </Link>
                </nav>
            </header>

            <main className="legal-main">
                {/* Hero header */}
                <div className="legal-hero">
                    <div className="legal-hero-badge">
                        <i className="fa-solid fa-shield-halved"></i>
                        Diretrizes de Privacidade
                    </div>
                    <h1 className="legal-title">Como protegemos seus dados</h1>
                    <p className="legal-subtitle">
                        Última atualização: 30 de junho de 2026 · Em conformidade com a LGPD (Lei nº 13.709/2018)
                    </p>
                </div>

                {/* Content */}
                <div className="legal-content">
                    <div className="legal-intro-card">
                        <i className="fa-solid fa-lock" style={{ color: 'var(--lred)' }}></i>
                        <p>
                            O <strong>LavaZap</strong> está comprometido com a proteção da sua privacidade e dos dados pessoais de você e dos seus clientes. Esta política descreve como coletamos, usamos, armazenamos e protegemos as informações em nossa plataforma.
                        </p>
                    </div>

                    <LegalSection number="01" title="Quem somos" icon="fa-solid fa-building">
                        <p>
                            O LavaZap é uma plataforma SaaS brasileira voltada para gestão e automação de lava-rápidos e centros de estética automotiva. Atuamos como <strong>operadores de dados</strong> no processamento de informações de clientes finais, e como <strong>controladores</strong> dos dados dos usuários da plataforma.
                        </p>
                        <InfoBox type="info">
                            <strong>Controlador dos dados:</strong> LavaZap (CNPJ em processo de registro). Para questões relacionadas à privacidade, entre em contato pelo WhatsApp: (11) 91315-1641.
                        </InfoBox>
                    </LegalSection>

                    <LegalSection number="02" title="Dados que coletamos" icon="fa-solid fa-database">
                        <p>Coletamos os seguintes tipos de dados pessoais:</p>

                        <div className="data-category-grid">
                            <DataCategory
                                icon="fa-solid fa-user"
                                title="Dados de Cadastro"
                                items={[
                                    'Nome completo',
                                    'Endereço de e-mail',
                                    'Número de telefone / WhatsApp',
                                    'Nome da empresa / lava-rápido',
                                ]}
                            />
                            <DataCategory
                                icon="fa-solid fa-credit-card"
                                title="Dados de Pagamento"
                                items={[
                                    'Dados de cobrança (processados pelo Stripe)',
                                    'Histórico de transações',
                                    'Plano contratado',
                                ]}
                            />
                            <DataCategory
                                icon="fa-solid fa-chart-line"
                                title="Dados de Uso"
                                items={[
                                    'Agendamentos realizados',
                                    'Clientes cadastrados na plataforma',
                                    'Logs de acesso e atividade',
                                    'Dados de desempenho do sistema',
                                ]}
                            />
                            <DataCategory
                                icon="fa-solid fa-globe"
                                title="Dados Técnicos"
                                items={[
                                    'Endereço IP',
                                    'Tipo e versão do navegador',
                                    'Dispositivo e sistema operacional',
                                    'Páginas visitadas e tempo de sessão',
                                ]}
                            />
                        </div>
                    </LegalSection>

                    <LegalSection number="03" title="Como usamos seus dados" icon="fa-solid fa-gears">
                        <p>Utilizamos seus dados pessoais para as seguintes finalidades, com base nas hipóteses legais da LGPD:</p>

                        <div className="purpose-list">
                            {[
                                {
                                    base: 'Execução de contrato',
                                    icon: 'fa-solid fa-file-contract',
                                    items: [
                                        'Criar e gerenciar sua conta na plataforma',
                                        'Fornecer as funcionalidades de gestão de agendamentos',
                                        'Processar pagamentos da assinatura',
                                        'Suporte técnico e atendimento ao cliente',
                                    ]
                                },
                                {
                                    base: 'Legítimo interesse',
                                    icon: 'fa-solid fa-hand-holding',
                                    items: [
                                        'Melhorar e desenvolver novos recursos da plataforma',
                                        'Análise de uso para otimização do sistema',
                                        'Comunicações sobre atualizações relevantes da plataforma',
                                        'Prevenção de fraudes e segurança da conta',
                                    ]
                                },
                                {
                                    base: 'Obrigação legal',
                                    icon: 'fa-solid fa-scale-balanced',
                                    items: [
                                        'Cumprimento de obrigações fiscais e contábeis',
                                        'Atendimento a requisições de autoridades competentes',
                                        'Manutenção de registros conforme exigências legais',
                                    ]
                                },
                            ].map((p, i) => (
                                <div key={i} className="purpose-item">
                                    <div className="purpose-item-header">
                                        <i className={p.icon}></i>
                                        <span className="purpose-base-badge">{p.base}</span>
                                    </div>
                                    <ul>
                                        {p.items.map((it, j) => <li key={j}>{it}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </LegalSection>

                    <LegalSection number="04" title="Compartilhamento de dados" icon="fa-solid fa-share-nodes">
                        <p>
                            Não vendemos seus dados pessoais. Compartilhamos informações apenas com parceiros essenciais para a operação da plataforma, conforme descrito abaixo:
                        </p>
                        <div className="sharing-grid">
                            {[
                                {
                                    name: 'Supabase',
                                    role: 'Banco de dados e autenticação',
                                    flag: '🇺🇸',
                                    note: 'Dados armazenados com criptografia em servidores na AWS.',
                                    link: 'https://supabase.com/privacy'
                                },
                                {
                                    name: 'Stripe',
                                    role: 'Processamento de pagamentos',
                                    flag: '🇺🇸',
                                    note: 'Dados de cartão não são armazenados pelo LavaZap. O Stripe é certificado PCI DSS nível 1.',
                                    link: 'https://stripe.com/privacy'
                                },
                                {
                                    name: 'Google Analytics',
                                    role: 'Análise de tráfego',
                                    flag: '🇺🇸',
                                    note: 'Dados anônimos e agregados. IP anonimizado. Você pode opt-out via configurações de cookies.',
                                    link: 'https://policies.google.com/privacy'
                                },
                                {
                                    name: 'WhatsApp / Meta',
                                    role: 'Canal de comunicação',
                                    flag: '🇺🇸',
                                    note: 'Mensagens de agendamento enviadas via API do WhatsApp. Sujeito às políticas da Meta.',
                                    link: 'https://www.whatsapp.com/legal/privacy-policy'
                                },
                            ].map((s, i) => (
                                <div key={i} className="sharing-card">
                                    <div className="sharing-header">
                                        <span className="sharing-name">{s.flag} {s.name}</span>
                                        <span className="sharing-role">{s.role}</span>
                                    </div>
                                    <p className="sharing-note">{s.note}</p>
                                    <a href={s.link} target="_blank" rel="noreferrer" className="third-party-link">
                                        Política de privacidade <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </LegalSection>

                    <LegalSection number="05" title="Segurança dos dados" icon="fa-solid fa-shield">
                        <p>
                            Adotamos medidas técnicas e organizacionais apropriadas para proteger seus dados contra acesso não autorizado, perda, destruição ou divulgação:
                        </p>
                        <div className="security-grid">
                            {[
                                { icon: 'fa-solid fa-lock', title: 'Criptografia TLS', desc: 'Toda comunicação entre seu dispositivo e nossa plataforma é criptografada via HTTPS/TLS 1.3.' },
                                { icon: 'fa-solid fa-key', title: 'Autenticação Segura', desc: 'Autenticação gerenciada pelo Supabase com suporte a verificação em dois fatores.' },
                                { icon: 'fa-solid fa-eye-slash', title: 'Acesso Mínimo', desc: 'Princípio do menor privilégio: cada parte da equipe acessa apenas o necessário para suas funções.' },
                                { icon: 'fa-solid fa-rotate', title: 'Backups Regulares', desc: 'Backups automáticos diários dos dados, com retenção de 30 dias, hospedados de forma redundante.' },
                            ].map((s, i) => (
                                <div key={i} className="security-card">
                                    <div className="security-icon">
                                        <i className={s.icon}></i>
                                    </div>
                                    <div>
                                        <div className="security-title">{s.title}</div>
                                        <p className="security-desc">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LegalSection>

                    <LegalSection number="06" title="Retenção de dados" icon="fa-solid fa-clock">
                        <p>
                            Mantemos seus dados pessoais pelo período necessário para fornecer os serviços e cumprir nossas obrigações legais:
                        </p>
                        <div className="retention-list">
                            {[
                                { tipo: 'Dados de conta ativa', periodo: 'Enquanto a conta estiver ativa', icon: 'fa-solid fa-user-check' },
                                { tipo: 'Dados após cancelamento', periodo: '90 dias (exclusão automática)', icon: 'fa-solid fa-user-minus' },
                                { tipo: 'Dados financeiros / fiscais', periodo: '5 anos (obrigação legal)', icon: 'fa-solid fa-receipt' },
                                { tipo: 'Logs de acesso', periodo: '6 meses', icon: 'fa-solid fa-server' },
                                { tipo: 'Backups', periodo: '30 dias com rotação automática', icon: 'fa-solid fa-hard-drive' },
                            ].map((r, i) => (
                                <div key={i} className="retention-item">
                                    <i className={r.icon}></i>
                                    <div className="retention-text">
                                        <span className="retention-type">{r.tipo}</span>
                                        <span className="retention-period">{r.periodo}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </LegalSection>

                    <LegalSection number="07" title="Seus direitos (LGPD)" icon="fa-solid fa-balance-scale">
                        <p>
                            Nos termos da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você possui os seguintes direitos:
                        </p>
                        <div className="rights-grid">
                            {[
                                { right: 'Acesso', desc: 'Solicitar confirmação sobre o tratamento e acesso aos seus dados.', icon: 'fa-solid fa-eye' },
                                { right: 'Correção', desc: 'Solicitar a atualização de dados incompletos, inexatos ou desatualizados.', icon: 'fa-solid fa-pen' },
                                { right: 'Eliminação', desc: 'Solicitar a exclusão dos seus dados pessoais tratados com seu consentimento.', icon: 'fa-solid fa-trash' },
                                { right: 'Portabilidade', desc: 'Solicitar seus dados em formato estruturado para uso em outro serviço.', icon: 'fa-solid fa-file-export' },
                                { right: 'Informação', desc: 'Ser informado sobre os terceiros com quem seus dados são compartilhados.', icon: 'fa-solid fa-info-circle' },
                                { right: 'Revogação', desc: 'Retirar o consentimento fornecido a qualquer momento.', icon: 'fa-solid fa-ban' },
                            ].map((r, i) => (
                                <div key={i} className="right-card">
                                    <div className="right-icon">
                                        <i className={r.icon}></i>
                                    </div>
                                    <div className="right-title">{r.right}</div>
                                    <p className="right-desc">{r.desc}</p>
                                </div>
                            ))}
                        </div>
                        <InfoBox type="info">
                            Para exercer qualquer um desses direitos, entre em contato pelo WhatsApp <strong>(11) 91315-1641</strong>. Responderemos em até <strong>15 dias úteis</strong>.
                        </InfoBox>
                    </LegalSection>

                    <LegalSection number="08" title="Menores de idade" icon="fa-solid fa-child">
                        <p>
                            Nossos serviços são destinados exclusivamente a pessoas maiores de 18 anos (ou maiores de 16 anos com consentimento dos responsáveis). Não coletamos intencionalmente dados pessoais de menores de 16 anos. Caso identifiquemos tal situação, os dados serão excluídos imediatamente.
                        </p>
                    </LegalSection>

                    <LegalSection number="09" title="Alterações nesta política" icon="fa-solid fa-rotate">
                        <p>
                            Podemos atualizar esta Política de Privacidade periodicamente. Mudanças significativas serão comunicadas por e-mail ou notificação na plataforma. A data de "última atualização" no topo desta página sempre refletirá a versão mais recente.
                        </p>
                        <p>
                            O uso continuado da plataforma após as alterações constitui aceitação da política revisada.
                        </p>
                    </LegalSection>

                    <LegalSection number="10" title="Contato e DPO" icon="fa-solid fa-envelope">
                        <p>
                            Para dúvidas, solicitações ou exercício dos seus direitos relacionados à privacidade de dados:
                        </p>
                        <div className="contact-block">
                            <a href="https://wa.me/5511913151641" target="_blank" rel="noreferrer" className="contact-item">
                                <i className="fa-brands fa-whatsapp"></i>
                                <span>WhatsApp: (11) 91315-1641</span>
                            </a>
                        </div>
                        <InfoBox type="warn">
                            Em caso de incidente de segurança que afete seus dados, você será notificado em até 72 horas conforme exigência da LGPD.
                        </InfoBox>
                    </LegalSection>

                    {/* Footer nav */}
                    <div className="legal-footer-links">
                        <Link to="/cookies">Ver Política de Cookies →</Link>
                        <Link to="/">Voltar à página inicial</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ─── Sub-components ──────────────────────────────── */

function LegalSection({ number, title, icon, children }) {
    return (
        <div className="legal-section">
            <div className="legal-section-header">
                <div className="legal-section-number">{number}</div>
                <div className="legal-section-icon">
                    <i className={icon}></i>
                </div>
                <h2 className="legal-section-title">{title}</h2>
            </div>
            <div className="legal-section-body">
                {children}
            </div>
        </div>
    );
}

function DataCategory({ icon, title, items }) {
    return (
        <div className="data-category-card">
            <div className="data-category-icon">
                <i className={icon}></i>
            </div>
            <div className="data-category-title">{title}</div>
            <ul>
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
    );
}

function InfoBox({ type, children }) {
    const icons = { info: 'fa-solid fa-circle-info', warn: 'fa-solid fa-triangle-exclamation' };
    return (
        <div className={`info-box info-box-${type}`}>
            <i className={icons[type]}></i>
            <div>{children}</div>
        </div>
    );
}
