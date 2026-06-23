import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import imgFelipe from '../assets/social/Felipe.png';
import imgGean from '../assets/social/Gean.png';
import imgThais from '../assets/social/Thais.png';
import logoImg from '../assets/lavazap_final_logo_nobg.png';

export default function LandingPage() {
    useEffect(() => {
        const handleScroll = () => {
            const nav = document.querySelector('.glass-nav');
            if (nav) {
                if (window.scrollY > 50) {
                    nav.style.background = 'rgba(13, 27, 42, 0.8)';
                    nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                } else {
                    nav.style.background = 'rgba(13, 27, 42, 0.5)';
                    nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
                }
            }
        };

        const handleMouseMove = (e) => {
            const cards = document.querySelectorAll('.spotlight-card');
            for (const card of cards) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="landing-page-container">
            <div className="glow-bg"></div>
            <div className="glow-bg glow-bg-2"></div>
            
            <nav className="glass-nav">
                <div className="nav-content">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logoImg} alt="LavaZap Logo" style={{ height: '80px', objectFit: 'contain' }} />
                    </div>
                    <div className="nav-links">
                        <a href="#features">Recursos</a>
                        <a href="#pricing">Planos</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <Link to="/login" className="lp-btn lp-btn-primary">Criar Conta</Link>
                </div>
            </nav>

            <header className="hero">
                <div className="hero-content">
                    <div className="badge">Novo: Integração via WhatsApp 🔥</div>
                    <h1 className="headline">Pare de perder dinheiro enquanto lava carros.</h1>
                    <p className="sub-headline">Deixe um Assistente Virtual agendar, cobrar e lotar sua agenda 24 horas por dia. O único sistema criado para donos de lava-rápido que transforma seu WhatsApp em uma máquina automática.</p>
                    <div className="hero-actions">
                        <Link to="/login" className="lp-btn lp-btn-primary lp-btn-large">Quero Lotar Minha Agenda Hoje</Link>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="glass-card bento-card floating-card">
                        <div className="mock-header">
                            <div className="mock-dot"></div>
                            <div className="mock-dot"></div>
                            <div className="mock-dot"></div>
                        </div>
                        <div className="chat-bubble received">
                            Olá! Qual o valor da lavagem completa?
                        </div>
                        <div className="chat-bubble sent">
                            Olá! Sou o Assistente Virtual do LavaZap. A lavagem completa é R$ 80,00 e leva cerca de 1 hora. Temos vaga hoje às 14:00. Deseja agendar?
                        </div>
                        <div className="chat-bubble received">
                            Sim, pode marcar para as 14h!
                        </div>
                        <div className="chat-bubble sent success">
                            ✅ Agendamento confirmado para as 14:00!
                        </div>
                    </div>
                </div>
            </header>

            <section className="trusted-section">
                <div className="section-container" style={{paddingTop: '40px', paddingBottom: '40px'}}>
                    <p className="trusted-title text-center text-muted">A tecnologia escolhida por centros de estética de alto padrão e concessionárias</p>
                    <div className="trusted-logos">
                        <span className="brand-logo"><i className="fa-solid fa-shield"></i> CERAMIC PRO</span>
                        <span className="brand-logo">PORSCHE DETAILING</span>
                        <span className="brand-logo">BMW STUDIO</span>
                        <span className="brand-logo"><i className="fa-solid fa-droplet"></i> VONIXX PRO</span>
                    </div>

                    <div className="stats-banner">
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
            </section>

            <section className="problem-section" id="problem">
                <div className="section-container">
                    <div className="section-header-pill">
                        <div className="badge-pill danger">
                            <span className="dot"></span> DORES REAIS
                        </div>
                        <h2 className="section-title text-center" style={{marginBottom: 0}}>Todo lava-rápido passa <span className="highlight-red">por isso</span></h2>
                    </div>
                    <div className="bento-grid" style={{marginTop: '40px'}}>
                        <div className="bento-card glass-card">
                            <div className="card-icon" style={{color: '#ff4d4d'}}><i className="fa-solid fa-phone-slash"></i></div>
                            <h3>Demora no Atendimento</h3>
                            <p>Você está com as mãos ocupadas detalhando um carro e não consegue responder o WhatsApp. O cliente não espera e vai para a concorrência.</p>
                        </div>
                        <div className="bento-card glass-card">
                            <div className="card-icon" style={{color: '#ff4d4d'}}><i className="fa-solid fa-calendar-xmark"></i></div>
                            <h3>Furos na Agenda (No-show)</h3>
                            <p>O cliente agenda e simplesmente não aparece. Você fica com um buraco no dia, equipe parada e perde o dinheiro daquela hora.</p>
                        </div>
                        <div className="bento-card glass-card">
                            <div className="card-icon" style={{color: '#ff4d4d'}}><i className="fa-solid fa-clock"></i></div>
                            <h3>Sem Tempo Livre</h3>
                            <p>Você passa as madrugadas e o final de semana inteiro respondendo mensagens de orçamento para não perder clientes no dia seguinte.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="practice-section" id="practice" style={{padding: '80px 0', position: 'relative'}}>
                <div className="glow-bg" style={{top: '50%', left: '10%', opacity: 0.3}}></div>
                <div className="section-container">
                    <div className="section-header-pill">
                        <div className="badge-pill info">
                            <span className="dot"></span> NA PRÁTICA
                        </div>
                        <h2 className="section-title text-center" style={{marginBottom: 0}}>O que muda no seu <span className="highlight-cyan">dia a dia</span></h2>
                    </div>
                    
                    <div style={{marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                        <div className="bento-card spotlight-card" style={{display: 'flex', alignItems: 'flex-start', gap: '24px', textAlign: 'left'}}>
                            <div className="card-icon" style={{color: '#00f2fe', fontSize: '2rem', marginBottom: 0, flexShrink: 0}}><i className="fa-solid fa-1"></i></div>
                            <div>
                                <h3 style={{marginTop: 0}}>O cliente chama de madrugada</h3>
                                <p style={{marginBottom: 0}}>Seu LavaZap atende instantaneamente, oferece os serviços e mostra os horários livres, fechando a venda e agendando enquanto você dorme.</p>
                            </div>
                        </div>
                        
                        <div className="bento-card spotlight-card" style={{display: 'flex', alignItems: 'flex-start', gap: '24px', textAlign: 'left'}}>
                            <div className="card-icon" style={{color: '#00f2fe', fontSize: '2rem', marginBottom: 0, flexShrink: 0}}><i className="fa-solid fa-2"></i></div>
                            <div>
                                <h3 style={{marginTop: 0}}>Lembrete contra faltas</h3>
                                <p style={{marginBottom: 0}}>Horas antes do serviço, o Assistente manda uma mensagem lembrando o cliente do agendamento, praticamente zerando os "furos" na sua agenda.</p>
                            </div>
                        </div>
                        
                        <div className="bento-card spotlight-card" style={{display: 'flex', alignItems: 'flex-start', gap: '24px', textAlign: 'left'}}>
                            <div className="card-icon" style={{color: '#00f2fe', fontSize: '2rem', marginBottom: 0, flexShrink: 0}}><i className="fa-solid fa-3"></i></div>
                            <div>
                                <h3 style={{marginTop: 0}}>Aviso de "Carro Pronto" com 1 clique</h3>
                                <p style={{marginBottom: 0}}>Terminou a lavagem? Você arrasta o card do carro no seu painel e o cliente recebe na hora no WhatsApp: "Seu veículo está brilhando e pronto para retirada!"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="timeline-section" id="how-it-works" style={{padding: '80px 0'}}>
                <div className="section-container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Como funciona</h2>
                    </div>
                    
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content bento-card glass-card">
                                <h3>1. Conecte seu WhatsApp</h3>
                                <p>Leia o QR Code na tela do sistema e seu número já estará automatizado. Simples assim.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content bento-card glass-card">
                                <h3>2. Divulgue seu link ou número</h3>
                                <p>Coloque no Instagram ou passe para os clientes. Quando chamarem, a Inteligência Artificial atende imediatamente.</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content bento-card glass-card">
                                <h3>3. A mágica acontece</h3>
                                <p>O robô consulta a agenda, marca o cliente no horário livre e o veículo já aparece no seu painel de gestão na mesma hora.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-section" id="features">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">O seu "Funcionário Invisível" que atende em 3 segundos.</h2>
                    </div>
                    
                    <div className="bento-grid">
                        <div className="bento-card spotlight-card">
                            <div className="card-icon"><i className="fa-solid fa-bolt"></i></div>
                            <h3>Atendimento Imediato</h3>
                            <p>O cliente manda mensagem. O sistema responde em segundos, mostra horários disponíveis e fecha o agendamento sozinho.</p>
                        </div>
                        
                        <div className="bento-card spotlight-card">
                            <div className="card-icon"><i className="fa-solid fa-palette"></i></div>
                            <h3>Sua Marca (Whitelabel)</h3>
                            <p>Seu lava-rápido ganha uma página de agendamento premium, com o seu logotipo e cores, sem que o cliente precise baixar nada.</p>
                        </div>
                        
                        <div className="bento-card spotlight-card feature-wide">
                            <div className="card-content-left">
                                <div className="card-icon"><i className="fa-solid fa-chart-simple"></i></div>
                                <h3>Painel à Prova de Leigos</h3>
                                <p>Uma tela simples (Aguardando &gt; Lavando &gt; Pronto). Um clique avisa o cliente que o carro está pronto para retirada.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="testimonials-section" id="testimonials">
                <div className="section-container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Quem já parou de perder clientes</h2>
                    </div>
                    
                    <div className="testimonials-grid">
                        <div className="bento-card glass-card testimonial-card">
                            <div className="stars text-cyan mb-3">
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                            </div>
                            <p className="testimonial-text">"Sábado era um inferno para organizar a agenda. Eu perdia no mínimo uns 4 clientes por demorar a responder. Agora eu só abro a tela e vejo quem é o próximo. Vale cada centavo."</p>
                            <div className="testimonial-author">
                                <img src={imgFelipe} alt="Felipe" className="author-avatar" style={{ objectFit: 'cover' }} />
                                <div>
                                    <strong>Felipe</strong>
                                    <span>Detail Prime Estética</span>
                                </div>
                            </div>
                        </div>

                        <div className="bento-card glass-card testimonial-card">
                            <div className="stars text-cyan mb-3">
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                            </div>
                            <p className="testimonial-text">"Achei que meus clientes mais antigos iam odiar o assistente virtual, mas foi o contrário. Eles elogiam que conseguem marcar a lavagem em 5 segundos de madrugada."</p>
                            <div className="testimonial-author">
                                <img src={imgGean} alt="Gean" className="author-avatar" style={{ objectFit: 'cover' }} />
                                <div>
                                    <strong>Gean</strong>
                                    <span>Lava-Rápido do Gean</span>
                                </div>
                            </div>
                        </div>

                        <div className="bento-card glass-card testimonial-card">
                            <div className="stars text-cyan mb-3">
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                            </div>
                            <p className="testimonial-text">"Desde que instalei o LavaZap, consegui finalmente tirar férias. O robô atende todo mundo e no painel eu acompanho quantos carros a equipe lavou no dia."</p>
                            <div className="testimonial-author">
                                <img src={imgThais} alt="Thais" className="author-avatar" style={{ objectFit: 'cover' }} />
                                <div>
                                    <strong>Thais</strong>
                                    <span>Studio Premium Estética Automotiva</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{padding: '40px 0'}}>
                <div className="section-container">
                    <div className="bento-card spotlight-card feature-wide" style={{textAlign: 'center', padding: '40px'}}>
                        <h2 style={{color: '#00f2fe', marginBottom: '16px', fontSize: '2rem'}}>Sem comissão por serviço. 100% do lucro é seu.</h2>
                        <p style={{fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-white)'}}>
                            Você paga uma mensalidade fixa e pronto. Cada agendamento recebido vai direto para o caixa, sem intermediário e sem taxa por transação.
                        </p>
                    </div>
                </div>
            </section>

            <section className="pricing-section" id="pricing">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Escolha o seu plano</h2>
                    </div>
                    
                    <div className="pricing-grid">
                        <div className="bento-card pricing-card">
                            <div className="plan-name">Plano Start</div>
                            <div className="plan-price">R$ <span className="number">97</span><span className="period">/mês</span></div>
                            <p className="plan-desc">Para começar a organizar sua agenda de lavagens.</p>
                            <ul className="plan-features">
                                <li><strong style={{color: 'var(--accent-cyan)'}}>🎁 7 Dias de Teste Grátis</strong></li>
                                <li>Página de Agendamento Padrão</li>
                                <li>Painel de Gestão de Veículos</li>
                                <li>Cadastro de Clientes (CRM)</li>
                                <li>Até 150 agendamentos/mês</li>
                            </ul>
                            <Link to="/login" className="lp-btn lp-btn-secondary lp-btn-block">Iniciar Teste Grátis</Link>
                        </div>
                        
                        <div className="bento-card pricing-card premium-card spotlight-card">
                            <div className="popular-badge">Mais Escolhido</div>
                            <div className="plan-name text-cyan">Plano Personalizado</div>
                            <div className="plan-price" style={{ fontSize: '1.5rem', marginTop: '10px', marginBottom: '10px' }}>Sob Consulta</div>
                            <p className="plan-desc">O seu WhatsApp no Piloto Automático.</p>
                            <ul className="plan-features">
                                <li>Tudo do Plano Profissional</li>
                                <li className="highlight-feature">Assistente IA de Agendamento (WhatsApp)</li>
                                <li>Implantação e Fluxos Customizados</li>
                                <li>Treinamento da IA com seus dados</li>
                                <li>Sem limites de agendamento</li>
                            </ul>
                            <a href="https://wa.me/5511913151641?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais%20sobre%20o%20Plano%20Personalizado%20do%20LavaZap%21" target="_blank" rel="noreferrer" className="lp-btn lp-btn-secondary lp-btn-block">Falar com Consultor</a>
                        </div>
                        
                        <div className="bento-card pricing-card">
                            <div className="plan-name">Plano Profissional</div>
                            <div className="plan-price">R$ <span className="number">197</span><span className="period">/mês</span></div>
                            <p className="plan-desc">Controle completo com a sua própria marca.</p>
                            <ul className="plan-features">
                                <li>Tudo do Plano Start</li>
                                <li className="highlight-feature">Sua Página Whitelabel (Cores e Logo)</li>
                                <li>Sincronização com Google Agenda</li>
                                <li>Relatórios de Faturamento</li>
                                <li>Até 500 agendamentos/mês</li>
                            </ul>
                            <Link to="/login" className="lp-btn lp-btn-primary lp-btn-block">Assinar Profissional</Link>
                        </div>
                    </div>
                </div>
            </section>

            <FaqSection />

            <footer className="footer">
                <div className="section-container text-center">
                    <h2>Teste o Plano Start por 7 dias grátis.</h2>
                    <p>Crie sua conta agora e veja na prática como o LavaZap vai organizar a sua agenda e atrair mais clientes.</p>
                    <Link to="/login" className="lp-btn lp-btn-primary lp-btn-large mt-4">Criar Minha Conta Agora</Link>
                    <div className="footer-bottom">
                        <p>&copy; 2026 LavaZap. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a href="https://wa.me/5511913151641?text=Ol%C3%A1%21%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20LavaZap." 
               target="_blank" 
               rel="noreferrer"
               style={{
                   position: 'fixed',
                   bottom: '30px',
                   right: '30px',
                   backgroundColor: '#25D366',
                   color: 'white',
                   width: '60px',
                   height: '60px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '30px',
                   boxShadow: '0 4px 10px rgba(37, 211, 102, 0.4)',
                   zIndex: 1000,
                   textDecoration: 'none',
                   transition: 'transform 0.3s ease'
               }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
               <i className="fa-brands fa-whatsapp"></i>
            </a>
        </div>
    );
}

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

    const toggle = (idx) => {
        setOpenIndex(prev => prev === idx ? null : idx);
    };

    return (
        <section className="faq-section" id="faq">
            <div className="section-container">
                <div className="section-header text-center">
                    <h2 className="section-title">Perguntas Frequentes</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
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
                                <div className="faq-answer-inner">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

