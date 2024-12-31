const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Define các quyền hạn trong system
const PermissionSchema = new Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User'},
    updatedAt: { type: Date}
});

// Role Schema
const RoleSchema = new Schema({
    name: { type: String, required: true},
    description: { type: String, default: '' },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }], //List permission
    isSystemRole: { type: Boolean, default: false }, // Vai trò không thể xóa/sửa
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User'},
    updatedAt: { type: Date}
});

const RolePermissionSchema = new Schema({
    role: { type: Schema.Types.ObjectId, ref: 'Role', require: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    description: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User'},
    updatedAt: { type: Date}
})
module.exports = {
    Role: mongoose.model('Role', RoleSchema),
    Permission: mongoose.model('Permission', PermissionSchema),
    RolePermission: mongoose.model('RolePermission', RolePermissionSchema)
};