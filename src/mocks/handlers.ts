import { http, HttpResponse } from 'msw';
import { mockData } from './data';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any;
    
    if (email === 'admin@primezap.com' && password === '123456') {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: '1',
            name: 'Admin PrimeZap',
            email: 'admin@primezap.com',
            avatar: null,
            role: 'admin',
            workspace: 'primezap-workspace',
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }

    return HttpResponse.json(
      { success: false, message: 'Credenciais inválidas' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: { message: 'E-mail de verificação enviado com sucesso!' },
    });
  }),

  http.post('/api/auth/reset-password', async ({ request }) => {
    const { email } = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: { message: 'E-mail de recuperação enviado!' },
    });
  }),

  http.post('/api/auth/sso/google/init', () => {
    return HttpResponse.json({
      success: true,
      data: {
        redirectUrl: 'https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=mock',
        state: 'mock-state',
        codeChallenge: 'mock-challenge',
      },
    });
  }),

  http.post('/api/auth/sso/google/callback', async ({ request }) => {
    const { code, state } = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '2',
          name: 'Usuário Google',
          email: 'user@gmail.com',
          avatar: 'https://lh3.googleusercontent.com/a/default-user',
          role: 'agent',
          workspace: 'primezap-workspace',
        },
        token: 'mock-google-jwt-token',
        refreshToken: 'mock-google-refresh-token',
      },
    });
  }),

  // Deals endpoints
  http.get('/api/deals', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const stage = url.searchParams.get('stage');

    let deals = mockData.deals;
    if (stage) {
      deals = deals.filter(deal => deal.stage === stage);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDeals = deals.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedDeals,
        pagination: {
          page,
          limit,
          total: deals.length,
          totalPages: Math.ceil(deals.length / limit),
        },
      },
    });
  }),

  http.get('/api/deals/stages', () => {
    return HttpResponse.json({
      success: true,
      data: mockData.stages,
    });
  }),

  http.put('/api/deals/:id/move', async ({ params, request }) => {
    const { targetStage } = await request.json() as any;
    const dealId = params.id as string;
    
    const deal = mockData.deals.find(d => d.id === dealId);
    if (deal) {
      deal.stage = targetStage;
      deal.updatedAt = new Date().toISOString();
    }

    return HttpResponse.json({
      success: true,
      data: deal,
    });
  }),

  // Events endpoints  
  http.get('/api/events', ({ request }) => {
    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    let events = mockData.events;
    if (start && end) {
      events = events.filter(event => 
        event.start >= start && event.start <= end
      );
    }

    return HttpResponse.json({
      success: true,
      data: events,
    });
  }),

  http.post('/api/events', async ({ request }) => {
    const eventData = await request.json() as any;
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      createdBy: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockData.events.push(newEvent);

    return HttpResponse.json({
      success: true,
      data: newEvent,
    });
  }),

  http.put('/api/events/:id/move', async ({ params, request }) => {
    const { start, end } = await request.json() as any;
    const eventId = params.id as string;
    
    const event = mockData.events.find(e => e.id === eventId);
    if (event) {
      event.start = start;
      event.end = end;
      event.updatedAt = new Date().toISOString();
    }

    return HttpResponse.json({
      success: true,
      data: event,
    });
  }),

  // Conversations endpoints
  http.get('/api/conversations', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const status = url.searchParams.get('status');
    const channel = url.searchParams.get('channel');

    let conversations = mockData.conversations;
    if (status) {
      conversations = conversations.filter(conv => conv.status === status);
    }
    if (channel) {
      conversations = conversations.filter(conv => conv.channel === channel);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConversations = conversations.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedConversations,
        pagination: {
          page,
          limit,
          total: conversations.length,
          totalPages: Math.ceil(conversations.length / limit),
        },
      },
    });
  }),

  http.get('/api/conversations/:id/messages', ({ params, request }) => {
    const conversationId = params.id as string;
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 50;

    const messages = mockData.messages.filter(msg => msg.conversationId === conversationId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = messages.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedMessages,
        pagination: {
          page,
          limit,
          total: messages.length,
          totalPages: Math.ceil(messages.length / limit),
        },
      },
    });
  }),

  // Tags endpoints
  http.get('/api/tags', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    let tags = mockData.tags;
    if (search) {
      tags = tags.filter(tag =>
        tag.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        data: tags,
        pagination: {
          page: 1,
          limit: 50,
          total: tags.length,
          totalPages: 1,
        },
      },
    });
  }),

  // Companies endpoints
  http.get('/api/companies', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCompanies = mockData.companies.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedCompanies,
        pagination: {
          page,
          limit,
          total: mockData.companies.length,
          totalPages: Math.ceil(mockData.companies.length / limit),
        },
      },
    });
  }),

  // Tickets endpoints
  http.get('/api/tickets', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = mockData.tickets.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedTickets,
        pagination: {
          page,
          limit,
          total: mockData.tickets.length,
          totalPages: Math.ceil(mockData.tickets.length / limit),
        },
      },
    });
  }),
];