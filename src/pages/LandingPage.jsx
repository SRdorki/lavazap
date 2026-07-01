import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import imgFelipe from '../assets/social/Felipe.png';
import imgGean from '../assets/social/Gean.png';
import imgThais from '../assets/social/Thais.png';
import logoImg from '../assets/lavazap_final_logo_nobg.png';

export default function LandingPage() {
    useEffect(() => {
        // Mouse spotlight effect on bento cards
        const handleMouseMove = (e) => {
            const cards = document.querySelectorAll('.spotlight-card');
            for (const card of cards) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="lp">
            {/* Starfield layers */}
            <div className="lp-stars" aria-hidden="true"></div>
            <div className="lp-stars-2" aria-hidden="true"></div>

            {/* Ambient red glow */}
            <div className="lp-ambient" aria-hidden="true"></div>

            {/* Gradient blur header */}
            <div className="lp-header-blur" aria-hidden="true"></div>

            {/* ─── NAVIGATION ─────────────────────────── */}
            <header className="lp-nav-wrap">
                <nav className="lp-nav">
                    {/* Logo */}
                    <Link to="/" className="lp-logo">
                        <img src={logoImg} alt="LavaZap Logo" style={{ height: '48px', objectFit: 'contain' }} />
                    </Link>

                    {/* Links */}
                    <ul className="lp-nav-links">
                        <li><a href="#features">Recursos</a></li>
                        <li><a href="#pricing">Planos</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>

                    {/* Actions */}
                    <div className="lp-nav-actions">
                        <Link to="/login" className="lp-nav-login">Entrar</Link>
                        <Link to="/login" className="btn-shiny-sm">
                            <span className="btn-border"></span>
                            <span className="btn-spin"></span>
                            <span className="btn-bg"></span>
                            <span className="btn-label">Criar Conta</span>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* ─── HERO ────────────────────────────────── */}
            <section className="lp-hero">
                {/* Left: copy */}
                <div>
                    <div className="hero-badge anim-1">
                        Novo: Integração via WhatsApp 🔥
                    </div>

                    <h1 className="display-title anim-2">
                        Pare de perder dinheiro enquanto lava carros.
                    </h1>

                    <p className="hero-sub anim-3">
                        Deixe um Assistente Virtual agendar, cobrar e lotar sua agenda 24 horas por dia.
                        O único sistema criado para donos de lava-rápido que transforma seu WhatsApp em uma máquina automática.
                    </p>

                    <div className="hero-actions anim-4">
                        <Link to="/login" className="btn-shiny-lg">
                            Quero Lotar Minha Agenda Hoje
                            <i className="fa-solid fa-bolt" style={{ fontSize: '0.95em' }}></i>
                        </Link>
                    </div>
                </div>

                {/* Right: chat mockup */}
                <div className="anim-3" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="lp-chat-card" style={{ maxWidth: '380px', width: '100%' }}>
                        <div className="chat-dots">
                            <div className="chat-dot"></div>
                            <div className="chat-dot"></div>
                            <div className="chat-dot"></div>
                        </div>
                        <div className="chat-bubble chat-received">
                            Olá! Qual o valor da lavagem completa?
                        </div>
                        <div className="chat-bubble chat-sent">
                            Olá! Sou o Assistente Virtual do LavaZap. A lavagem completa é R$ 80,00 e leva cerca de 1 hora. Temos vaga hoje às 14:00. Deseja agendar?
                        </div>
                        <div className="chat-bubble chat-received">
                            Sim, pode marcar para as 14h!
                        </div>
                        <div className="chat-bubble chat-success">
                            ✅ Agendamento confirmado para as 14:00!
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── TRUSTED ─────────────────────────────── */}
            <div className="lp-trusted">
                <div className="lp-container">
                    <p className="trusted-label">
                        A tecnologia escolhida por centros de estética de alto padrão e concessionárias
                    </p>
                    <div className="trusted-logos">
                        <span className="trusted-logo"><i className="fa-solid fa-shield"></i> CERAMIC PRO</span>
                        <span className="trusted-logo">PORSCHE DETAILING</span>
                        <span className="trusted-logo">BMW STUDIO</span>
                        <span className="trusted-logo"><i className="fa-solid fa-droplet"></i> VONIXX PRO</span>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">+9<span className="suffix">anos</span></div>
                            <div className="stat-label">No mercado automotivo</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">+1M</div>
                            <div className="stat-label">Agendamentos processados pela plataforma</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">0<span className="suffix">%</span></div>
                            <div className="stat-label">De comissão por serviço agendado</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── PROBLEM ─────────────────────────────── */}
            <section className="problem-section section-pad" id="problem">
                <div className="lp-container">
                    <div className="section-header-center">
                        <div className="section-pill danger">
                            <span className="pill-dot"></span>
                            Dores Reais
                        </div>
                        <h2 className="section-title">
                            Todo lava-rápido passa <span className="highlight">por isso</span>
                        </h2>
                    </div>

                    <div className="bento-grid">
                        <div className="bento-card spotlight-card">
                            <div className="card-glow"></div>
                            <div className="card-icon-wrap">
                                <i className="fa-solid fa-phone-slash"></i>
                            </div>
                            <h3 className="card-title">Demora no Atendimento</h3>
                            <p className="card-text">
                                Você está com as mãos ocupadas detalhando um carro e não consegue responder o WhatsApp. O cliente não espera e vai para a concorrência.
                            </p>
                            <div className="card-footer-link">
                                <span>Solucionar isso</span>
                                <i className="fa-solid fa-chevron-right" style={{ color: 'var(--red)', fontSize: '0.75rem' }}></i>
                            </div>
                        </div>

                        <div className="bento-card spotlight-card">
                            <div className="card-glow"></div>
                            <div className="card-icon-wrap">
                                <i className="fa-solid fa-calendar-xmark"></i>
                            </div>
                            <h3 className="card-title">Furos na Agenda (No-show)</h3>
                            <p className="card-text">
                                O cliente agenda e simplesmente não aparece. Você fica com um buraco no dia, equipe parada e perde o dinheiro daquela hora.
                            </p>
                            <div className="card-footer-link">
                                <span>Solucionar isso</span>
                                <i className="fa-solid fa-chevron-right" style={{ color: 'var(--red)', fontSize: '0.75rem' }}></i>
                            </div>
                        </div>

                        <div className="bento-card spotlight-card bento-wide">
                            <div className="card-glow"></div>
                            <div className="card-icon-wrap">
                                <i className="fa-solid fa-clock"></i>
                            </div>
                            <h3 className="card-title">Sem Tempo Livre</h3>
                            <p className="card-text">
                                Você passa as madrugadas e o final de semana inteiro respondendo mensagens de orçamento para não perder clientes no dia seguinte.
                            </p>
                            <div className="card-footer-link">
                                <span>Solucionar isso</span>
                                <i className="fa-solid fa-chevron-right" style={{ color: 'var(--red)', fontSize: '0.75rem' }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── NA PRÁTICA ──────────────────────────── */}
            <section className="section-pad" id="practice">
                <div className="lp-container">
                    <div className="section-header-center">
                        <div className="section-pill info">
                            <span className="pill-dot"></span>
                            Na Prática
                        </div>
                        <h2 className="section-title">
                            O que muda no seu <span className="highlight">dia a dia</span>
                        </h2>
                    </div>

                    <div className="practice-list">
                        <div className="glass-card spotlight-card practice-card">
                            <div className="practice-number">1</div>
                            <div>
                                <h3 className="card-title" style={{ marginTop: 0 }}>O cliente chama de madrugada</h3>
                                <p className="card-text" style={{ marginBottom: 0 }}>
                                    Seu LavaZap atende instantaneamente, oferece os serviços e mostra os horários livres, fechando a venda e agendando enquanto você dorme.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card spotlight-card practice-card">
                            <div className="practice-number">2</div>
                            <div>
                                <h3 className="card-title" style={{ marginTop: 0 }}>Lembrete contra faltas</h3>
                                <p className="card-text" style={{ marginBottom: 0 }}>
                                    Horas antes do serviço, o Assistente manda uma mensagem lembrando o cliente do agendamento, praticamente zerando os "furos" na sua agenda.
                                </p>
                            </div>
                        </div>

                        <div className="glass-card spotlight-card practice-card">
                            <div className="practice-number">3</div>
                            <div>
                                <h3 className="card-title" style={{ marginTop: 0 }}>Aviso de "Carro Pronto" com 1 clique</h3>
                                <p className="card-text" style={{ marginBottom: 0 }}>
                                    Terminou a lavagem? Você arrasta o card do carro no seu painel e o cliente recebe na hora no WhatsApp: "Seu veículo está brilhando e pronto para retirada!"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── COMO FUNCIONA ───────────────────────── */}
            <section className="section-pad" id="how-it-works">
                <div className="lp-container">
                    <div className="section-header-center">
                        <h2 className="section-title text-center">Como funciona</h2>
                        <p className="section-subtitle mt-4" style={{ maxWidth: '560px' }}>
                            Três passos simples para ter o seu lava-rápido no piloto automático.
                        </p>
                    </div>

                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>1. Crie sua conta e configure</h3>
                                <p>Cadastre seus serviços, preços e conecte seu Mercado Pago para receber pagamentos. Leva menos de 5 minutos.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>2. Compartilhe seu link exclusivo</h3>
                                <p>Você ganha uma página de agendamento personalizada com sua marca. Divulgue no Instagram, WhatsApp ou onde quiser.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <h3>3. Clientes agendam sozinhos</h3>
                                <p>O cliente escolhe o serviço, o horário livre e confirma. O agendamento aparece no seu painel em tempo real, sem você mover um dedo.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ────────────────────────────── */}
            <section className="section-pad" id="features">
                <div className="lp-container">
                    <h2 className="section-title" style={{ maxWidth: '700px' }}>
                        O seu "Funcionário Invisível" que atende em <span className="text-red">3 segundos</span>.
                    </h2>

                    <div className="bento-grid">
                        <div className="bento-card spotlight-card">
                            <div className="card-glow"></div>
                            <div className="card-icon-wrap">
                                <i className="fa-solid fa-bolt"></i>
                            </div>
                            <h3 className="card-title">Atendimento Imediato</h3>
                            <p className="card-text">
                                O cliente manda mensagem. O sistema responde em segundos, mostra horários disponíveis e fecha o agendamento sozinho.
                            </p>
                        </div>

                        <div className="bento-card spotlight-card">
                            <div className="card-glow"></div>
                            <div className="card-icon-wrap">
                                <i className="fa-solid fa-palette"></i>
                            </div>
                            <h3 className="card-title">Sua Marca (Whitelabel)</h3>
                            <p className="card-text">
                                Seu lava-rápido ganha uma página de agendamento premium, com o seu logotipo e cores, sem que o cliente precise baixar nada.
                            </p>
                        </div>

                        <div className="bento-card spotlight-card bento-wide" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                            <div className="card-glow"></div>
                            <div>
                                <div className="card-icon-wrap">
                                    <i className="fa-solid fa-chart-simple"></i>
                                </div>
                                <h3 className="card-title">Painel à Prova de Leigos</h3>
                                <p className="card-text">
                                    Uma tela simples (Aguardando &gt; Lavando &gt; Pronto). Um clique avisa o cliente que o carro está pronto para retirada. Sem precisar saber nada de tecnologia.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── VALUE PROP ──────────────────────────── */}
            <section className="section-pad-sm">
                <div className="lp-container">
                    <div className="value-banner">
                        <h2 className="section-title text-red" style={{ marginBottom: '16px', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                            Sem comissão por serviço. 100% do lucro é seu.
                        </h2>
                        <p className="section-subtitle" style={{ maxWidth: '680px', margin: '0 auto' }}>
                            Você paga uma mensalidade fixa e pronto. Cada agendamento recebido vai direto para o caixa, sem intermediário e sem taxa por transação.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS BANNER ─────────────────── */}
            <section className="lp-testimonials-banner" id="testimonials">
                <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div className="text-center">
                        <div className="testimonials-stars">
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                            <i className="fa-solid fa-star"></i>
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-head)',
                            fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
                            fontWeight: 700,
                            color: 'rgba(0,0,0,0.9)',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.15,
                            maxWidth: '720px',
                            margin: '0 auto 12px'
                        }}>
                            Quem já parou de perder clientes
                        </h2>
                        <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '1rem' }}>
                            Resultados reais de donos de lava-rápido em todo o Brasil
                        </p>
                    </div>

                    <div className="testimonials-grid mt-10">
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                            </div>
                            <p className="testimonial-text">
                                "Sábado era um inferno para organizar a agenda. Eu perdia no mínimo uns 4 clientes por demorar a responder. Agora eu só abro a tela e vejo quem é o próximo. Vale cada centavo."
                            </p>
                            <div className="testimonial-author">
                                <img src={imgFelipe} alt="Felipe" className="author-avatar" />
                                <div>
                                    <div className="author-name">Felipe</div>
                                    <div className="author-role">Detail Prime Estética</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                            </div>
                            <p className="testimonial-text">
                                "Achei que meus clientes mais antigos iam odiar o assistente virtual, mas foi o contrário. Eles elogiam que conseguem marcar a lavagem em 5 segundos de madrugada."
                            </p>
                            <div className="testimonial-author">
                                <img src={imgGean} alt="Gean" className="author-avatar" />
                                <div>
                                    <div className="author-name">Gean</div>
                                    <div className="author-role">Lava-Rápido do Gean</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                            </div>
                            <p className="testimonial-text">
                                "Desde que instalei o LavaZap, consegui finalmente tirar férias. O robô atende todo mundo e no painel eu acompanho quantos carros a equipe lavou no dia."
                            </p>
                            <div className="testimonial-author">
                                <img src={imgThais} alt="Thais" className="author-avatar" />
                                <div>
                                    <div className="author-name">Thais</div>
                                    <div className="author-role">Studio Premium Estética Automotiva</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── PRICING ─────────────────────────────── */}
            <section className="section-pad" id="pricing">
                <div className="lp-container">
                    <div className="section-header-center">
                        <h2 className="section-title text-center">Escolha o seu plano</h2>
                        <p className="section-subtitle mt-4" style={{ maxWidth: '520px' }}>
                            Teste por 7 dias grátis. Sem cartão de crédito necessário para começar.
                        </p>
                    </div>

                    <div className="pricing-grid">
                        {/* Starter */}
                        <div className="pricing-card">
                            <div className="pricing-plan-name">Plano Start</div>
                            <div className="pricing-price">
                                R$ <span>97</span>
                                <span className="pricing-period">/mês</span>
                            </div>
                            <p className="pricing-desc">Para começar a organizar sua agenda de lavagens.</p>
                            <ul className="pricing-features">
                                <li className="feature-highlight">🎁 7 Dias de Teste Grátis</li>
                                <li>Página de Agendamento Padrão</li>
                                <li>Painel de Gestão de Veículos</li>
                                <li>Cadastro de Clientes (CRM)</li>
                                <li>Até 150 agendamentos/mês</li>
                            </ul>
                            <Link to="/login" className="btn-ghost">Iniciar Teste Grátis</Link>
                        </div>

                        {/* Featured */}
                        <div className="pricing-card featured">
                            <div className="pricing-badge">Mais Escolhido</div>
                            <div className="pricing-plan-name featured-name">Plano Personalizado</div>
                            <div className="pricing-price-alt">Sob Consulta</div>
                            <p className="pricing-desc">O seu WhatsApp no Piloto Automático.</p>
                            <ul className="pricing-features">
                                <li>Tudo do Plano Profissional</li>
                                <li className="feature-highlight">Assistente IA de Agendamento (WhatsApp)</li>
                                <li>Implantação e Fluxos Customizados</li>
                                <li>Treinamento da IA com seus dados</li>
                                <li>Sem limites de agendamento</li>
                            </ul>
                            <a
                                href="https://wa.me/5511913151641?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais%20sobre%20o%20Plano%20Personalizado%20do%20LavaZap%21"
                                target="_blank"
                                rel="noreferrer"
                                className="btn-solid-red"
                                style={{ width: '100%' }}
                            >
                                Falar com Consultor
                            </a>
                        </div>

                        {/* Professional */}
                        <div className="pricing-card">
                            <div className="pricing-plan-name">Plano Profissional</div>
                            <div className="pricing-price">
                                R$ <span>197</span>
                                <span className="pricing-period">/mês</span>
                            </div>
                            <p className="pricing-desc">Controle completo com a sua própria marca.</p>
                            <ul className="pricing-features">
                                <li>Tudo do Plano Start</li>
                                <li className="feature-highlight">Sua Página Whitelabel (Cores e Logo)</li>
                                <li>Sincronização com Google Agenda</li>
                                <li>Relatórios de Faturamento</li>
                                <li>Até 500 agendamentos/mês</li>
                            </ul>
                            <Link to="/login" className="btn-ghost">Assinar Profissional</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─────────────────────────────────── */}
            <FaqSection />

            {/* ─── FOOTER ──────────────────────────────── */}
            <footer className="lp-footer">
                {/* CTA Block */}
                <div className="footer-cta-block">
                    <div className="lp-container">
                        <h2>Teste o Plano Start por 7 dias grátis.</h2>
                        <p>
                            Crie sua conta agora e veja na prática como o LavaZap vai organizar a sua agenda e atrair mais clientes.
                        </p>
                        <Link to="/login" className="btn-shiny-lg">
                            Criar Minha Conta Agora
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.9em' }}></i>
                        </Link>
                    </div>
                </div>

                <div className="lp-container-wide">
                    <div className="footer-grid">
                        {/* Brand */}
                        <div className="footer-brand">
                            <Link to="/" className="lp-logo" style={{ marginBottom: '0' }}>
                                <div className="lp-logo-diamond"></div>
                                <span className="lp-logo-text">LavaZap</span>
                            </Link>
                            <p>Sistema operacional para a próxima geração de lava-rápidos e centros de estética automotiva.</p>
                        </div>

                        {/* Resources */}
                        <div>
                            <div className="footer-col-title">Recursos</div>
                            <ul className="footer-links">
                                <li><a href="#features">Funcionalidades</a></li>
                                <li><a href="#pricing">Planos e Preços</a></li>
                                <li><a href="#faq">Perguntas Frequentes</a></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <div className="footer-col-title">Empresa</div>
                            <ul className="footer-links">
                                <li>
                                    <a
                                        href="https://wa.me/5511913151641"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Fale Conosco
                                    </a>
                                </li>
                                <li><Link to="/login">Criar Conta</Link></li>
                                <li><Link to="/privacidade">Política de Privacidade</Link></li>
                                <li><Link to="/cookies">Política de Cookies</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className="footer-watermark">
                        <span>LAVAZAP SYSTEMS</span>
                    </div>

                    {/* Bottom bar */}
                    <div className="footer-bottom">
                        <p>&copy; 2026 LavaZap. Todos os direitos reservados.</p>
                        <ul className="footer-social">
                            <li>
                                <a
                                    href="https://wa.me/5511913151641"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    WhatsApp
                                </a>
                            </li>
                            <li><a href="https://www.instagram.com/lava.zap/" target='_blank' rel="noreferrer">Instagram</a></li>
                        </ul>
                    </div>
                </div>
            </footer>

            {/* ─── FLOATING WHATSAPP ───────────────────── */}
            <a
                href="https://wa.me/5511913151641?text=Ol%C3%A1%21%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20LavaZap."
                target="_blank"
                rel="noreferrer"
                className="wa-btn"
                aria-label="Falar no WhatsApp"
            >
                <i className="fa-brands fa-whatsapp"></i>
            </a>

            {/* ─── COOKIE CONSENT BANNER ──────────────── */}
            <CookieConsent />
        </div>
    );
}

