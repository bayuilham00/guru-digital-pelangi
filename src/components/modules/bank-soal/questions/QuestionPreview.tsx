import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock, Target, Eye, AlertCircle, BookOpen, HelpCircle } from 'lucide-react';
import { Question, QuestionOption } from '@/types/bankSoal';
import DifficultyBadge from '../shared/DifficultyBadge';

interface QuestionPreviewProps {
  question: Partial<Question>;
  options?: QuestionOption[];
  showAnswers?: boolean;
  showExplanation?: boolean;
  onAnswer?: (answer: string | string[]) => void;
  onSubmit?: (userAnswer: string | string[]) => void;
  studentMode?: boolean;
  readOnly?: boolean;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  question,
  options = [],
  showAnswers = false,
  showExplanation = false,
  onAnswer,
  onSubmit,
  studentMode = false,
  readOnly = false
}) => {
  const [userAnswer, setUserAnswer] = useState<string | string[]>('');
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (answer: string | string[]) => {
    if (readOnly) return;
    
    setUserAnswer(answer);
    onAnswer?.(answer);
  };

  const handleSubmit = () => {
    if (readOnly) return;
    
    setSubmitted(true);
    setShowResults(true);
    onSubmit?.(userAnswer);
  };

  const checkAnswer = () => {
    if (!question.correctAnswer) return false;
    
    if (question.questionType === 'MULTIPLE_CHOICE_COMPLEX') {
      const correctAnswers = options.filter(opt => opt.isCorrect).map(opt => opt.id);
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      return correctAnswers.length === userAnswers.length && 
             correctAnswers.every(answer => userAnswers.includes(answer));
    }
    
    return userAnswer === question.correctAnswer;
  };

  const isCorrect = checkAnswer();

  const renderQuestionType = () => {
    const typeMap = {
      'MULTIPLE_CHOICE': 'Pilihan Ganda',
      'MULTIPLE_CHOICE_COMPLEX': 'Pilihan Ganda Kompleks',
      'TRUE_FALSE': 'Benar/Salah',
      'FILL_BLANK': 'Isi Kosong',
      'ESSAY': 'Esai',
      'MATCHING': 'Menjodohkan'
    };
    
    return typeMap[question.questionType as keyof typeof typeMap] || 'Tidak diketahui';
  };

  const renderMultipleChoice = () => (
    <div className="space-y-3">
      <RadioGroup 
        value={userAnswer as string} 
        onValueChange={handleAnswerChange}
        disabled={readOnly || submitted}
      >
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label 
              htmlFor={option.id} 
              className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                showAnswers && option.isCorrect
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : showAnswers && userAnswer === option.id && !option.isCorrect
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span>{option.text}</span>
                {showAnswers && option.isCorrect && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                )}
                {showAnswers && userAnswer === option.id && !option.isCorrect && (
                  <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderMultipleChoiceComplex = () => (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Pilih semua jawaban yang benar (dapat lebih dari satu)
      </p>
      {options.map((option, index) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={option.id}
            checked={Array.isArray(userAnswer) ? userAnswer.includes(option.id) : false}
            onCheckedChange={(checked) => {
              if (readOnly || submitted) return;
              
              const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
              const newAnswers = checked
                ? [...currentAnswers, option.id]
                : currentAnswers.filter(id => id !== option.id);
              handleAnswerChange(newAnswers);
            }}
            disabled={readOnly || submitted}
          />
          <Label 
            htmlFor={option.id} 
            className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
              showAnswers && option.isCorrect
                ? 'bg-green-50 border-green-200 text-green-800'
                : showAnswers && Array.isArray(userAnswer) && userAnswer.includes(option.id) && !option.isCorrect
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-700">
                {String.fromCharCode(65 + index)}.
              </span>
              <span>{option.text}</span>
              {showAnswers && option.isCorrect && (
                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
              )}
              {showAnswers && Array.isArray(userAnswer) && userAnswer.includes(option.id) && !option.isCorrect && (
                <XCircle className="h-4 w-4 text-red-600 ml-auto" />
              )}
            </div>
          </Label>
        </div>
      ))}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="space-y-3">
      <RadioGroup 
        value={userAnswer as string} 
        onValueChange={handleAnswerChange}
        disabled={readOnly || submitted}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="true" />
          <Label 
            htmlFor="true" 
            className={`flex-1 cursor-pointer p-4 rounded-lg border transition-colors ${
              showAnswers && question.correctAnswer === 'true'
                ? 'bg-green-50 border-green-200 text-green-800'
                : showAnswers && userAnswer === 'true' && question.correctAnswer !== 'true'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Benar</span>
              {showAnswers && question.correctAnswer === 'true' && (
                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
              )}
              {showAnswers && userAnswer === 'true' && question.correctAnswer !== 'true' && (
                <XCircle className="h-4 w-4 text-red-600 ml-auto" />
              )}
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="false" />
          <Label 
            htmlFor="false" 
            className={`flex-1 cursor-pointer p-4 rounded-lg border transition-colors ${
              showAnswers && question.correctAnswer === 'false'
                ? 'bg-green-50 border-green-200 text-green-800'
                : showAnswers && userAnswer === 'false' && question.correctAnswer !== 'false'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium">Salah</span>
              {showAnswers && question.correctAnswer === 'false' && (
                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
              )}
              {showAnswers && userAnswer === 'false' && question.correctAnswer !== 'false' && (
                <XCircle className="h-4 w-4 text-red-600 ml-auto" />
              )}
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  const renderFillBlank = () => (
    <div className="space-y-3">
      <Input
        value={userAnswer as string}
        onChange={(e) => handleAnswerChange(e.target.value)}
        placeholder="Masukkan jawaban..."
        disabled={readOnly || submitted}
        className={`${
          showAnswers && isCorrect
            ? 'border-green-500 bg-green-50'
            : showAnswers && !isCorrect
            ? 'border-red-500 bg-red-50'
            : ''
        }`}
      />
      {showAnswers && question.correctAnswer && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900">Jawaban yang benar:</p>
          <p className="text-sm text-blue-800">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );

  const renderEssay = () => (
    <div className="space-y-3">
      <Textarea
        value={userAnswer as string}
        onChange={(e) => handleAnswerChange(e.target.value)}
        placeholder="Tuliskan jawaban essay Anda..."
        className="min-h-[150px]"
        disabled={readOnly || submitted}
      />
      <div className="text-sm text-gray-500 text-right">
        {(userAnswer as string).length} karakter
      </div>
      {showAnswers && question.correctAnswer && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900">Jawaban yang disarankan:</p>
          <p className="text-sm text-blue-800">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );

  const renderAnswerSection = () => {
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return renderMultipleChoice();
      case 'MULTIPLE_CHOICE_COMPLEX':
        return renderMultipleChoiceComplex();
      case 'TRUE_FALSE':
        return renderTrueFalse();
      case 'FILL_BLANK':
        return renderFillBlank();
      case 'ESSAY':
        return renderEssay();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Jenis soal tidak didukung untuk preview</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  {studentMode ? 'Soal' : 'Preview Soal'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {studentMode ? 'Jawab dengan teliti' : 'Tampilan seperti yang dilihat siswa'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{renderQuestionType()}</Badge>
              {question.difficulty && (
                <DifficultyBadge difficulty={question.difficulty as 'EASY' | 'MEDIUM' | 'HARD'} />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Question Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {question.points && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Poin: {question.points}</span>
              </div>
            )}
            {question.timeLimit && question.timeLimit > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Waktu: {question.timeLimit} menit</span>
              </div>
            )}
            {question.gradeLevel && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Kelas: {question.gradeLevel}</span>
              </div>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Question Text */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Pertanyaan:</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{question.questionText}</p>
            </div>
          </div>

          {/* Answer Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Jawaban:</h3>
            {renderAnswerSection()}
          </div>

          {/* Submit Button */}
          {!readOnly && !submitted && studentMode && (
            <div className="flex justify-center">
              <Button 
                onClick={handleSubmit}
                disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)}
                className="px-8"
              >
                Kirim Jawaban
              </Button>
            </div>
          )}

          {/* Results */}
          {showResults && submitted && (
            <div className={`mt-6 p-4 rounded-lg border ${
              isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Jawaban Benar!' : 'Jawaban Salah'}
                </span>
              </div>
              {question.points && (
                <p className="text-sm text-gray-600">
                  Poin yang didapat: {isCorrect ? question.points : 0} dari {question.points}
                </p>
              )}
            </div>
          )}

          {/* Explanation */}
          {(showExplanation || (showResults && submitted)) && question.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Penjelasan:</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionPreview;
