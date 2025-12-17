"use client"
import {useTranslations} from 'next-intl'
import {User} from '@/lib/domain/user'
import {LayoutDashboard, Users, Building2, Clock} from 'lucide-react'

export function AdminDashboard({user}: { user: User }) {
    const t = useTranslations('dashboard.admin')

    const metrics = [
        {
            label: 'Total Users',
            value: '1,234',
            icon: Users,
            change: '+12%',
            changeType: 'positive' as const
        },
        {
            label: 'Pending Organizations',
            value: '5',
            icon: Building2,
            change: '+2',
            changeType: 'warning' as const
        },
        {
            label: 'Active Opportunities',
            value: '89',
            icon: LayoutDashboard,
            change: '+5%',
            changeType: 'positive' as const
        },
        {
            label: 'Applications This Week',
            value: '127',
            icon: Clock,
            change: '+23%',
            changeType: 'positive' as const
        }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                    Admin Overview
                </h1>
                <p className="text-text-secondary mt-2">
                    Welcome back, {user.name}
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                        <div
                            key={metric.label}
                            className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-text-secondary">
                                        {metric.label}
                                    </p>
                                    <p className="text-3xl font-bold text-text-primary">
                                        {metric.value}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Icon className="h-5 w-5 text-primary"/>
                                </div>
                            </div>
                            <div className="mt-4">
                                <span
                                    className={`text-sm font-medium ${
                                        metric.changeType === 'positive'
                                            ? 'text-success'
                                            : metric.changeType === 'warning'
                                                ? 'text-warning'
                                                : 'text-error'
                                    }`}
                                >
                                    {metric.change}
                                </span>
                                <span className="text-sm text-text-tertiary ml-1">
                                    from last month
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
