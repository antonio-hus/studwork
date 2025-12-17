"use client"
import {User} from '@/lib/domain/user'

export function CoordinatorDashboard({user}: { user: User }) {
    return (
        <div>
            <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
            <p>Welcome, {user.name}</p>
        </div>
    )
}
