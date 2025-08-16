"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Users,
	Search,
	Crown,
	User,
	Mail,
	Calendar,
	ShoppingBag,
	Shield,
	Loader2,
	MoreVertical,
	Ban,
	UserCheck,
	Trash2,
	Filter,
	Download,
	Eye,
	X,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";

interface User {
	_id: string;
	clerkId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	imageUrl?: string;
	role: "user" | "admin";
	banned: boolean;
	purchases: string[];
	totalPurchases: number;
	totalSpent: number;
	lastPurchase?: Date;
	createdAt: Date;
	lastSignInAt?: Date;
	hasMongoProfile: boolean;
}

interface UserManagementState {
	users: User[];
	loading: boolean;
	searchQuery: string;
	roleFilter: "all" | "admin" | "user";
	statusFilter: "all" | "active" | "banned";
	selectedUsers: string[];
	showUserDetails: boolean;
	selectedUser: User | null;
	showBulkActions: boolean;
	showDeleteConfirm: boolean;
	deletingUser: User | null;
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export default function AdminUserManagement() {
	const [state, setState] = useState<UserManagementState>({
		users: [],
		loading: true,
		searchQuery: "",
		roleFilter: "all",
		statusFilter: "all",
		selectedUsers: [],
		showUserDetails: false,
		selectedUser: null,
		showBulkActions: false,
		showDeleteConfirm: false,
		deletingUser: null,
		pagination: {
			page: 1,
			limit: 20,
			totalCount: 0,
			totalPages: 0,
			hasNext: false,
			hasPrev: false,
		},
	});

	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

	useEffect(() => {
		fetchUsers();
	}, [state.roleFilter, state.statusFilter, state.pagination.page]);

	const fetchUsers = async () => {
		setState((prev) => ({ ...prev, loading: true }));

		try {
			const params = new URLSearchParams({
				page: state.pagination.page.toString(),
				limit: state.pagination.limit.toString(),
				role: state.roleFilter !== "all" ? state.roleFilter : "",
				search: state.searchQuery,
			});

			const response = await fetch(`/api/admin/users?${params}`);
			if (response.ok) {
				const data = await response.json();
				const users = data.data?.users || [];

				// Apply status filter on frontend since API doesn't handle it
				const filteredUsers =
					state.statusFilter === "all"
						? users
						: users.filter((user: User) => (state.statusFilter === "banned" ? user.banned : !user.banned));

				setState((prev) => ({
					...prev,
					users: filteredUsers,
					pagination: data.data?.pagination || prev.pagination,
					loading: false,
				}));
			} else {
				console.error("Failed to fetch users:", response.statusText);
				setState((prev) => ({ ...prev, loading: false, users: [] }));
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			setState((prev) => ({ ...prev, loading: false, users: [] }));
		}
	};

	// Handle search with debounce
	const handleSearchChange = (value: string) => {
		setState((prev) => ({ ...prev, searchQuery: value }));

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		const timeout = setTimeout(() => {
			fetchUsers();
		}, 500);

		setSearchTimeout(timeout);
	};

	const updateUserRole = async (userId: string, newRole: "user" | "admin") => {
		try {
			const response = await fetch("/api/admin/users", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: userId, role: newRole }),
			});

			if (response.ok) {
				fetchUsers();
			}
		} catch (error) {
			console.error("Error updating user role:", error);
		}
	};

	const toggleUserBan = async (userId: string, banned: boolean) => {
		try {
			const response = await fetch("/api/admin/users", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: userId, banned }),
			});

			if (response.ok) {
				fetchUsers();
			}
		} catch (error) {
			console.error("Error updating user ban status:", error);
		}
	};

	const deleteUser = async (userId: string) => {
		try {
			const response = await fetch(`/api/admin/users?id=${userId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setState((prev) => ({ ...prev, showDeleteConfirm: false, deletingUser: null }));
				fetchUsers();
			}
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	};

	const handleSelectUser = (userId: string) => {
		setState((prev) => ({
			...prev,
			selectedUsers: prev.selectedUsers.includes(userId)
				? prev.selectedUsers.filter((id) => id !== userId)
				: [...prev.selectedUsers, userId],
		}));
	};

	const handleSelectAll = () => {
		setState((prev) => ({
			...prev,
			selectedUsers: prev.selectedUsers.length === prev.users.length ? [] : prev.users.map((u) => u.clerkId),
		}));
	};

	const formatDate = (date: Date) => new Date(date).toLocaleDateString();
	const getUserName = (user: User) =>
		user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split("@")[0];

	const getStatusColor = (user: User) => {
		if (user.banned) return "text-red-400";
		if (user.role === "admin") return "text-reggae-green";
		return "text-blue-400";
	};

	const getStatusIcon = (user: User) => {
		if (user.banned) return <Ban size={14} />;
		if (user.role === "admin") return <Crown size={14} />;
		return <UserCheck size={14} />;
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				{state.selectedUsers.length > 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-reggae-green/20 border border-reggae-green/30 rounded-xl px-4 py-2"
					>
						<span className="text-reggae-green font-medium">{state.selectedUsers.length} users selected</span>
					</motion.div>
				)}
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-2xl font-bold text-white">{state.pagination.totalCount}</p>
							<p className="text-gray-400">Total Users</p>
						</div>
						<div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
							<Users className="text-blue-400" size={24} />
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-2xl font-bold text-white">
								{state.users.filter((u) => u.role === "admin").length}
							</p>
							<p className="text-gray-400">Admins</p>
						</div>
						<div className="w-12 h-12 bg-reggae-green/20 rounded-xl flex items-center justify-center">
							<Crown className="text-reggae-green" size={24} />
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-2xl font-bold text-white">{state.users.filter((u) => u.banned).length}</p>
							<p className="text-gray-400">Banned Users</p>
						</div>
						<div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
							<Ban className="text-red-400" size={24} />
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-2xl font-bold text-white">
								{state.users.reduce((sum, user) => sum + (user.totalPurchases || 0), 0)}
							</p>
							<p className="text-gray-400">Total Purchases</p>
						</div>
						<div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
							<ShoppingBag className="text-purple-400" size={24} />
						</div>
					</div>
				</motion.div>
			</div>

			{/* Search and Filters */}
			<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-6">
				<div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
					{/* Search */}
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
						<input
							type="text"
							placeholder="Search users by name or email..."
							value={state.searchQuery}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white placeholder-gray-400 transition-all duration-300"
						/>
					</div>

					{/* Filters */}
					<div className="flex gap-4">
						<select
							value={state.roleFilter}
							onChange={(e) => setState((prev) => ({ ...prev, roleFilter: e.target.value as any }))}
							className="px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
						>
							<option value="all">All Roles</option>
							<option value="user">Users</option>
							<option value="admin">Admins</option>
						</select>

						<select
							value={state.statusFilter}
							onChange={(e) => setState((prev) => ({ ...prev, statusFilter: e.target.value as any }))}
							className="px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none text-white"
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="banned">Banned</option>
						</select>

						<button className="flex items-center gap-2 px-4 py-3 bg-black/30 backdrop-blur-sm border border-gray-700/30 rounded-xl text-gray-400 hover:text-reggae-green transition-colors duration-300">
							<Download size={18} />
							Export
						</button>
					</div>
				</div>

				{/* Bulk Actions */}
				{state.selectedUsers.length > 0 && (
					<div className="flex items-center gap-4 p-4 bg-reggae-green/10 border border-reggae-green/30 rounded-xl">
						<span className="text-reggae-green font-medium">Bulk Actions:</span>
						<button className="px-3 py-1 bg-reggae-green/20 text-reggae-green rounded-lg hover:bg-reggae-green/30 transition-colors">
							Make Admin
						</button>
						<button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
							Ban Selected
						</button>
						<button
							onClick={() => setState((prev) => ({ ...prev, selectedUsers: [] }))}
							className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
						>
							Clear Selection
						</button>
					</div>
				)}
			</div>

			{/* Users Table */}
			{state.loading ? (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<Loader2 className="w-12 h-12 text-reggae-green animate-spin mx-auto mb-4" />
						<p className="text-gray-400">Loading users...</p>
					</div>
				</div>
			) : state.users.length === 0 ? (
				<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-12 text-center">
					<Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
					<h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
					<p className="text-gray-400">
						{state.searchQuery ? `No users match "${state.searchQuery}"` : "No users registered yet"}
					</p>
				</div>
			) : (
				<div className="bg-black/20 backdrop-blur-2xl border border-gray-700/30 rounded-2xl overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-black/30 border-b border-gray-700/30">
								<tr>
									<th className="text-left px-6 py-4">
										<input
											type="checkbox"
											checked={state.selectedUsers.length === state.users.length}
											onChange={handleSelectAll}
											className="w-4 h-4 text-reggae-green bg-black/30 border-gray-600 rounded focus:ring-reggae-green"
										/>
									</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">User</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Status</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Activity</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Purchases</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Joined</th>
									<th className="text-left px-6 py-4 font-semibold text-gray-300">Actions</th>
								</tr>
							</thead>
							<tbody>
								{state.users.map((user, index) => (
									<motion.tr
										key={user.clerkId}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										className={`border-b border-gray-700/20 hover:bg-black/20 transition-colors duration-200 ${
											user.banned ? "opacity-60" : ""
										}`}
									>
										<td className="px-6 py-4">
											<input
												type="checkbox"
												checked={state.selectedUsers.includes(user.clerkId)}
												onChange={() => handleSelectUser(user.clerkId)}
												className="w-4 h-4 text-reggae-green bg-black/30 border-gray-600 rounded focus:ring-reggae-green"
											/>
										</td>

										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="relative">
													{user.imageUrl ? (
														<img
															src={user.imageUrl}
															alt={getUserName(user)}
															className="w-10 h-10 rounded-full"
														/>
													) : (
														<div className="w-10 h-10 bg-gradient-to-br from-reggae-green to-green-600 rounded-full flex items-center justify-center">
															<User className="text-white" size={18} />
														</div>
													)}
													{user.banned && (
														<div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
															<Ban size={10} className="text-white" />
														</div>
													)}
												</div>
												<div>
													<p className="font-medium text-white">{getUserName(user)}</p>
													<p className="text-sm text-gray-400 flex items-center gap-1">
														<Mail size={12} />
														{user.email}
													</p>
													{!user.hasMongoProfile && (
														<span className="text-xs text-yellow-400">Clerk only</span>
													)}
												</div>
											</div>
										</td>

										<td className="px-6 py-4">
											<div className="space-y-1">
												<span
													className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
														user.banned
															? "bg-red-500/20 text-red-400 border-red-500/30"
															: user.role === "admin"
															? "bg-reggae-green/20 text-reggae-green border-reggae-green/30"
															: "bg-blue-500/20 text-blue-400 border-blue-500/30"
													}`}
												>
													{getStatusIcon(user)}
													{user.banned ? "Banned" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
												</span>
											</div>
										</td>

										<td className="px-6 py-4">
											<div className="text-sm">
												{user.lastSignInAt ? (
													<div className="flex items-center gap-1 text-gray-400">
														<CheckCircle size={12} className="text-green-400" />
														{formatDate(user.lastSignInAt)}
													</div>
												) : (
													<div className="flex items-center gap-1 text-gray-500">
														<AlertTriangle size={12} />
														Never signed in
													</div>
												)}
											</div>
										</td>

										<td className="px-6 py-4">
											<div className="text-sm">
												<div className="text-white font-medium">{user.totalPurchases || 0} items</div>
												<div className="text-gray-400">₦{(user.totalSpent || 0).toLocaleString()}</div>
											</div>
										</td>

										<td className="px-6 py-4">
											<div className="flex items-center gap-1 text-gray-400">
												<Calendar size={14} />
												<span className="text-sm">{formatDate(user.createdAt)}</span>
											</div>
										</td>

										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												{/* Role Toggle */}
												<select
													value={user.role}
													onChange={(e) => updateUserRole(user.clerkId, e.target.value as "user" | "admin")}
													className="px-3 py-1 bg-black/30 border border-gray-700/30 rounded-lg text-sm text-white focus:ring-2 focus:ring-reggae-green focus:border-reggae-green/50 outline-none"
													disabled={user.banned}
												>
													<option value="user">User</option>
													<option value="admin">Admin</option>
												</select>

												{/* Ban/Unban Toggle */}
												<button
													onClick={() => toggleUserBan(user.clerkId, !user.banned)}
													className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
														user.banned
															? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
															: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
													}`}
													title={user.banned ? "Unban user" : "Ban user"}
												>
													{user.banned ? <UserCheck size={14} /> : <Ban size={14} />}
												</button>

												{/* View Details */}
												<button
													onClick={() =>
														setState((prev) => ({
															...prev,
															selectedUser: user,
															showUserDetails: true,
														}))
													}
													className="w-8 h-8 rounded-lg bg-black/30 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/50 transition-all duration-300"
													title="View Details"
												>
													<Eye size={14} />
												</button>

												{/* Delete User */}
												<button
													onClick={() =>
														setState((prev) => ({
															...prev,
															deletingUser: user,
															showDeleteConfirm: true,
														}))
													}
													className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all duration-300"
													title="Delete User"
												>
													<Trash2 size={14} />
												</button>
											</div>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					{state.pagination.totalPages > 1 && (
						<div className="flex items-center justify-between p-6 border-t border-gray-700/30">
							<div className="text-sm text-gray-400">
								Showing {(state.pagination.page - 1) * state.pagination.limit + 1} to{" "}
								{Math.min(state.pagination.page * state.pagination.limit, state.pagination.totalCount)} of{" "}
								{state.pagination.totalCount} users
							</div>

							<div className="flex items-center gap-2">
								<button
									onClick={() =>
										setState((prev) => ({
											...prev,
											pagination: { ...prev.pagination, page: prev.pagination.page - 1 },
										}))
									}
									disabled={!state.pagination.hasPrev}
									className="px-4 py-2 bg-black/30 border border-gray-700/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-300"
								>
									Previous
								</button>

								{Array.from({ length: Math.min(state.pagination.totalPages, 5) }, (_, i) => {
									const page = i + Math.max(1, state.pagination.page - 2);
									if (page > state.pagination.totalPages) return null;

									return (
										<button
											key={page}
											onClick={() =>
												setState((prev) => ({
													...prev,
													pagination: { ...prev.pagination, page },
												}))
											}
											className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
												page === state.pagination.page
													? "bg-reggae-green text-white"
													: "bg-black/30 border border-gray-700/30 text-white hover:bg-black/50"
											}`}
										>
											{page}
										</button>
									);
								}).filter(Boolean)}

								<button
									onClick={() =>
										setState((prev) => ({
											...prev,
											pagination: { ...prev.pagination, page: prev.pagination.page + 1 },
										}))
									}
									disabled={!state.pagination.hasNext}
									className="px-4 py-2 bg-black/30 border border-gray-700/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-300"
								>
									Next
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* User Details Modal */}
			<AnimatePresence>
				{state.showUserDetails && state.selectedUser && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
							onClick={() => setState((prev) => ({ ...prev, showUserDetails: false }))}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className="fixed inset-4 z-50 bg-black/90 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 flex items-center justify-center"
						>
							<div className="w-full max-w-md text-center">
								<div className="relative w-20 h-20 mx-auto mb-6">
									{state.selectedUser.imageUrl ? (
										<img
											src={state.selectedUser.imageUrl}
											alt={getUserName(state.selectedUser)}
											className="w-full h-full rounded-full"
										/>
									) : (
										<div className="w-full h-full bg-gradient-to-br from-reggae-green to-green-600 rounded-full flex items-center justify-center">
											<User className="w-10 h-10 text-white" />
										</div>
									)}
									{state.selectedUser.banned && (
										<div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
											<Ban size={14} className="text-white" />
										</div>
									)}
								</div>

								<h3 className="text-xl font-bold text-white mb-2">{getUserName(state.selectedUser)}</h3>
								<p className="text-gray-400 mb-2">{state.selectedUser.email}</p>
								<span
									className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
										state.selectedUser,
									)} ${
										state.selectedUser.banned
											? "bg-red-500/20 border-red-500/30"
											: state.selectedUser.role === "admin"
											? "bg-reggae-green/20 border-reggae-green/30"
											: "bg-blue-500/20 border-blue-500/30"
									}`}
								>
									{getStatusIcon(state.selectedUser)}
									{state.selectedUser.banned
										? "Banned"
										: state.selectedUser.role.charAt(0).toUpperCase() + state.selectedUser.role.slice(1)}
								</span>

								<div className="space-y-4 text-left mt-8">
									<div className="flex justify-between py-2 border-b border-gray-700/30">
										<span className="text-gray-400">Purchases:</span>
										<span className="text-white">{state.selectedUser.totalPurchases || 0}</span>
									</div>
									<div className="flex justify-between py-2 border-b border-gray-700/30">
										<span className="text-gray-400">Total Spent:</span>
										<span className="text-white">
											₦{(state.selectedUser.totalSpent || 0).toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between py-2 border-b border-gray-700/30">
										<span className="text-gray-400">Joined:</span>
										<span className="text-white">{formatDate(state.selectedUser.createdAt)}</span>
									</div>
									<div className="flex justify-between py-2 border-b border-gray-700/30">
										<span className="text-gray-400">Last Sign In:</span>
										<span className="text-white">
											{state.selectedUser.lastSignInAt
												? formatDate(state.selectedUser.lastSignInAt)
												: "Never"}
										</span>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-gray-400">Data Source:</span>
										<span className="text-white">
											{state.selectedUser.hasMongoProfile ? "Clerk + MongoDB" : "Clerk Only"}
										</span>
									</div>
								</div>

								<motion.button
									onClick={() => setState((prev) => ({ ...prev, showUserDetails: false }))}
									className="mt-8 w-full px-6 py-3 bg-reggae-green text-white rounded-xl hover:bg-green-600 transition-colors duration-300 font-medium"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									Close
								</motion.button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Delete Confirmation Modal */}
			<AnimatePresence>
				{state.showDeleteConfirm && state.deletingUser && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
							onClick={() => setState((prev) => ({ ...prev, showDeleteConfirm: false, deletingUser: null }))}
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							className="fixed inset-4 z-50 bg-black/90 backdrop-blur-2xl border border-gray-700/30 rounded-2xl p-8 flex items-center justify-center"
						>
							<div className="w-full max-w-md">
								<div className="text-center">
									<div className="w-16 h-16 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center">
										<AlertTriangle className="w-8 h-8 text-red-500" />
									</div>
									<h3 className="text-xl font-bold text-white mb-2">Delete User Account</h3>
									<p className="text-gray-400 mb-8">
										Are you sure you want to permanently delete{" "}
										<strong>{getUserName(state.deletingUser)}</strong>? This action cannot be undone and will
										remove all their data.
									</p>
									<div className="flex gap-4">
										<motion.button
											onClick={() =>
												setState((prev) => ({ ...prev, showDeleteConfirm: false, deletingUser: null }))
											}
											className="flex-1 px-4 py-3 bg-black/30 border border-gray-700/30 text-white rounded-xl hover:bg-black/50 transition-colors duration-300"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Cancel
										</motion.button>
										<motion.button
											onClick={() => deleteUser(state.deletingUser!.clerkId)}
											className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-300"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Delete
										</motion.button>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
