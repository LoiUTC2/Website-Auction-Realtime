const { formatResponse } = require('../common/MethodsCommon');
const Role_Permission = require('../models/Role&Permission');
const asyncHandle = require('express-async-handler');
const { User } = require('../models/user.model');

const createRole = asyncHandle(async (req, res) => {
    const { name, description, permissions, createdBy } = req.body;

    try {
        const validPermissions = await Role_Permission.Permission.find({ 
            '_id': { $in: permissions } 
        });

        // if (validPermissions.length !== permissions.length) {
        //     return res.status(400).json(formatResponse(false, null, "One or more permissions are invalid"));
        // }
        
        const role = await Role_Permission.Role.create({
            name: name,
            description: description,
            permissions: permissions, 
            createdBy: createdBy,
        });

        const data = {
            _id: role._id,
            name: role.name,
            description: role.description,
            permissions: role.permissions, 
            createdBy: role.createdBy,
        };

       
        return res.status(200).json(formatResponse(true, data, "Create Role Successfully"));

    } catch (error) {
        return res.status(500).json(formatResponse(false, null, error.message));
    }
});

const createPermission = asyncHandle( async (req, res)=> {
    const key = req.body.key;
    const name = req.body.name;
    const description = req.body.description;
    const createdBy = req.body.createdBy;

    const permission = await Role_Permission.Permission.create({
        key: key,
        name: name,
        description: description,
        createdBy: createdBy,
    })
    const data = {
        _id: permission._id,
        key: permission.key,
        name: permission.name,
        description: permission.description,
        createdBy: permission.createdBy,
    }
    return res.status(200).json(formatResponse(true, data, "Create Permission Successfully"));
});

// const createRolePermission = asyncHandle( async (req, res)=> {
//     const id_Role = req.body.id_Role;
//     const id_Permission = req.body.id_Permission
//     const description = req.body.description;
//     const createdBy = req.body.createdBy;

//     // const role = await Role_Permission.Role.create({
//     //     name: name,
//     //     description: description,
//     //     createdBy: createdBy,
//     // });

//     const rolePermission = await Role_Permission.RolePermission.create({
//         role: id_Role,
//         permissions: id_Permission,
//         description: description,
//         createdBy: createdBy,
//     });

//     const data = {
//         _id: rolePermission._id,
//         role: rolePermission.role,
//         permissions: rolePermission.permissions,
//         description: rolePermission.description,
//         createdBy: rolePermission.createdBy,
//     }
//     return res.status(200).json(formatResponse(true, data, "Create RolePermission Successfully"));

// });

const createRolePermission = asyncHandle( async (req, res)=> {
    const id_Role = req.body.id_Role !== undefined ? req.body.id_Role : null;
    const id_Permission = req.body.id_Permission !== undefined ? req.body.id_Permission : [];
    const name = req.body.name;
    const description = req.body.description;
    const createdBy = req.body.createdBy;

    try {
        if (id_Role) {
            const existingRole = await Role_Permission.Role.findById(id_Role);
            if (!existingRole) {
                return res.status(404).json(formatResponse(false, null, "Role not found."));
            }
        }

        let role;
        if(id_Role === null){
            role = await Role_Permission.Role.create({
                name: name,
                description: description,
                createdBy: createdBy,
            });
            
        }
        const rolePermission = await Role_Permission.RolePermission.create({
            role: role ? role._id : id_Role,
            permissions: id_Permission,
            description: role.description,
            createdBy: role.createdBy,
        });

        const data = {
            _id: rolePermission._id,
            role: rolePermission.role,
            description: rolePermission.description,
            createdBy: rolePermission.createdBy,
        }
        return res.status(200).json(formatResponse(true, data, "Tạo vai trò thành công"));
    } catch (error) {
        console.error("Error creating RolePermission:", error);
        return res.status(500).json(formatResponse(false, null, "Internal Server Error"));
    }
});

const updateRolePermission = asyncHandle( async (req, res)=> {
    const { id_RolePermission } = req.params;
    // const { id_Permission } = req.body.id_Permission !== undefined ? req.body.id_Permission : [];
    const keyArray = req.body.key;
    const name = req.body.name;
    const description = req.body.description;
    const updatedBy = req.body.updatedBy;

    try {

        let keyArrayAsString = [];

        if (Array.isArray(req.body.key) && req.body.key.length > 0) {
            keyArrayAsString = req.body.key.map(item => item.toString());
        }

        let permissions, id_permissions = [];

        if (keyArrayAsString.length > 0) {
            permissions = await Role_Permission.Permission.find({
                key: { $in: keyArrayAsString } // Tìm các Permission có key trong mảng keyArray
            });
            id_permissions = permissions.map(permission => permission._id);
        }

        const rolePermisson = await Role_Permission.RolePermission.findById(id_RolePermission);
        if(!rolePermisson){
            return res.status(400).json(formatResponse(false, null, "RolePermission no exists"));
        }
        const id_Role = rolePermisson.role;

        const role = await Role_Permission.Role.findById(id_Role);
        const isSystemRole = role.isSystemRole;
        if(isSystemRole){
            return res.status(400).json(formatResponse(false, null, "Không thể thay đổi vai trò mặc định"));
        }
    
        //kiểm tra rolePermisson đều có role và permission giống nhau
        // const existingRolePermission = await Role_Permission.RolePermission.findOne({
        //     role: id_Role,
        //     permissions: { $all: id_permissions },  // Kiểm tra xem tất cả phần tử trong id_permissions có trong permissions không
        //     $expr: { $eq: [{ $size: "$permissions" }, id_permissions.length] } // So sánh độ dài mảng
        // });
    
        // if (existingRolePermission) {
        //     return res.status(400).json(formatResponse(false, null, "Role and Permission combination already exists"));
        // }
               
        const roleUpdate = await Role_Permission.Role.findByIdAndUpdate(id_Role, {
              name: name,
              description: description,
              permissions: id_permissions,
              updatedBy: updatedBy,
              updatedAt: new Date(),
            });
          
        const rolePermissionUpdate = await Role_Permission.RolePermission.findByIdAndUpdate(id_RolePermission, {
              permissions: id_permissions,
              description: description,
              updatedBy: updatedBy,
              updatedAt: new Date(),
            });

        const data = {
            _id: rolePermissionUpdate._id,
            role: rolePermissionUpdate.role,
            permissions: rolePermissionUpdate.permissions,
            updatedBy: rolePermissionUpdate.updatedBy,
            updatedAt: rolePermissionUpdate.updatedAt,
        }
        if(id_permissions.length>0){
            res.status(200).json(formatResponse(true, data, "Chỉnh sửa quyền cho vai trò thành công"));       
        }else  res.status(200).json(formatResponse(true, data, "Chỉnh sửa vai trò thành công"));       

    } catch (error) {
        console.error("Error update RolePermission:", error);
        res.status(500).json(formatResponse(false, null, error.message));
    }
    

});

