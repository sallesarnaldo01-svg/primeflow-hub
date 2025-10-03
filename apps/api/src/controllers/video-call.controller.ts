import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { emitToTenant } from '../lib/socket.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

class VideoCallController {
  async createRoom(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { teamId, topic, participants } = req.body;

    // Generate unique room ID
    const roomId = `scrum-${teamId}-${Date.now()}`;

    // Create video call record
    const videoCall = await prisma.videoCall.create({
      data: {
        teamId,
        roomId,
        topic: topic || 'Scrum Meeting',
        startedAt: new Date(),
        participants: participants || []
      }
    });

    // Generate JWT token for Jitsi (if using self-hosted with JWT)
    const jitsiToken = jwt.sign(
      {
        context: {
          user: {
            id: req.user!.userId,
            name: req.user!.name || 'User',
            email: req.user!.email
          }
        },
        room: roomId,
        aud: 'jitsi',
        iss: 'primeflow',
        sub: 'meet.primeflow.app',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 4) // 4 hours
      },
      env.JWT_SECRET
    );

    emitToTenant(tenantId, 'video:call:created', {
      ...videoCall,
      token: jitsiToken
    });

    res.status(201).json({
      ...videoCall,
      token: jitsiToken,
      jitsiUrl: `https://meet.jit.si/${roomId}`
    });
  }

  async endCall(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;

    const videoCall = await prisma.videoCall.update({
      where: { 
        id,
        team: { tenantId }
      },
      data: {
        endedAt: new Date()
      }
    });

    emitToTenant(tenantId, 'video:call:ended', videoCall);
    res.json(videoCall);
  }

  async listCalls(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { teamId } = req.query;

    const calls = await prisma.videoCall.findMany({
      where: { 
        team: { tenantId },
        ...(teamId && { teamId: teamId as string })
      },
      include: {
        team: { select: { name: true } }
      },
      orderBy: { startedAt: 'desc' },
      take: 50
    });

    res.json(calls);
  }
}

export const videoCallController = new VideoCallController();
