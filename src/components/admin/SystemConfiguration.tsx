import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Textarea,
  Alert,
  Spacer,
  Divider,
  Tabs,
  Tab
} from '@nextui-org/react';
import { School, Calendar, Settings, Save, RefreshCw } from 'lucide-react';
import configService, { ConfigItem } from '../../services/configService';

const SystemConfiguration: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [configs, setConfigs] = useState<Record<string, ConfigItem[]>>({});
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setIsLoading(true);
    try {
      const response = await configService.getAllConfigs();
      setConfigs(response.data.configs);
      
      // Initialize form data
      const formValues: Record<string, string> = {};
      Object.values(response.data.configs).flat().forEach(config => {
        formValues[config.key] = config.value;
      });
      setFormData(formValues);
      
    } catch (error) {
      console.error('Error loading configurations:', error);
      setErrors({ load: 'Gagal memuat konfigurasi' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate academic year format
    if (formData.DEFAULT_ACADEMIC_YEAR && 
        !/^\d{4}\/\d{4}$/.test(formData.DEFAULT_ACADEMIC_YEAR)) {
      newErrors.DEFAULT_ACADEMIC_YEAR = 'Format tahun ajaran harus YYYY/YYYY';
    }

    // Validate academic year start month
    if (formData.ACADEMIC_YEAR_START_MONTH) {
      const month = parseInt(formData.ACADEMIC_YEAR_START_MONTH);
      if (isNaN(month) || month < 1 || month > 12) {
        newErrors.ACADEMIC_YEAR_START_MONTH = 'Bulan harus antara 1-12';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCategory = async (category: string) => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSuccess('');
    setErrors({});

    try {
      const categoryConfigs = configs[category] || [];
      const configsToUpdate = categoryConfigs.map(config => ({
        key: config.key,
        value: formData[config.key] || config.value,
        description: config.description,
        category: config.category
      }));

      await configService.updateMultipleConfigs(configsToUpdate);
      
      setSuccess(`Konfigurasi ${category} berhasil disimpan!`);
      
      // Refresh configurations
      await loadConfigurations();
      
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Save error:', error);
      setErrors({
        save: 'Terjadi kesalahan saat menyimpan konfigurasi'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const newYear = `${currentYear}/${nextYear}`;
    handleInputChange('DEFAULT_ACADEMIC_YEAR', newYear);
  };

  const renderConfigField = (config: ConfigItem) => {
    const commonProps = {
      key: config.id,
      label: config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: formData[config.key] || '',
      onValueChange: (value: string) => handleInputChange(config.key, value),
      description: config.description,
      isInvalid: !!errors[config.key],
      errorMessage: errors[config.key],
    };

    // Special handling for different config types
    switch (config.key) {
      case 'DEFAULT_ACADEMIC_YEAR':
        return (
          <div className="flex gap-2" key={config.id}>
            <Input
              {...commonProps}
              startContent={<Calendar size={18} />}
              placeholder="YYYY/YYYY"
            />
            <Button
              variant="flat"
              color="secondary"
              onPress={generateAcademicYear}
              className="mt-0"
            >
              Generate
            </Button>
          </div>
        );
      
      case 'SCHOOL_NAME':
        return (
          <Input
            {...commonProps}
            startContent={<School size={18} />}
            placeholder="Nama sekolah"
          />
        );
      
      case 'DEFAULT_SCHOOL_ID':
        return (
          <Input
            {...commonProps}
            startContent={<Settings size={18} />}
            placeholder="ID sekolah"
          />
        );
      
      default:
        return (
          <Input
            {...commonProps}
            placeholder={`Masukkan ${commonProps.label.toLowerCase()}`}
          />
        );
    }
  };

  const categoryTitles = {
    system: 'Pengaturan Sistem',
    school: 'Informasi Sekolah', 
    academic: 'Pengaturan Akademik'
  };

  const categoryDescriptions = {
    system: 'Konfigurasi dasar sistem dan inisialisasi',
    school: 'Informasi dan identitas sekolah',
    academic: 'Pengaturan terkait tahun ajaran dan akademik'
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardBody className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <p className="mt-4 text-default-500">Memuat konfigurasi...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex gap-3">
            <Settings className="text-primary" size={24} />
            <div className="flex flex-col">
              <p className="text-md font-semibold">Konfigurasi Sistem</p>
              <p className="text-small text-default-500">
                Kelola pengaturan sistem Guru Digital Pelangi
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {errors.load && (
        <Alert color="danger" title="Error" description={errors.load} />
      )}
      
      {success && (
        <Alert color="success" title="Berhasil" description={success} />
      )}

      <Tabs aria-label="Configuration categories" color="primary" variant="bordered">
        {Object.entries(configs).map(([category, categoryConfigs]) => (
          <Tab 
            key={category} 
            title={categoryTitles[category as keyof typeof categoryTitles] || category}
          >
            <Card>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {categoryTitles[category as keyof typeof categoryTitles] || category}
                  </h3>
                  <p className="text-small text-default-500">
                    {categoryDescriptions[category as keyof typeof categoryDescriptions] || 
                     `Pengaturan untuk kategori ${category}`}
                  </p>
                </div>

                <Divider />

                <div className="space-y-4">
                  {categoryConfigs
                    .filter(config => config.key !== 'SYSTEM_INITIALIZED')
                    .map(config => renderConfigField(config))
                  }
                </div>

                {errors.save && (
                  <Alert color="danger" title="Error" description={errors.save} />
                )}

                <div className="flex justify-end">
                  <Button
                    color="primary"
                    startContent={<Save size={18} />}
                    onPress={() => handleSaveCategory(category)}
                    isLoading={isSaving}
                    isDisabled={isSaving}
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;
