'use client';

import { Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type TeamMember } from '@/types';

interface HeaderProps {
  selectedMember: TeamMember;
  members: TeamMember[];
  onMemberSelect: (member: TeamMember) => void;
  userEmail?: string;
}

export function Header({
  selectedMember,
  members,
  onMemberSelect,
  userEmail,
}: HeaderProps) {
  return (
    <div className="no-print">
      {/* Main Header */}
      <header
        className="h-16 px-4 flex items-center justify-between border-b"
        style={{ backgroundColor: '#ffffff', borderColor: '#CEDADD' }}
      >
        {/* Left section */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#123A43' }}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: '#123A43' }}>
              AI Team Work Tracker
            </h1>
            <p className="text-xs" style={{ color: '#5D7D87' }}>
              Supervisor Mode (Local)
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* User display */}
          {userEmail && (
            <span className="text-sm hidden md:inline" style={{ color: '#5D7D87' }}>
              {userEmail}
            </span>
          )}

          {/* Member selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                style={{ borderColor: '#CEDADD' }}
              >
                <span style={{ color: '#123A43' }}>{selectedMember.name}</span>
                <ChevronDown className="w-4 h-4" style={{ color: '#5D7D87' }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {members.map((member) => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => onMemberSelect(member)}
                  className="cursor-pointer"
                >
                  {member.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
