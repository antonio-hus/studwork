/** @format */
'use client';

import React, {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {UserRole} from '@/lib/domain/user';
import {Search, Filter, Loader2} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

interface Props {
    initialSearch: string;
    initialRole: string;
    roles: typeof UserRole;
    isPending: boolean;
    onFilterChange: (updates: Record<string, string | number | null>) => void;
}

/**
 * Renders toolbar controls for filtering and searching users.
 *
 * This component provides a search input and a role filter dropdown,
 * emitting filter updates through the `onFilterChange` callback.
 *
 * @param {Props} props The component props.
 * @param {string} props.initialSearch Initial search query from external state or URL.
 * @param {string} props.initialRole Initially selected role filter value.
 * @param {typeof UserRole} props.roles Enum containing the available user roles.
 * @param {boolean} props.isPending Indicates whether a filter/search request is in progress.
 * @param {(updates: Record<string, string | number | null>) => void} props.onFilterChange Callback invoked when search or role filters change.
 * @returns {React.JSX.Element} A toolbar with search and role filter controls.
 */
export function UserToolbar({initialSearch, initialRole, roles, isPending, onFilterChange}: Props): React.JSX.Element {
    const t = useTranslations('admin.users');
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    useEffect(() => {
        setSearchTerm(initialSearch);
    }, [initialSearch]);

    const handleSearch = () => {
        if (searchTerm !== initialSearch) {
            onFilterChange({search: searchTerm});
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative group w-full sm:w-[320px]">
                    <Search
                        className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"/>
                    <Input
                        placeholder={t('searchPlaceholder')}
                        className="pl-10 h-10 bg-background border-input focus:ring-1 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={handleSearch}
                    disabled={isPending}
                    className="h-10 px-4 border-input hover:bg-accent"
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : t('search')}
                </Button>
            </div>

            <Select
                value={initialRole}
                onValueChange={(val) => onFilterChange({role: val})}
            >
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background border-input">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="h-3.5 w-3.5"/>
                        <span className="text-foreground">
							<SelectValue placeholder={t('filterRole')}/>
						</span>
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-background border-border shadow-xl min-w-[200px]">
                    <SelectItem value="ALL">{t('roles.all')}</SelectItem>
                    <SelectItem value={roles.STUDENT}>{t('roles.student')}</SelectItem>
                    <SelectItem value={roles.ORGANIZATION}>
                        {t('roles.organization')}
                    </SelectItem>
                    <SelectItem value={roles.COORDINATOR}>
                        {t('roles.coordinator')}
                    </SelectItem>
                    <SelectItem value={roles.ADMINISTRATOR}>
                        {t('roles.administrator')}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
