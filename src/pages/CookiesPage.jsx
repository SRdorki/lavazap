import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';
import logoImg from '../assets/lavazap_final_logo_nobg.png';

export default function CookiesPage() {
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
                        <i className="fa-solid fa-cookie-bite"></i>
                        Política de Cookies
                    </div>
                    <h1 className="legal-title">Como usamos cookies</h1>
                    <p className="legal-subtitle">
                        Última atualização: 30 de junho de 2026
                    </p>
                </div>

                {/* Content */}
                <div className="legal-content">
                    <div className="legal-intro-card">
                        <i className="fa-solid fa-circle-info" style={{ color: 'var(--lred)' }}></i>
                        <p>
                            Esta política explica como o <strong>LavaZap</strong> utiliza cookies e tecnologias similares quando você acessa nossa plataforma. Ao continuar navegando, você concorda com o uso descrito neste documento.
                        </p>
                    </div>

                    <LegalSection
                        number="01"
                        title="O que são cookies?"
                        icon="fa-solid fa-question"
                    >
                        <p>
                            Cookies são pequenos arquivos de texto que são armazenados no seu navegador ou dispositivo quando você visita um site. Eles permitem que o site reconheça seu dispositivo e lembre informações sobre sua visita, como suas preferências e configurações.
                        </p>
                        <p>
                            Existem dois tipos principais de cookies:
                        </p>
                        <ul>
                            <li><strong>Cookies de sessão:</strong> são temporários e expiram quando você fecha o navegador.</li>
                            <li><strong>Cookies persistentes:</strong> permanecem no seu dispositivo por um período determinado ou até que você os exclua manualmente.</li>
                        </ul>
                    </LegalSection>

                    <LegalSection
                        number="02"
                        title="Quais cookies utilizamos?"
                        icon="fa-solid fa-list"
                    >
                        <CookieTable rows={[
                            {
                                nome: 'supabase-auth-token',
                                tipo: 'Essencial',
                                duracao: 'Sessão / 7 dias',
                                finalidade: 'Mantém sua sessão autenticada na plataforma. Necessário para o funcionamento do painel.'
                            },
                            {
                                nome: 'lv_pref',
                                tipo: 'Preferência',
                                duracao: '1 ano',
                                finalidade: 'Armazena preferências de exibição do painel, como tema e configurações de layout.'
                            },
                            {
                                nome: '_ga, _gid',
                                tipo: 'Analítico',
                                duracao: '2 anos / 24 horas',
                                finalidade: 'Google Analytics. Coleta dados anônimos sobre uso do site para melhorias na plataforma.'
                            },
                            {
                                nome: 'stripe_mid',
                                tipo: 'Funcional',
                                duracao: '1 ano',
                                finalidade: 'Stripe (processador de pagamentos). Previne fraudes e detecta abusos nas transações.'
                            },
                        ]} />
                    </LegalSection>

                    <LegalSection
                        number="03"
                        title="Cookies de terceiros"
                        icon="fa-solid fa-share-nodes"
                    >
                        <p>Utilizamos serviços de terceiros que podem definir seus próprios cookies:</p>
                        <div className="third-party-grid">
                            <ThirdPartyCard
                                name="Google Analytics"
                                icon="fa-brands fa-google"
                                desc="Análise de tráfego e comportamento anônimo de usuários para melhorar a experiência da plataforma."
                                link="https://policies.google.com/privacy"
                            />
                            <ThirdPartyCard
                                name="Stripe"
                                icon="fa-solid fa-credit-card"
                                desc="Processamento seguro de pagamentos. Os cookies da Stripe ajudam a detectar fraudes e garantir transações seguras."
                                link="https://stripe.com/privacy"
                            />
                            <ThirdPartyCard
                                name="Supabase"
                                icon="fa-solid fa-database"
                                desc="Autenticação e banco de dados em tempo real. Tokens de sessão são armazenados para manter você logado com segurança."
                                link="https://supabase.com/privacy"
                            />
                        </div>
                    </LegalSection>

                    <LegalSection
                        number="04"
                        title="Como gerenciar cookies?"
                        icon="fa-solid fa-sliders"
                    >
                        <p>
                            Você pode controlar e/ou excluir cookies conforme desejar. Pode excluir todos os cookies já existentes no seu dispositivo e configurar a maioria dos navegadores para impedir que sejam adicionados novos.
                        </p>
                        <p>
                            No entanto, ao fazer isso, você talvez tenha que ajustar manualmente algumas preferências sempre que visitar o site, e alguns serviços e funcionalidades podem não funcionar corretamente.
                        </p>
                        <div className="browser-guide-grid">
                            {[
                                { name: 'Google Chrome', icon: 'fa-brands fa-chrome', link: 'https://support.google.com/chrome/answer/95647' },
                                { name: 'Mozilla Firefox', icon: 'fa-brands fa-firefox', link: 'https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer' },
                                { name: 'Safari', icon: 'fa-brands fa-safari', link: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471' },
                                { name: 'Microsoft Edge', icon: 'fa-brands fa-edge', link: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406' },
                            ].map(b => (
                                <a key={b.name} href={b.link} target="_blank" rel="noreferrer" className="browser-guide-card">
                                    <i className={b.icon}></i>
                                    <span>{b.name}</span>
                                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i>
                                </a>
                            ))}
                        </div>
                    </LegalSection>

                    <LegalSection
                        number="05"
                        title="Atualizações desta política"
                        icon="fa-solid fa-rotate"
                    >
                        <p>
                            Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças tecnológicas, legais ou de negócio. Quando atualizarmos nossa Política de Cookies, tomaremos as medidas adequadas para informá-lo, de acordo com a importância das mudanças realizadas.
                        </p>
                        <p>
                            Recomendamos que você revise esta página periodicamente para se manter informado sobre como estamos usando cookies.
                        </p>
                    </LegalSection>

                    <LegalSection
                        number="06"
                        title="Contato"
                        icon="fa-solid fa-envelope"
                    >
                        <p>
                            Se você tiver dúvidas sobre o uso de cookies nesta plataforma, entre em contato conosco:
                        </p>
                        <div className="contact-block">
                            <a href="https://wa.me/5511913151641" target="_blank" rel="noreferrer" className="contact-item">
                                <i className="fa-brands fa-whatsapp"></i>
                                <span>WhatsApp: (11) 91315-1641</span>
                            </a>
                        </div>
                    </LegalSection>

                    {/* Footer nav */}
                    <div className="legal-footer-links">
                        <Link to="/privacidade">Ver Política de Privacidade →</Link>
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

function CookieTable({ rows }) {
    return (
        <div className="cookie-table-wrap">
            <table className="cookie-table">
                <thead>
                    <tr>
                        <th>Cookie</th>
                        <th>Tipo</th>
                        <th>Duração</th>
                        <th>Finalidade</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            <td><code>{r.nome}</code></td>
                            <td>
                                <span className={`cookie-type-badge cookie-type-${r.tipo.toLowerCase()}`}>
                                    {r.tipo}
                                </span>
                            </td>
                            <td>{r.duracao}</td>
                            <td>{r.finalidade}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ThirdPartyCard({ name, icon, desc, link }) {
    return (
        <div className="third-party-card">
            <div className="third-party-icon">
                <i className={icon}></i>
            </div>
            <div>
                <div className="third-party-name">{name}</div>
                <p className="third-party-desc">{desc}</p>
                <a href={link} target="_blank" rel="noreferrer" className="third-party-link">
                    Ver política <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            </div>
        </div>
    );
}
