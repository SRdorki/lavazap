import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

export default function TutorialTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the tutorial
    const hasSeenTutorial = localStorage.getItem('lavazap_has_seen_tutorial');
    
    if (!hasSeenTutorial) {
      // Delay starting the tutorial slightly to ensure DOM is fully rendered
      setTimeout(() => {
        setRun(true);
      }, 1000);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status, action } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED, 'finished', 'skipped'];
    
    if (finishedStatuses.includes(status) || action === 'close') {
      // Mark tutorial as seen in local storage
      localStorage.setItem('lavazap_has_seen_tutorial', 'true');
      setRun(false);
    }
  };

  const steps = [
    {
      target: 'body',
      content: 'Bem-vindo ao LavaZap! 🚀 Preparamos um tour rápido para você conhecer o seu novo Painel de Gestão.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-step-menu',
      content: 'Aqui no Menu Lateral você navega entre o Dashboard (fila), Agenda, Clientes, Financeiro e Configurações.',
      placement: 'right',
    },
    {
      target: '.tour-step-kanban',
      content: 'Este é o seu Kanban. Você pode arrastar os veículos entre "Aguardando", "Lavando" e "Pronto" para organizar o fluxo.',
      placement: 'top',
    },
    {
      target: '.tour-step-novo-agendamento',
      content: 'Precisa adicionar um serviço que não foi agendado pelo link? Clique aqui no topo para cadastrar manualmente.',
      placement: 'bottom',
    },
    {
      target: '.tour-step-configuracoes',
      content: 'Acesse as Configurações para cadastrar seus serviços, preços e o seu Mercado Pago. É lá também que você copia seu Link de Agendamento!',
      placement: 'right',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#009ee3', // Cor do LavaZap/Mercado Pago
          textColor: '#333',
          backgroundColor: '#fff',
          arrowColor: '#fff',
        },
        buttonNext: {
          backgroundColor: '#009ee3',
        },
        buttonBack: {
          color: '#666',
        }
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Avançar',
        skip: 'Pular Tour'
      }}
    />
  );
}
