const router=require('express').Router();

const NotificatonController=require('../controller/NotificationController');

router.get('/get-notice',NotificatonController.getNotification);
router.post('/query-notification',NotificatonController.generateNotificationForQuery);
router.get('/get-unread-count',NotificatonController.getUnreadNotificationCount);
router.post('/mark-allread',NotificatonController.markAllAsRead);


module.exports=router;