'use client';

import {
  BarChart3,
  BookOpen,
  Briefcase,
  Award,
  Shield,
  Calendar,
  Mic,
  Palmtree,
  CalendarDays,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type TabKey, type TeamMember } from '@/types';

const TAB_ICONS = {
  overview: BarChart3,
  projects: BookOpen,
  portfolio: Briefcase,
  skills: Award,
  awareness: Shield,
  engagements: Calendar,
  events: Mic,
  'time-off': Palmtree,
  'team-dashboard': BarChart3,
  'calendar': CalendarDays,
  'portfolio-catalog': FolderOpen,
} as const;

interface SidebarProps {
  selectedMember: TeamMember;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function Sidebar({ selectedMember, activeTab, onTabChange }: SidebarProps) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'projects', label: 'Projects' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'skills', label: 'Skills & Tools' },
    { key: 'awareness', label: 'Awareness' },
    { key: 'engagements', label: 'Engagements' },
    { key: 'events', label: 'Events' },
    { key: 'time-off', label: 'Time Off' },
  ];

  return (
    <aside
      className="w-64 border-r flex flex-col no-print"
      style={{ backgroundColor: '#f8fafb', borderColor: '#CEDADD' }}
    >
      {/* Member card */}
      <div
        className="p-4 m-3 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #CEDADD 0%, rgba(135, 149, 176, 0.3) 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: '#123A43' }}
          >
            {selectedMember.avatarInitials}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#123A43' }}>
              {selectedMember.name}
            </h3>
            <p className="text-sm" style={{ color: '#5D7D87' }}>
              {selectedMember.roleTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.key];
          const isActive = activeTab === tab.key;

          return (
            <Button
              key={tab.key}
              variant="ghost"
              onClick={() => onTabChange(tab.key)}
              className="w-full justify-start gap-3 h-10"
              style={{
                backgroundColor: isActive ? '#123A43' : 'transparent',
                color: isActive ? '#ffffff' : '#5D7D87',
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Team Section */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: '#CEDADD' }}>
        <p className="px-3 text-xs font-semibold uppercase mb-2" style={{ color: '#8795B0' }}>
          Team
        </p>
        <Button
          variant="ghost"
          onClick={() => onTabChange('portfolio-catalog')}
          className="w-full justify-start gap-3 h-10"
          style={{
            backgroundColor: activeTab === 'portfolio-catalog' ? '#B06C50' : 'transparent',
            color: activeTab === 'portfolio-catalog' ? '#ffffff' : '#B06C50',
          }}
        >
          <FolderOpen className="w-5 h-5" />
          <span>Portfolio Catalog</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => onTabChange('calendar')}
          className="w-full justify-start gap-3 h-10"
          style={{
            backgroundColor: activeTab === 'calendar' ? '#B06C50' : 'transparent',
            color: activeTab === 'calendar' ? '#ffffff' : '#B06C50',
          }}
        >
          <CalendarDays className="w-5 h-5" />
          <span>Team Calendar</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => onTabChange('team-dashboard')}
          className="w-full justify-start gap-3 h-10"
          style={{
            backgroundColor: activeTab === 'team-dashboard' ? '#B06C50' : 'transparent',
            color: activeTab === 'team-dashboard' ? '#ffffff' : '#B06C50',
          }}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Team Dashboard</span>
        </Button>
      </div>
    </aside>
  );
}
