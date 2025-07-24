import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Award, 
  Eye, 
  Edit, 
  Copy, 
  Trash2,
  Clock,
  FileText,
  CheckCircle,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Avatar } from '@heroui/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExpandableCard } from '@/components/ui/expandable-card';

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  points: number;
  status: 'DRAFT' | 'ACTIVE' | 'PUBLISHED' | 'CLOSED' | 'COMPLETED' | 'OVERDUE';
  className: string;
  teacher?: {
    name: string;
    avatar?: string;
  };
  submissions?: {
    total: number;
    submitted: number;
    graded: number;
  };
  subject?: {
    name: string;
    color: string;
  };
}

interface AssignmentCardProps {
  assignment: Assignment;
  onView?: (assignment: Assignment) => void;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
  onCopy?: (assignment: Assignment) => void;
}

export function AssignmentCard({ 
  assignment, 
  onView, 
  onEdit, 
  onDelete, 
  onCopy 
}: AssignmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
      case 'PUBLISHED':
        return 'bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md';
      case 'DRAFT':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-md';
      case 'CLOSED':
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-md';
      case 'OVERDUE':
        return 'bg-red-500/20 text-red-400 border-red-500/30 backdrop-blur-md';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30 backdrop-blur-md';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Aktif';
      case 'PUBLISHED':
        return 'Dipublikasi';
      case 'DRAFT':
        return 'Draft';
      case 'CLOSED':
        return 'Ditutup';
      case 'COMPLETED':
        return 'Selesai';
      case 'OVERDUE':
        return 'Terlambat';
      default:
        return `Status: ${status}`;
    }
  };

  const getSubmissionProgress = () => {
    if (!assignment.submissions) return 0;
    const { total, submitted } = assignment.submissions;
    return total > 0 ? (submitted / total) * 100 : 0;
  };

  const getGradingProgress = () => {
    if (!assignment.submissions) return 0;
    const { submitted, graded } = assignment.submissions;
    return submitted > 0 ? (graded / submitted) * 100 : 0;
  };

  // Main card content (always visible) - Modern compact design
  const mainContent = (
    <div className="p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
          <Avatar
            name={assignment.title.charAt(0).toUpperCase()}
            src={assignment.teacher?.avatar}
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex-shrink-0"
            size="md"
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header with Title and Status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight">
                {assignment.title}
              </h3>
              {/* Subject if available */}
              {assignment.subject && (
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: assignment.subject.color }}
                  />
                  <span className="text-sm text-purple-200 font-medium">
                    {assignment.subject.name}
                  </span>
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            <Badge 
              className={`flex-shrink-0 ${getStatusColor(assignment.status)} text-xs font-medium px-3 py-1`}
              variant="outline"
            >
              {getStatusText(assignment.status)}
            </Badge>
          </div>

          {/* Assignment Details Grid */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-purple-300">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{assignment.className}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formatDate(assignment.deadline)}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <Award className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold text-white">{assignment.points}pt</span>
            </div>
          </div>

          {/* Quick Stats if available */}
          {assignment.submissions && (
            <div className="flex items-center gap-4 mt-3 text-xs text-purple-400">
              <span>{assignment.submissions.submitted}/{assignment.submissions.total} dikumpulkan</span>
              <span>{assignment.submissions.graded} dinilai</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Expanded content (shown when card is expanded) - Glassmorphism blend with background
  const expandedContent = (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="border-t border-white/10 mt-4 pt-6 space-y-6 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm rounded-b-xl -mx-4 -mb-4 px-4 pb-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.1)'
      }}
    >
      {/* Glassmorphism shine effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
          animation: 'shimmer 3s ease-in-out infinite'
        }}
      />
      
      {/* Full Description */}
      {assignment.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <h5 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Deskripsi Tugas
          </h5>
          <div className="glassmorphism-card bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <p className="text-sm text-gray-100 leading-relaxed">
              {assignment.description}
            </p>
          </div>
        </motion.div>
      )}

      {/* Detailed Statistics */}
      {assignment.submissions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <h5 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Progress Pengumpulan
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Submission Progress */}
            <div className="glassmorphism-card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md p-5 rounded-xl border border-blue-400/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  Pengumpulan
                </span>
                <span className="text-lg text-blue-300 font-black">
                  {Math.round(getSubmissionProgress())}%
                </span>
              </div>
              <Progress value={getSubmissionProgress()} className="h-3 mb-3" />
              <p className="text-sm text-gray-200 font-medium">
                {assignment.submissions.submitted} dari {assignment.submissions.total} siswa telah mengumpulkan
              </p>
            </div>

            {/* Grading Progress */}
            <div className="glassmorphism-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-md p-5 rounded-xl border border-green-400/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Penilaian
                </span>
                <span className="text-lg text-green-300 font-black">
                  {Math.round(getGradingProgress())}%
                </span>
              </div>
              <Progress value={getGradingProgress()} className="h-3 mb-3" />
              <p className="text-sm text-gray-200 font-medium">
                {assignment.submissions.graded} dari {assignment.submissions.submitted} sudah dinilai
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Assignment Details - Enhanced Readability */}
      <div className="relative z-10">
        <h5 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Detail Tugas
        </h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glassmorphism-card bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/10">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-gray-300 uppercase font-semibold tracking-wider mb-1">Deadline</p>
            <p className="text-base font-bold text-white">{formatDate(assignment.deadline)}</p>
          </div>

          <div className="glassmorphism-card bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/10">
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs text-gray-300 uppercase font-semibold tracking-wider mb-1">Poin</p>
            <p className="text-base font-bold text-white">{assignment.points}</p>
          </div>

          {assignment.teacher && (
            <div className="glassmorphism-card bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/10">
              <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-300 uppercase font-semibold tracking-wider mb-1">Guru</p>
              <p className="text-base font-bold text-white truncate">{assignment.teacher.name}</p>
            </div>
          )}

          {assignment.subject && (
            <div className="glassmorphism-card bg-white/5 backdrop-blur-md p-4 rounded-xl text-center border border-white/10">
              <div 
                className="w-6 h-6 rounded-full mx-auto mb-2" 
                style={{ backgroundColor: assignment.subject.color }}
              />
              <p className="text-xs text-gray-300 uppercase font-semibold tracking-wider mb-1">Mapel</p>
              <p className="text-base font-bold text-white truncate">{assignment.subject.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(assignment);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-blue-500/25 font-semibold"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Detail
                </Button>
              </TooltipTrigger>
              <TooltipContent>Buka halaman detail tugas</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(assignment);
                  }}
                  className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all font-semibold"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit tugas ini</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy?.(assignment);
                  }}
                  className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all font-semibold"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplikat
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplikat tugas ini</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(assignment);
                  }}
                  className="bg-red-500/30 backdrop-blur-md border-red-400/40 text-red-200 hover:bg-red-500/40 hover:border-red-300/60 transition-all font-semibold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hapus tugas ini</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="text-sm text-gray-200 font-medium bg-white/15 px-3 py-1 rounded-lg border border-white/20">
            ID: {assignment.id.substring(0, 8)}...
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <ExpandableCard
      className="bg-black/20 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 assignment-card-container"
      expandedContent={expandedContent}
    >
      {mainContent}
    </ExpandableCard>
  );
}

export default AssignmentCard;
