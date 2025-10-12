import { Router } from 'express';
import { contactListsController } from '../controllers/contact-lists.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', contactListsController.getContactLists);
router.get('/:id', contactListsController.getContactListById);
router.post('/', contactListsController.createContactList);
router.put('/:id', contactListsController.updateContactList);
router.delete('/:id', contactListsController.deleteContactList);
router.get('/:id/members', contactListsController.getListMembers);
router.post('/:id/members', contactListsController.addMemberToList);
router.delete('/:id/members/:memberId', contactListsController.removeMemberFromList);
router.get('/:id/export', contactListsController.exportCSV);
router.post('/:id/duplicate', contactListsController.duplicateList);

export default router;
