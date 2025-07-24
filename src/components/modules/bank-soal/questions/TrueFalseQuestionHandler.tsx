import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle, HelpCircle, Info } from 'lucide-react';

interface TrueFalseQuestionHandlerProps {
  correctAnswer: string;
  explanation: string;
  onCorrectAnswerChange: (answer: string) => void;
  onExplanationChange: (explanation: string) => void;
  readOnly?: boolean;
}

const TrueFalseQuestionHandler: React.FC<TrueFalseQuestionHandlerProps> = ({
  correctAnswer,
  explanation,
  onCorrectAnswerChange,
  onExplanationChange,
  readOnly = false
}) => {
  const handleAnswerChange = (value: string) => {
    if (!readOnly) {
      onCorrectAnswerChange(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Answer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Jawaban Benar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* True Option */}
              <div 
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  correctAnswer === 'true'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                onClick={() => handleAnswerChange('true')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`h-6 w-6 ${
                      correctAnswer === 'true' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">Benar</p>
                      <p className="text-sm text-gray-600">
                        Pilih jika pernyataan benar
                      </p>
                    </div>
                  </div>
                  {correctAnswer === 'true' && (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* False Option */}
              <div 
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  correctAnswer === 'false'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                onClick={() => handleAnswerChange('false')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <XCircle className={`h-6 w-6 ${
                      correctAnswer === 'false' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">Salah</p>
                      <p className="text-sm text-gray-600">
                        Pilih jika pernyataan salah
                      </p>
                    </div>
                  </div>
                  {correctAnswer === 'false' && (
                    <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Message */}
            {!correctAnswer && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <Info className="h-4 w-4" />
                <span>Pilih jawaban yang benar untuk soal ini</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Penjelasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="explanation" className="text-sm font-medium text-gray-700">
                Penjelasan Jawaban
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Berikan penjelasan mengapa jawaban tersebut benar atau salah
              </p>
              <Textarea
                id="explanation"
                placeholder="Contoh: Pernyataan ini benar karena... atau Pernyataan ini salah karena..."
                value={explanation}
                onChange={(e) => !readOnly && onExplanationChange(e.target.value)}
                className="min-h-[100px]"
                readOnly={readOnly}
              />
            </div>

            {/* Character Count */}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Penjelasan yang baik membantu siswa memahami konsep</span>
              <span>{explanation.length} karakter</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">
            Preview Soal True/False
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border text-center ${
                correctAnswer === 'true' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <CheckCircle className={`h-5 w-5 mx-auto mb-1 ${
                  correctAnswer === 'true' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">Benar</span>
              </div>
              <div className={`p-3 rounded-lg border text-center ${
                correctAnswer === 'false' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <XCircle className={`h-5 w-5 mx-auto mb-1 ${
                  correctAnswer === 'false' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">Salah</span>
              </div>
            </div>

            {explanation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Penjelasan:</p>
                <p className="text-sm text-blue-800">{explanation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Tips Soal True/False:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Buat pernyataan yang jelas dan tidak ambigu</li>
              <li>• Hindari kata-kata seperti "selalu" atau "tidak pernah"</li>
              <li>• Berikan penjelasan yang membantu siswa memahami konsep</li>
              <li>• Pastikan jawaban dapat diverifikasi dengan jelas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrueFalseQuestionHandler;
