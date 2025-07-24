import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, AlertCircle } from 'lucide-react';
import { classService } from '@/services/classService';

interface Class {
  id: string;
  name: string;
  isPhysicalClass: boolean;
  studentCount: number;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface ClassSelectorProps {
  value?: string;
  onChange: (classId: string, className: string) => void;
  placeholder?: string;
  showCreateNew?: boolean;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  value,
  onChange,
  placeholder = "Pilih kelas...",
  showCreateNew = true
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewClassForm, setShowNewClassForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getAllClasses();
      setClasses(response || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
      setError('Gagal memuat daftar kelas');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classId: string) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (selectedClass) {
      onChange(classId, selectedClass.name);
    }
  };

  const handleCreateNewClass = async () => {
    if (!newClassName.trim()) {
      setError('Nama kelas tidak boleh kosong');
      return;
    }

    // Check for duplicate names
    const isDuplicate = classes.some(
      c => c.name.toLowerCase() === newClassName.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      setError(`Kelas dengan nama "${newClassName}" sudah ada. Silakan pilih dari daftar atau gunakan nama yang berbeda.`);
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      const newClass = await classService.createClass({
        name: newClassName.trim(),
        isPhysicalClass: true
      });

      // Refresh the classes list
      await loadClasses();
      
      // Select the newly created class
      onChange(newClass.id, newClass.name);
      
      // Reset form
      setNewClassName('');
      setShowNewClassForm(false);
      
    } catch (error) {
      console.error('Failed to create class:', error);
      setError('Gagal membuat kelas baru');
    } finally {
      setCreating(false);
    }
  };

  const cancelNewClass = () => {
    setShowNewClassForm(false);
    setNewClassName('');
    setError('');
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Kelas</Label>
        <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Kelas</Label>
      
      {!showNewClassForm ? (
        <div className="space-y-2">
          <Select value={value} onValueChange={handleClassSelect}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{cls.name}</span>
                    <div className="flex items-center text-xs text-gray-500 ml-4">
                      <span>{cls.studentCount} siswa</span>
                      {cls.subjects.length > 0 && (
                        <span className="ml-2">
                          • {cls.subjects.length} mata pelajaran
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showCreateNew && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewClassForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Kelas Baru
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="newClassName">Nama Kelas Baru</Label>
            <Input
              id="newClassName"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Contoh: Kelas 7.2, Kelas 8.1, dll."
              className="bg-white"
            />
          </div>
          
          {error && (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={handleCreateNewClass}
              disabled={creating || !newClassName.trim()}
              size="sm"
            >
              {creating ? 'Membuat...' : 'Buat Kelas'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={cancelNewClass}
              size="sm"
            >
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSelector;
