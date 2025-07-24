import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Target, BookOpen } from 'lucide-react';

interface EssayQuestionData {
  suggestedAnswer?: string;
  scoringRubric?: string;
  maxLength?: number;
  scoringMethod: 'MANUAL' | 'RUBRIC' | 'KEYWORDS';
  keywords?: string[];
}

interface EssayQuestionHandlerProps {
  data: EssayQuestionData;
  onChange: (data: EssayQuestionData) => void;
  errors?: Record<string, string>;
}

const EssayQuestionHandler: React.FC<EssayQuestionHandlerProps> = ({
  data,
  onChange,
  errors
}) => {
  const handleChange = (field: keyof EssayQuestionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleKeywordsChange = (keywordsString: string) => {
    const keywords = keywordsString
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    handleChange('keywords', keywords);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Konfigurasi Soal Esai</h3>
      </div>

      {/* Suggested Answer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Jawaban yang Disarankan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggestedAnswer">
              Contoh Jawaban Ideal
            </Label>
            <Textarea
              id="suggestedAnswer"
              placeholder="Masukkan contoh jawaban yang ideal untuk soal ini..."
              value={data.suggestedAnswer || ''}
              onChange={(e) => handleChange('suggestedAnswer', e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-sm text-gray-600">
              Jawaban ini akan digunakan sebagai referensi untuk penilaian
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLength">
              Batas Maksimal Karakter (Opsional)
            </Label>
            <Input
              id="maxLength"
              type="number"
              min="50"
              max="5000"
              value={data.maxLength || ''}
              onChange={(e) => handleChange('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Contoh: 500"
            />
            <p className="text-sm text-gray-600">
              Kosongkan untuk tanpa batas karakter
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Metode Penilaian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scoringMethod">
              Cara Penilaian <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.scoringMethod}
              onValueChange={(value) => handleChange('scoringMethod', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode penilaian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Manual oleh Guru</SelectItem>
                <SelectItem value="RUBRIC">Berdasarkan Rubrik</SelectItem>
                <SelectItem value="KEYWORDS">Berdasarkan Kata Kunci</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scoring Rubric */}
          {data.scoringMethod === 'RUBRIC' && (
            <div className="space-y-2">
              <Label htmlFor="scoringRubric">
                Rubrik Penilaian <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="scoringRubric"
                placeholder="Contoh:
- Pemahaman konsep (40%)
- Contoh yang relevan (30%)
- Kesimpulan yang logis (20%)
- Tata bahasa dan ejaan (10%)"
                value={data.scoringRubric || ''}
                onChange={(e) => handleChange('scoringRubric', e.target.value)}
                className={`min-h-[120px] ${errors?.scoringRubric ? 'border-red-500' : ''}`}
              />
              {errors?.scoringRubric && (
                <p className="text-sm text-red-500">{errors.scoringRubric}</p>
              )}
              <p className="text-sm text-gray-600">
                Jelaskan kriteria penilaian yang akan digunakan untuk menilai jawaban siswa
              </p>
            </div>
          )}

          {/* Keywords for automatic scoring */}
          {data.scoringMethod === 'KEYWORDS' && (
            <div className="space-y-2">
              <Label htmlFor="keywords">
                Kata Kunci Penting <span className="text-red-500">*</span>
              </Label>
              <Input
                id="keywords"
                placeholder="Contoh: demokrasi, pancasila, kebebasan (pisahkan dengan koma)"
                value={data.keywords?.join(', ') || ''}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                className={errors?.keywords ? 'border-red-500' : ''}
              />
              {errors?.keywords && (
                <p className="text-sm text-red-500">{errors.keywords}</p>
              )}
              <p className="text-sm text-gray-600">
                Pisahkan kata kunci dengan koma. Sistem akan memberikan poin berdasarkan keberadaan kata kunci ini.
              </p>
              {data.keywords && data.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scoring Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Panduan Metode Penilaian:</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div>
              <strong>Manual oleh Guru:</strong> Guru akan menilai setiap jawaban siswa secara manual berdasarkan kriteria sendiri.
            </div>
            <div>
              <strong>Berdasarkan Rubrik:</strong> Penilaian mengikuti rubrik yang telah ditentukan dengan kriteria yang jelas.
            </div>
            <div>
              <strong>Berdasarkan Kata Kunci:</strong> Sistem otomatis memberikan poin berdasarkan kata kunci yang muncul dalam jawaban siswa.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Metode Penilaian:</span>
            <p className="text-gray-600">
              {data.scoringMethod === 'MANUAL' && 'Manual oleh Guru'}
              {data.scoringMethod === 'RUBRIC' && 'Berdasarkan Rubrik'}
              {data.scoringMethod === 'KEYWORDS' && 'Berdasarkan Kata Kunci'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Batas Karakter:</span>
            <p className="text-gray-600">
              {data.maxLength ? `${data.maxLength} karakter` : 'Tanpa batas'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Kata Kunci:</span>
            <p className="text-gray-600">
              {data.keywords && data.keywords.length > 0 
                ? `${data.keywords.length} kata kunci`
                : 'Tidak ada'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayQuestionHandler;
