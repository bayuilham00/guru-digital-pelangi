import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceOptionsProps {
  options: QuestionOption[];
  questionType: 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_COMPLEX';
  onChange: (options: QuestionOption[]) => void;
  errors?: string;
}

const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsProps> = ({
  options,
  questionType,
  onChange,
  errors
}) => {
  const isComplex = questionType === 'MULTIPLE_CHOICE_COMPLEX';

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    onChange(newOptions);
  };

  const handleCorrectAnswerChange = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];
    
    if (isComplex) {
      // For complex multiple choice, multiple answers can be correct
      newOptions[index] = { ...newOptions[index], isCorrect };
    } else {
      // For regular multiple choice, only one answer can be correct
      newOptions.forEach((option, i) => {
        newOptions[i] = { ...newOptions[i], isCorrect: i === index && isCorrect };
      });
    }
    
    onChange(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      onChange([...options, { text: '', isCorrect: false }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      onChange(newOptions);
    }
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < options.length) {
      const newOptions = [...options];
      [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
      onChange(newOptions);
    }
  };

  const getOptionLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Pilihan Jawaban <span className="text-red-500">*</span>
        </Label>
        <div className="text-sm text-gray-600">
          {isComplex ? 'Bisa memilih lebih dari satu jawaban benar' : 'Hanya satu jawaban benar'}
        </div>
      </div>

      {errors && (
        <p className="text-sm text-red-500">{errors}</p>
      )}

      <div className="space-y-3">
        {options.map((option, index) => (
          <Card key={index} className={`transition-all ${option.isCorrect ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Option Label */}
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-sm">
                  {getOptionLabel(index)}
                </div>

                {/* Correct Answer Selector */}
                <div className="flex-shrink-0">
                  {isComplex ? (
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => handleCorrectAnswerChange(index, !!checked)}
                      aria-label={`Set option ${getOptionLabel(index)} as correct`}
                    />
                  ) : (
                    <RadioGroup
                      value={options.findIndex(opt => opt.isCorrect).toString()}
                      onValueChange={(value) => handleCorrectAnswerChange(parseInt(value), true)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      </div>
                    </RadioGroup>
                  )}
                </div>

                {/* Option Text Input */}
                <div className="flex-1">
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(index, e.target.value)}
                    placeholder={`Masukkan pilihan ${getOptionLabel(index)}...`}
                    className={`${option.isCorrect ? 'border-green-300' : ''}`}
                  />
                </div>

                {/* Correct Answer Indicator */}
                {option.isCorrect && (
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                )}

                {/* Move Buttons */}
                <div className="flex-shrink-0 flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveOption(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveOption(index, 'down')}
                    disabled={index === options.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* Remove Button */}
                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Option Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={addOption}
          disabled={options.length >= 6}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Pilihan ({options.length}/6)
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Petunjuk:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Minimal 2 pilihan, maksimal 6 pilihan</li>
            {isComplex ? (
              <>
                <li>Bisa memilih lebih dari satu jawaban benar (centang kotak)</li>
                <li>Harus ada minimal 1 jawaban benar</li>
              </>
            ) : (
              <>
                <li>Hanya boleh ada 1 jawaban benar (pilih radio button)</li>
                <li>Wajib memilih 1 jawaban benar</li>
              </>
            )}
            <li>Gunakan tombol panah untuk mengubah urutan pilihan</li>
            <li>Klik ikon tempat sampah untuk menghapus pilihan</li>
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <span>Total pilihan: {options.length}</span>
        <span>
          Jawaban benar: {options.filter(opt => opt.isCorrect && opt.text.trim()).length}
        </span>
        <span>
          Pilihan terisi: {options.filter(opt => opt.text.trim()).length}
        </span>
      </div>
    </div>
  );
};

export default MultipleChoiceOptions;
