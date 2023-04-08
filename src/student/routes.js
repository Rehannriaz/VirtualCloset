const { Router } = require('express');

const controller = require('./controller');
const router = Router();


router.get('/',controller.getStudents);
router.post('/',controller.addUser);
router.get("/:id",controller.getid);
router.delete("/:id",controller.delUser);

module.exports = router;
