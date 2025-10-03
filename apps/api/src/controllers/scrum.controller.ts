import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { emitToTenant } from '../lib/socket.js';
import { AppError } from '../middleware/error.js';

class ScrumController {
  // Teams
  async listTeams(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    
    const teams = await prisma.scrumTeam.findMany({
      where: { tenantId },
      include: {
        members: true,
        sprints: { take: 1, orderBy: { startDate: 'desc' } },
        _count: { select: { members: true, sprints: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(teams);
  }

  async createTeam(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { name, description, members } = req.body;

    const team = await prisma.scrumTeam.create({
      data: {
        tenantId,
        name,
        description,
        members: {
          create: members?.map((m: any) => ({
            userId: m.userId,
            name: m.name,
            email: m.email,
            role: m.role,
            avatar: m.avatar
          }))
        }
      },
      include: { members: true }
    });

    emitToTenant(tenantId, 'scrum:team:created', team);
    res.status(201).json(team);
  }

  async updateTeam(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await prisma.scrumTeam.update({
      where: { id, tenantId },
      data: { name, description },
      include: { members: true }
    });

    emitToTenant(tenantId, 'scrum:team:updated', team);
    res.json(team);
  }

  // Sprints
  async listSprints(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { teamId } = req.query;

    const sprints = await prisma.sprint.findMany({
      where: { 
        team: { tenantId },
        ...(teamId && { teamId: teamId as string })
      },
      include: {
        backlogItems: true,
        team: { select: { name: true } }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json(sprints);
  }

  async createSprint(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { teamId, name, startDate, endDate, goal, totalStoryPoints } = req.body;

    // Verify team belongs to tenant
    const team = await prisma.scrumTeam.findFirst({
      where: { id: teamId, tenantId }
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    const sprint = await prisma.sprint.create({
      data: {
        teamId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        goal,
        totalStoryPoints: totalStoryPoints || 0,
        status: 'PLANNED'
      },
      include: { team: true }
    });

    emitToTenant(tenantId, 'scrum:sprint:created', sprint);
    res.status(201).json(sprint);
  }

  async updateSprint(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const { name, startDate, endDate, goal, status, completedStoryPoints } = req.body;

    const sprint = await prisma.sprint.update({
      where: { 
        id,
        team: { tenantId }
      },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(goal && { goal }),
        ...(status && { status }),
        ...(completedStoryPoints !== undefined && { completedStoryPoints })
      },
      include: { backlogItems: true }
    });

    emitToTenant(tenantId, 'scrum:sprint:updated', sprint);
    res.json(sprint);
  }

  async deleteSprint(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    await prisma.sprint.delete({
      where: { 
        id,
        team: { tenantId }
      }
    });

    emitToTenant(tenantId, 'scrum:sprint:deleted', { id });
    res.status(204).send();
  }

  // Backlog
  async listBacklog(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { sprintId } = req.query;

    const items = await prisma.backlogItem.findMany({
      where: { 
        tenantId,
        ...(sprintId && { sprintId: sprintId as string })
      },
      include: {
        sprint: { select: { name: true, status: true } }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(items);
  }

  async createBacklogItem(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { sprintId, type, title, description, points, priority, assignee, epic } = req.body;

    const item = await prisma.backlogItem.create({
      data: {
        tenantId,
        sprintId,
        type,
        title,
        description,
        points: points || 0,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        assignee,
        epic
      }
    });

    emitToTenant(tenantId, 'scrum:backlog:created', item);
    res.status(201).json(item);
  }

  async updateBacklogItem(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const updates = req.body;

    const item = await prisma.backlogItem.update({
      where: { id, tenantId },
      data: updates
    });

    emitToTenant(tenantId, 'scrum:backlog:updated', item);
    res.json(item);
  }

  async moveBacklogItem(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const { status } = req.body;

    const item = await prisma.backlogItem.update({
      where: { id, tenantId },
      data: { status }
    });

    emitToTenant(tenantId, 'scrum:backlog:moved', item);
    res.json(item);
  }

  async deleteBacklogItem(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    await prisma.backlogItem.delete({
      where: { id, tenantId }
    });

    emitToTenant(tenantId, 'scrum:backlog:deleted', { id });
    res.status(204).send();
  }

  // Ceremonies
  async listCeremonies(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { teamId } = req.query;

    const ceremonies = await prisma.ceremony.findMany({
      where: { 
        team: { tenantId },
        ...(teamId && { teamId: teamId as string })
      },
      include: {
        team: { select: { name: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json(ceremonies);
  }

  async createCeremony(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { teamId, name, type, scheduledAt, duration, participants } = req.body;

    const team = await prisma.scrumTeam.findFirst({
      where: { id: teamId, tenantId }
    });

    if (!team) {
      throw new AppError('Team not found', 404);
    }

    const ceremony = await prisma.ceremony.create({
      data: {
        teamId,
        name,
        type,
        scheduledAt: new Date(scheduledAt),
        duration,
        participants: participants || [],
        status: 'SCHEDULED'
      }
    });

    emitToTenant(tenantId, 'scrum:ceremony:created', ceremony);
    res.status(201).json(ceremony);
  }

  async updateCeremony(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const updates = req.body;

    const ceremony = await prisma.ceremony.update({
      where: { 
        id,
        team: { tenantId }
      },
      data: updates
    });

    emitToTenant(tenantId, 'scrum:ceremony:updated', ceremony);
    res.json(ceremony);
  }

  async startCeremony(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    const ceremony = await prisma.ceremony.update({
      where: { 
        id,
        team: { tenantId }
      },
      data: { status: 'IN_PROGRESS' }
    });

    emitToTenant(tenantId, 'scrum:ceremony:started', ceremony);
    res.json(ceremony);
  }
}

export const scrumController = new ScrumController();
