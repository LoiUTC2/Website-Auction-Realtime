const express = require('express');
const router = express.Router();

const { createRole,
        createPermission,
        createRolePermission,
        updateRolePermission,
        getAllRolePermissions,
        getRolePermissionsById,
        getRolePermissionsByIdUser,
        deleteRolePermission,
    } = require('../controllers/RoleController');

router.post('/createRole', createRole);
router.post('/createPermission', createPermission);
router.post('/createRolePermission', createRolePermission);
router.put('/updateRolePermission/:id_RolePermission', updateRolePermission);
router.delete('/deleteRolePermission/:id_RolePermission', deleteRolePermission);
router.get('/getAllRolePermission', getAllRolePermissions);
router.get('/getRolePermissionById/:id_RolePermission', getRolePermissionsById);
router.get('/getRolePermissionByIdUser/:id_User', getRolePermissionsByIdUser);


module.exports = router;