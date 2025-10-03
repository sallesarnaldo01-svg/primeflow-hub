import { Router } from 'express';
import { scrumController } from '../controllers/scrum.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const router = Router();

// Teams
router.get('/teams', authenticate, asyncHandler(scrumController.listTeams));
router.post('/teams', authenticate, asyncHandler(scrumController.createTeam));
router.put('/teams/:id', authenticate, asyncHandler(scrumController.updateTeam));

// Sprints
router.get('/sprints', authenticate, asyncHandler(scrumController.listSprints));
router.post('/sprints', authenticate, asyncHandler(scrumController.createSprint));
router.put('/sprints/:id', authenticate, asyncHandler(scrumController.updateSprint));
router.delete('/sprints/:id', authenticate, asyncHandler(scrumController.deleteSprint));

// Backlog
router.get('/backlog', authenticate, asyncHandler(scrumController.listBacklog));
router.post('/backlog', authenticate, asyncHandler(scrumController.createBacklogItem));
router.put('/backlog/:id', authenticate, asyncHandler(scrumController.updateBacklogItem));
router.put('/backlog/:id/status', authenticate, asyncHandler(scrumController.moveBacklogItem));
router.delete('/backlog/:id', authenticate, asyncHandler(scrumController.deleteBacklogItem));

// Ceremonies
router.get('/ceremonies', authenticate, asyncHandler(scrumController.listCeremonies));
router.post('/ceremonies', authenticate, asyncHandler(scrumController.createCeremony));
router.put('/ceremonies/:id', authenticate, asyncHandler(scrumController.updateCeremony));
router.post('/ceremonies/:id/start', authenticate, asyncHandler(scrumController.startCeremony));

export default router;