/* =====================================================
   FAQ DATA
   ===================================================== */
const faqData = [
    {
        q: 'Preciso saber programar para usar o LavaZap?',
        a: 'Não! O sistema foi pensado para donos de lava-rápido que não têm experiência com tecnologia. Basta criar sua conta, cadastrar os serviços e pronto. É tão simples quanto usar o WhatsApp.'
    },
    {
        q: 'Como funciona o período de teste grátis?',
        a: 'Ao assinar o Plano Start, você ganha 7 dias gratuitos para testar todas as funcionalidades sem compromisso. Se não gostar, pode cancelar antes do fim do período sem pagar nada.'
    },
    {
        q: 'O LavaZap cobra comissão sobre os agendamentos?',
        a: 'Não, nunca. Você paga apenas a mensalidade fixa do plano escolhido. 100% do valor de cada lavagem vai direto para o seu caixa, sem intermediários e sem taxas por transação.'
    },
    {
        q: 'Como o Assistente Virtual do Plano Personalizado funciona?',
        a: 'No Plano Personalizado, nossa equipe instala e configura um Assistente com Inteligência Artificial no seu WhatsApp. Ele responde clientes automaticamente, mostra horários disponíveis e fecha agendamentos — 24 horas por dia, inclusive de madrugada.'
    },
    {
        q: 'Posso personalizar a página de agendamento com a minha marca?',
        a: 'Sim! A partir do Plano Profissional, você desbloqueia o Whitelabel completo: logotipo, cores e endereço exclusivo (ex: lavazap.site/suamarca). Seu cliente nunca verá a marca LavaZap.'
    },
    {
        q: 'E se eu quiser cancelar?',
        a: 'Você pode cancelar a qualquer momento direto pela sua área de pagamentos, sem burocracia. Não há multa nem fidelidade. Cancelou, o acesso segue ativo até o fim do período já pago.'
    }
];

