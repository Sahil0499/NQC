import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number;
    icon?: LucideIcon;
    trend?: string;
    className?: string;
    borderColor?: string;
}

export function StatsCard({ title, value, icon: Icon, className, borderColor }: StatsCardProps) {
    return (
        <div className={cn("bg-white p-6 rounded-lg shadow-sm border border-gray-100", borderColor && `border-l-4 ${borderColor}`, className)}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                {Icon && <Icon className="h-6 w-6 text-gray-400" />}
            </div>
        </div>
    );
}
