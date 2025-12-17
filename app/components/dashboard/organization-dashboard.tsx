"use client"
import {User} from '@/lib/domain/user'

export function OrganizationDashboard({user}: { user: User }) {
    return (
        <div>
            <h1 className="text-2xl font-bold">Organization Dashboard</h1>
            <p>Welcome, {user.name}</p>
        </div>
    )
}