function FaqSection() {
    const [openIndex, setOpenIndex] = useState(null);
    const toggle = (idx) => setOpenIndex(prev => prev === idx ? null : idx);

    return (
        <section className="faq-section section-pad" id="faq">
            <div className="lp-container">
                <div className="section-header-center">
                    <h2 className="section-title text-center">Perguntas Frequentes</h2>
                    <p className="section-subtitle mt-4" style={{ maxWidth: '560px' }}>
                        Tudo o que você precisa saber antes de automatizar o seu lava-rápido.
                    </p>
                </div>

                <div className="faq-list">
                    {faqData.map((item, idx) => (
                        <div key={idx} className={`faq-item${openIndex === idx ? ' open' : ''}`}>
                            <button className="faq-question" onClick={() => toggle(idx)}>
                                <span>{item.q}</span>
                                <i className="fa-solid fa-plus faq-icon"></i>
                            </button>
                            <div className="faq-answer">
                                <div className="faq-answer-inner">{item.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* =====================================================
   COOKIE CONSENT BANNER
   ===================================================== */
function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('lv_cookie_consent');
        if (!accepted) {
            // Small delay so page loads first
            const t = setTimeout(() => setVisible(true), 1200);
            return () => clearTimeout(t);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('lv_cookie_consent', 'accepted');
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem('lv_cookie_consent', 'declined');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            width: 'calc(100% - 32px)',
            maxWidth: '720px',
            background: 'rgba(10, 10, 10, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,35,60,0.1)',
            animation: 'cookie-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
            <style>{`
                @keyframes cookie-slide-up {
                    from { opacity: 0; transform: translateX(-50%) translateY(24px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-cookie-bite" style={{ color: '#ef233c', fontSize: '1.25rem', flexShrink: 0, marginTop: '2px' }}></i>
                <div>
                    <p style={{ fontFamily: "'Manrope','Inter',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', marginBottom: '6px' }}>
                        Usamos cookies 🍪
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
                        Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para melhorar a experiência. Ao clicar em "Aceitar", você concorda com nossa{' '}
                        <Link to="/cookies" style={{ color: '#ef233c', textDecoration: 'none', fontWeight: 600 }}>
                            Política de Cookies
                        </Link>
                        {' '}e{' '}
                        <Link to="/privacidade" style={{ color: '#ef233c', textDecoration: 'none', fontWeight: 600 }}>
                            Política de Privacidade
                        </Link>.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                    onClick={decline}
                    style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        padding: '8px 18px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: "'Inter',sans-serif",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                    Somente essenciais
                </button>
                <button
                    onClick={accept}
                    style={{
                        background: '#ef233c',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 22px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(239,35,60,0.35)',
                        transition: 'all 0.2s ease',
                        fontFamily: "'Inter',sans-serif",
                        letterSpacing: '0.03em',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ff3552'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,35,60,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ef233c'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,35,60,0.35)'; }}
                >
                    Aceitar todos
                </button>
            </div>
        </div>
    );
}
