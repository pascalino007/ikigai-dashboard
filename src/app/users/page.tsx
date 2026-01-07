'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, User, Mail, Phone, Shield, Calendar } from 'lucide-react'
import { User as UserType } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { UserForm } from '@/components/forms/user-form'

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://168.231.101.119:4040/auth')
        const data = await res.json()

        // MAP API RESPONSE → UserType used in UI
        const formatted: UserType[] = data.map((u: any) => ({
          id: u.id.toString(),
          firstName: u.firstname || '',
          lastName: u.lastname || '',
          email: u.email,
          phone: u.phone || '',
          role: u.role === 'user' ? 'customer' : u.role, 
          profilePicture: u.image || undefined,
          isActive: u.is_active,
          lastLogin: null,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.createdAt ? new Date(u.createdAt) : new Date()
        }))

        setUsers(formatted)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])


  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))

    const matchesRole =
      filterRole === 'all' || user.role === filterRole

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })


  const handleAddUser = async (data: any) => {
    const newUser: UserType = {
      id: Date.now().toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || '',
      role: data.role,
      profilePicture: data.profilePicture ? URL.createObjectURL(data.profilePicture) : undefined,
      isActive: data.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setUsers(prev => [newUser, ...prev])
    setShowAddModal(false)
  }


  const handleUpdateUser = async (data: any) => {
    if (!editingUser) return

    const updatedUser: UserType = {
      ...editingUser,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || '',
      role: data.role,
      profilePicture: data.profilePicture
        ? URL.createObjectURL(data.profilePicture)
        : editingUser.profilePicture,
      isActive: data.isActive !== false,
      updatedAt: new Date()
    }

    setUsers(prev => prev.map(u => (u.id === editingUser.id ? updatedUser : u)))
    setEditingUser(null)
  }


  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, isActive: !u.isActive, updatedAt: new Date() }
          : u
      )
    )
  }

 
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'provider':
        return 'bg-green-100 text-green-800'
      case 'customer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

 
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

 
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-gray-600">Loading users...</div>
      </DashboardLayout>
    )
  }


  return (
    <DashboardLayout>
      <div className="p-6">

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600 mt-2">Manage system users and their roles</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="provider">Provider</option>
                <option value="customer">Customer</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table (UNCHANGED) */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">

                    {/* USER */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {user.firstName[0] || '?'}
                              {user.lastName[0] || ''}
                            </span>
                          )}
                        </div>

                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>

                      {user.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {user.phone}
                        </div>
                      )}
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* LAST LOGIN */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.lastLogin ? (
                        <>
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {user.lastLogin.toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.lastLogin.toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Never</span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          className={
                            user.isActive
                              ? 'text-orange-600 hover:text-orange-700'
                              : 'text-green-600 hover:text-green-700'
                          }
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <User className="h-12 w-12" />
            </div>

            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first user.'}
            </p>

            {!searchTerm && filterRole === 'all' && filterStatus === 'all' && (
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First User
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ADD USER MODAL */}
        <UserForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
        />

        {/* EDIT USER MODAL */}
        <UserForm
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
          initialData={editingUser}
        />
      </div>
    </DashboardLayout>
  )
}
