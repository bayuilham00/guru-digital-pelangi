// Updated: Tab-based login form for Admin, Guru, and Siswa
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card, CardBody, CardHeader, Tabs, Tab, Spinner } from '@heroui/react';
import { Eye, EyeOff, User, Lock, GraduationCap, Shield, Users, Mail } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';

// Validation schemas for each user type
const adminLoginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
});

const guruLoginSchema = z.object({
  nip: z.string().regex(/^\d{18}$/, 'NIP harus 18 digit'),
  password: z.string().min(6, 'Password minimal 6 karakter')
});

const siswaLoginSchema = z.object({
  nisn: z.string().regex(/^\d{10}$/, 'NISN harus 10 digit'),
  password: z.string().min(6, 'Password minimal 6 karakter')
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;
type GuruLoginData = z.infer<typeof guruLoginSchema>;
type SiswaLoginData = z.infer<typeof siswaLoginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('guru');
  const { login, isLoading, error, clearError } = useAuthStore();

  // Form instances for each user type
  const adminForm = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema)
  });

  const guruForm = useForm<GuruLoginData>({
    resolver: zodResolver(guruLoginSchema)
  });

  const siswaForm = useForm<SiswaLoginData>({
    resolver: zodResolver(siswaLoginSchema)
  });

  const getCurrentForm = () => {
    switch (selectedTab) {
      case 'admin': return adminForm;
      case 'guru': return guruForm;
      case 'siswa': return siswaForm;
      default: return adminForm;
    }
  };

  const onSubmit = async (data: AdminLoginData | GuruLoginData | SiswaLoginData) => {
    console.log('🔐 LoginForm: Submitting login...', { userType: selectedTab, data });
    clearError();
    
    let identifier: string;
    switch (selectedTab) {
      case 'admin':
        identifier = (data as AdminLoginData).email;
        break;
      case 'guru':
        identifier = (data as GuruLoginData).nip;
        break;
      case 'siswa':
        identifier = (data as SiswaLoginData).nisn;
        break;
      default:
        identifier = '';
    }

    const success = await login(identifier, data.password);
    console.log('🔐 LoginForm: Login result:', success);

    if (success) {
      console.log('🔐 LoginForm: Login successful, calling onSuccess...');
      onSuccess?.();
    } else {
      console.log('🔐 LoginForm: Login failed');
    }
  };

  const tabConfig = [
    {
      key: 'guru',
      label: 'Guru',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'siswa',
      label: 'Siswa',
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      key: 'admin',
      label: 'Admin',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const getLoginButtonLabel = () => {
    switch (selectedTab) {
      case 'guru': return 'Masuk sebagai Guru';
      case 'siswa': return 'Masuk sebagai Siswa';
      case 'admin': return 'Masuk sebagai Admin';
      default: return 'Masuk';
    }
  };

  const getLoadingLabel = () => {
    switch (selectedTab) {
      case 'guru': return 'Masuk sebagai Guru...';
      case 'siswa': return 'Masuk sebagai Siswa...';
      case 'admin': return 'Masuk sebagai Admin...';
      default: return 'Masuk...';
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'admin': {
        const { register: adminRegister, formState: { errors: adminErrors } } = adminForm;
        return (
          <div className="space-y-4">
            <Input
              {...adminRegister('email')}
              type="email"
              label="Email Administrator"
              placeholder="admin@pelangi.sch.id"
              startContent={<Mail className="w-4 h-4 text-gray-400" />}
              isInvalid={!!adminErrors.email}
              errorMessage={adminErrors.email?.message}
              variant="bordered"
              classNames={{
                label: "text-gray-700 !text-gray-700",
                input: "text-gray-900 !text-gray-900",
                inputWrapper: "bg-white border-gray-300"
              }}
            />
            <Input
              {...adminRegister('password')}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Masukkan password Anda"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
              isInvalid={!!adminErrors.password}
              errorMessage={adminErrors.password?.message}
              variant="bordered"
              classNames={{
                label: "text-gray-700 !text-gray-700",
                input: "text-gray-900 !text-gray-900",
                inputWrapper: "bg-white border-gray-300"
              }}
            />
          </div>
        );
      }

      case 'guru': {
        const { register: guruRegister, formState: { errors: guruErrors } } = guruForm;
        return (
          <div className="space-y-4">
            <Input
              {...guruRegister('nip')}
              type="text"
              label="NIP Guru"
              placeholder="123456789012345678"
              startContent={<User className="w-4 h-4 text-gray-400" />}
              isInvalid={!!guruErrors.nip}
              errorMessage={guruErrors.nip?.message}
              variant="bordered"
              description="Masukkan NIP 18 digit"
              classNames={{
                label: "text-gray-700 !text-gray-700",
                input: "text-gray-900 !text-gray-900",
                description: "text-gray-600 !text-gray-600",
                inputWrapper: "bg-white border-gray-300"
              }}
            />
            <Input
              {...guruRegister('password')}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Masukkan password Anda"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
              isInvalid={!!guruErrors.password}
              errorMessage={guruErrors.password?.message}
              variant="bordered"
              classNames={{
                label: "text-gray-700 !text-gray-700",
                input: "text-gray-900 !text-gray-900",
                inputWrapper: "bg-white border-gray-300"
              }}
            />
          </div>
        );
      }

      case 'siswa': {
        const { register: siswaRegister, formState: { errors: siswaErrors } } = siswaForm;
        return (
          <div className="space-y-4">
            <Input
              {...siswaRegister('nisn')}
              type="text"
              label="NISN Siswa"
              placeholder="1234567890"
              startContent={<User className="w-4 h-4 text-gray-400" />}
              isInvalid={!!siswaErrors.nisn}
              errorMessage={siswaErrors.nisn?.message}
              variant="bordered"
              description="Masukkan NISN 10 digit"
              classNames={{
                label: "text-gray-700 !text-gray-700",
                input: "text-gray-900 !text-gray-900",
                description: "text-gray-600 !text-gray-600",
                inputWrapper: "bg-white border-gray-300"
              }}
            />
            <Input
              {...siswaRegister('password')}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Masukkan password Anda"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
              isInvalid={!!siswaErrors.password}
              errorMessage={siswaErrors.password?.message}
              variant="bordered"
              classNames={{
                label: "text-gray-700 !text-gray-700",
                input: "text-gray-900 !text-gray-900",
                inputWrapper: "bg-white border-gray-300"
              }}
            />
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white pb-6 pt-8">
            <div className="flex flex-col items-center justify-center space-y-3 w-full">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">
                  Guru Digital Pelangi
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Sistem Administrasi Guru Modern
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardBody className="pt-2">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              className="w-full"
              variant="underlined"
              classNames={{
                tabList: "w-full relative rounded-none p-0 border-b border-divider flex justify-center",
                cursor: "w-full bg-primary",
                tab: "flex-1 px-0 h-12 max-w-none",
                tabContent: "group-data-[selected=true]:text-primary w-full"
              }}
            >
              {tabConfig.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Tab
                    key={tab.key}
                    title={
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                    }
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="py-4"
                    >
                      <form onSubmit={getCurrentForm().handleSubmit(onSubmit)} className="space-y-4">
                        {renderTabContent()}

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 border border-red-200 rounded-lg p-3"
                          >
                            <p className="text-red-600 text-sm">{error}</p>
                          </motion.div>
                        )}

                        {/* Login Button */}
                        <Button
                          type="submit"
                          color="primary"
                          size="lg"
                          className="w-full font-semibold"
                          isLoading={isLoading}
                          disabled={isLoading}
                          startContent={
                            isLoading ? (
                              <Spinner 
                                size="sm" 
                                color="white" 
                                variant="wave"
                                classNames={{
                                  wrapper: "w-4 h-4"
                                }}
                              />
                            ) : null
                          }
                        >
                          {isLoading ? getLoadingLabel() : getLoginButtonLabel()}
                        </Button>
                      </form>
                    </motion.div>
                  </Tab>
                );
              })}
            </Tabs>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};
