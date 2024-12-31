import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilWatch,
  cibProcesswire,
  cilUser,
  cilStorage,
  cibAppStore
  
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];

const hasPermission = (permission) => permissionValue.includes(permission);

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Quản lý đấu giá',
  },
  // {
  //   component: CNavItem,
  //   name: 'Phê duyệt phiên',
  //   to: '/auction/approve',
  //   icon: <CIcon icon={cibAppStore} customClassName="nav-icon" />,

  // },
  {
    component: CNavItem,
    name: 'Quản lý đấu giá',
    to: '/auction/manager',
    icon: <CIcon icon={cibAppStore} customClassName="nav-icon" />,

  },
  
  {
    component: CNavTitle,
    name: 'Nhân sự',
  },
  {
    component: CNavItem,
    name: 'Quản lý nhân viên',
    to: '/user/manager',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    disabled: hasPermission([1,2,3,4]),
  },
  {
    component: CNavItem,
    name: 'Phân quyền',
    to: '/user/role',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
    disabled: hasPermission([5,6,7,8]),
  },

  {
    component: CNavTitle,
    name: 'Sản phẩm',
  },
  {
    component: CNavGroup,
    name: 'Quản lý sản phẩm',
    to: '/base',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Sản phẩm',
        to: '/product',
      },
    ],
    disabled: hasPermission([10,11,12,13]),
  },
]

export default _nav
