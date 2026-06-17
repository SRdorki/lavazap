// Google Calendar Integration Module
// Utiliza Google Identity Services (GIS) + Google API Client (GAPI)

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

/**
 * Inicializa o GAPI client
 */
export async function initGapiClient() {
  return new Promise((resolve, reject) => {
    if (typeof gapi === 'undefined') {
      reject(new Error('GAPI não carregado'));
      return;
    }
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Inicializa o Google Identity Services (GIS) token client
 */
export function initGisClient(clientId, onTokenResponse) {
  if (typeof google === 'undefined' || !google.accounts) {
    console.warn('Google Identity Services não carregado');
    return false;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: onTokenResponse,
  });

  gisInited = true;
  return true;
}

/**
 * Solicita token de acesso (abre popup de login do Google)
 */
export function requestAccessToken() {
  if (!tokenClient) {
    alert('Erro: O Google Login não foi carregado corretamente. Recarregue a página e tente novamente.');
    console.error('Token client não inicializado');
    return;
  }

  try {
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err) {
    console.error('Erro ao chamar tokenClient', err);
  }
}

/**
 * Revoga o token (desconecta)
 */
export function revokeToken() {
  const token = gapi.client.getToken();
  if (token !== null && token !== '') {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken(null);
  }
}

/**
 * Verifica se está autenticado
 */
export function isAuthenticated() {
  return true; // Mockado para MVP (Sempre Conectado)
}

/**
 * Cria um evento no Google Calendar
 */
export async function createCalendarEvent({ summary, description, startDateTime, durationMinutes, location }) {
  console.log("Mock: Evento criado no Google Calendar", { summary, startDateTime });
  return { id: "mock_event_id_" + Date.now() };
}

/**
 * Lista eventos do Google Calendar para um intervalo de datas
 */
export async function listCalendarEvents(timeMin, timeMax) {
  console.log("Mock: Buscando eventos do Google Calendar");
  return [];
}

export default {
  initGapiClient,
  initGisClient,
  requestAccessToken,
  revokeToken,
  isAuthenticated,
  createCalendarEvent,
  listCalendarEvents,
};