const deleteRolePermission = asyncHandle( async (req, res)=> {
    const { id_RolePermission } = req.params;
    
    try {
        if (id_RolePermission) {
            const existingRolePermission = await Role_Permission.RolePermission.findById(id_RolePermission);
            if (!existingRolePermission) {
                return res.status(404).json(formatResponse(false, null, "RolePermission not found."));
            }
        }
        const rolePermission = await Role_Permission.RolePermission.findById(id_RolePermission)
        const id_Role = rolePermission.role;

        const role = await Role_Permission.Role.findById(id_Role);
        const isSystemRole = role.isSystemRole;
        if(isSystemRole){
            return res.status(400).json(formatResponse(false, null, "Không thể xóa vai trò mặc định"));
        }

        const roleDelete = await Role_Permission.Role.findByIdAndDelete(id_Role)

        const rolePermissionDelete = await Role_Permission.RolePermission.findByIdAndDelete(id_RolePermission)

        return res.status(200).json(formatResponse(true, null, "Xóa vai trò thành công"));
    } catch (error) {
        console.error("Error delete RolePermission:", error);
        return res.status(500).json(formatResponse(false, null, error.message));
    }
});

const getAllRolePermissions = asyncHandle(async (req, res) => {
    try {
        const allRolePermissions = await Role_Permission.RolePermission.find().populate('role') 
        .populate('permissions').populate('createdBy').populate('updatedBy').sort({ createdAt: 1 });;
        const data = allRolePermissions.map(rolePermission => ({
            _id: rolePermission._id,
            role: rolePermission.role,
            permissions: rolePermission.permissions,
            description: rolePermission.description,
            createdAt: rolePermission.createdAt,
            createdBy: rolePermission.createdBy,
            updatedAt: rolePermission.updatedAt,
            updatedBy: rolePermission.updatedBy,
        }));

        return res.status(200).json(formatResponse(true, data, "Retrieve all RolePermissions successfully"));
    } catch (error) {
        return res.status(500).json(formatResponse(false, null, error.message));
    }
});

const getRolePermissionsById = asyncHandle(async (req, res) => {
    const { id_RolePermission } = req.params;
    try {
        const rolePermissions = await Role_Permission.RolePermission.findById(id_RolePermission).populate('role') 
        .populate('permissions').populate('createdBy', 'username').populate('updatedBy');
        

        const data = {
            _id: rolePermissions._id,
            role: rolePermissions.role,
            permissions: rolePermissions.permissions,
            description: rolePermissions.description,
            createdAt: rolePermissions.createdAt,
            createdBy: rolePermissions.createdBy,
            updatedAt: rolePermissions.updatedAt,
            updatedBy: rolePermissions.updatedBy,
        };

        return res.status(200).json(formatResponse(true, data, "Retrieve RolePermissionsByID successfully"));
    } catch (error) {
        return res.status(500).json(formatResponse(false, null, error.message));
    }
});


const getRolePermissionsByIdUser = asyncHandle(async (req, res) => {
    const { id_User } = req.params;
    try {
        const user = await User.findById(id_User);
        if(!user){
            return res.status(400).json(formatResponse(false, null, 'Không tìm thấy User'))
        }
        const id_RolePermission = user.rolePermission;
        const rolePermission = await Role_Permission.RolePermission.findById(id_RolePermission).populate('role').populate('permissions').populate('createdBy').populate('updatedBy');

        if (!rolePermission || !rolePermission.role) {
            return res.status(404).json(formatResponse(false, null, 'Không tìm thấy RolePermission'))
        }

        return res.status(200).json(formatResponse(true, rolePermission, 'Lấy rolePermisson dựa vào id_User thành công'))

    } catch (error) {
        return res.status(500).json(formatResponse(false, null, error.message));
    }
});

module.exports = {
    createRole,
    createPermission,
    createRolePermission,
    updateRolePermission,
    deleteRolePermission,
    getAllRolePermissions,
    getRolePermissionsById,
    getRolePermissionsByIdUser,
}