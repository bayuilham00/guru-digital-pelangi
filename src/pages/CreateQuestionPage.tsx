import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import QuestionForm from '../components/modules/bank-soal/questions/QuestionForm';
import { Question, Subject, Topic } from '../types/bankSoal';
import { bankSoalService } from '@/services/bankSoalService';
import { toast } from 'sonner';

const CreateQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        const [subjectsResponse, topicsResponse] = await Promise.all([
          bankSoalService.getSubjects(),
          bankSoalService.getTopics()
        ]);

        if (subjectsResponse.success) {
          setSubjects(subjectsResponse.data);
        } else {
          toast.error(subjectsResponse.message || 'Gagal memuat mata pelajaran');
        }

        if (topicsResponse.success) {
          setTopics(topicsResponse.data);
        } else {
          toast.error(topicsResponse.message || 'Gagal memuat topik');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat memuat data');
        console.error('Error fetching metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const handleSave = (question: Question) => {
    // The form component now handles the API call, so we just navigate
    navigate('/bank-soal');
  };

  const handleCancel = () => {
    navigate('/bank-soal');
  };

  const handlePreview = (question: Partial<Question>) => {
    console.log('Preview question:', question);
    // Implement preview logic, e.g., open a modal
    // For now, we can just show a toast
    toast.info('Fitur pratinjau sedang dalam pengembangan.');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-start gap-2 mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Kembali
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Beranda
          </Button>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Buat Soal Baru</h1>
          <p className="text-gray-600 mt-2">Tambahkan soal baru ke dalam bank soal Anda</p>
        </div>
        
        <QuestionForm
          onSave={handleSave}
          onCancel={handleCancel}
          onPreview={handlePreview}
          subjects={subjects}
          topics={topics}
        />
      </div>
    </div>
  );
};

export default CreateQuestionPage;
