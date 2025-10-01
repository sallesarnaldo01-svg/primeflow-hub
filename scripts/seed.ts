import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'Demo Company',
      settings: {
        welcomeMessage: 'Olá! Como posso ajudar?',
        acceptAudio: true,
        lgpdEnabled: true,
      },
    },
  });
  console.log('✓ Tenant created:', tenant.name);

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@primeflow.dev' },
    update: {},
    create: {
      email: 'admin@primeflow.dev',
      name: 'Administrador',
      role: 'ADMIN',
      passwordHash,
      tenantId: tenant.id,
    },
  });
  console.log('✓ Admin user created:', admin.email);

  // Create default queue
  const queue = await prisma.queue.upsert({
    where: { id: 'default-queue' },
    update: {},
    create: {
      id: 'default-queue',
      name: 'Atendimento',
      description: 'Fila principal de atendimento',
      tenantId: tenant.id,
    },
  });
  console.log('✓ Queue created:', queue.name);

  // Create WhatsApp connection (mock)
  const connection = await prisma.connection.upsert({
    where: { id: 'whatsapp-demo' },
    update: {},
    create: {
      id: 'whatsapp-demo',
      name: 'WhatsApp Demo',
      type: 'WHATSAPP',
      status: 'DISCONNECTED',
      tenantId: tenant.id,
      meta: {
        phone: '+5511999999999',
        provider: 'baileys',
      },
    },
  });
  console.log('✓ Connection created:', connection.name);

  // Create default funnel stages
  const stageNames = ['Novo', 'Qualificado', 'Proposta', 'Negociação', 'Ganhos', 'Perdidos'];
  const stageColors = ['#6B7280', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

  for (let i = 0; i < stageNames.length; i++) {
    await prisma.stage.upsert({
      where: { id: `stage-${i}` },
      update: {},
      create: {
        id: `stage-${i}`,
        name: stageNames[i],
        order: i,
        color: stageColors[i],
        tenantId: tenant.id,
      },
    });
  }
  console.log('✓ Funnel stages created');

  // Create demo flow
  const flow = await prisma.flow.upsert({
    where: { id: 'welcome-flow' },
    update: {},
    create: {
      id: 'welcome-flow',
      name: 'Fluxo de Boas-vindas',
      status: 'PUBLISHED',
      version: 1,
      active: true,
      tenantId: tenant.id,
      queueId: queue.id,
      startNodeId: 'node-start',
    },
  });
  console.log('✓ Flow created:', flow.name);

  // Create flow nodes
  const startNode = await prisma.flowNode.create({
    data: {
      id: 'node-start',
      flowId: flow.id,
      type: 'START',
      label: 'Início',
      x: 100,
      y: 100,
      config: {},
    },
  });

  const contentNode = await prisma.flowNode.create({
    data: {
      id: 'node-content',
      flowId: flow.id,
      type: 'CONTENT',
      label: 'Mensagem de boas-vindas',
      x: 300,
      y: 100,
      config: {
        parts: [
          {
            kind: 'text',
            value: 'Olá {{contact.name}}! 👋\n\nSeja bem-vindo ao PrimeFlow!\n\nComo posso ajudar você hoje?',
          },
        ],
        delay: 1000,
      },
    },
  });

  const menuNode = await prisma.flowNode.create({
    data: {
      id: 'node-menu',
      flowId: flow.id,
      type: 'MENU',
      label: 'Menu principal',
      x: 500,
      y: 100,
      config: {
        text: 'Escolha uma opção:',
        options: [
          { key: '1', label: 'Falar com atendente', next: 'node-assign' },
          { key: '2', label: 'Informações', next: 'node-info' },
        ],
        captureTo: 'menuOption',
      },
    },
  });

  const assignNode = await prisma.flowNode.create({
    data: {
      id: 'node-assign',
      flowId: flow.id,
      type: 'ASSIGN_QUEUE',
      label: 'Atribuir à fila',
      x: 700,
      y: 50,
      config: {
        queueId: queue.id,
      },
    },
  });

  const infoNode = await prisma.flowNode.create({
    data: {
      id: 'node-info',
      flowId: flow.id,
      type: 'CONTENT',
      label: 'Informações',
      x: 700,
      y: 150,
      config: {
        parts: [
          {
            kind: 'text',
            value:
              '📚 PrimeFlow é uma plataforma completa de automação de atendimento.\n\nVisite: https://primeflow.dev',
          },
        ],
      },
    },
  });

  // Create flow edges
  await prisma.flowEdge.createMany({
    data: [
      { id: 'edge-1', flowId: flow.id, sourceId: startNode.id, targetId: contentNode.id },
      { id: 'edge-2', flowId: flow.id, sourceId: contentNode.id, targetId: menuNode.id },
      {
        id: 'edge-3',
        flowId: flow.id,
        sourceId: menuNode.id,
        targetId: assignNode.id,
        label: 'Opção 1',
      },
      {
        id: 'edge-4',
        flowId: flow.id,
        sourceId: menuNode.id,
        targetId: infoNode.id,
        label: 'Opção 2',
      },
    ],
  });
  console.log('✓ Flow nodes and edges created');

  // Create demo tags
  await prisma.tag.createMany({
    data: [
      { id: 'tag-whatsapp-vip', tenantId: tenant.id, name: 'VIP', source: 'WHATSAPP', color: '#F59E0B' },
      {
        id: 'tag-whatsapp-urgente',
        tenantId: tenant.id,
        name: 'Urgente',
        source: 'WHATSAPP',
        color: '#EF4444',
      },
      {
        id: 'tag-crm-cliente',
        tenantId: tenant.id,
        name: 'Cliente',
        source: 'CRM',
        color: '#10B981',
      },
      { id: 'tag-crm-lead', tenantId: tenant.id, name: 'Lead', source: 'CRM', color: '#3B82F6' },
    ],
  });
  console.log('✓ Tags created');

  // Create demo campaign phrase
  await prisma.campaignPhrase.create({
    data: {
      id: 'campaign-demo',
      name: 'Campanha: Olá',
      flowId: flow.id,
      connectionId: connection.id,
      phrase: 'olá|oi|ola|hello',
      active: true,
      tenantId: tenant.id,
    },
  });
  console.log('✓ Campaign phrase created');

  console.log('\n✅ Seeding completed successfully!\n');
  console.log('Login credentials:');
  console.log('  Email: admin@primeflow.dev');
  console.log('  Password: admin123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
