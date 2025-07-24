import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default system configurations
const DEFAULT_CONFIGS = [
  {
    key: 'DEFAULT_SCHOOL_ID',
    value: '',
    description: 'Default school ID for new classes',
    category: 'school'
  },
  {
    key: 'DEFAULT_ACADEMIC_YEAR',
    value: '2024/2025',
    description: 'Current academic year',
    category: 'academic'
  },
  {
    key: 'SYSTEM_INITIALIZED',
    value: 'false',
    description: 'Whether the system has been initialized',
    category: 'system'
  },
  {
    key: 'SCHOOL_NAME',
    value: '',
    description: 'Official school name',
    category: 'school'
  },
  {
    key: 'SCHOOL_ADDRESS',
    value: '',
    description: 'School address',
    category: 'school'
  },
  {
    key: 'SCHOOL_PHONE',
    value: '',
    description: 'School phone number',
    category: 'school'
  },
  {
    key: 'SCHOOL_EMAIL',
    value: '',
    description: 'School email address',
    category: 'school'
  },
  {
    key: 'PRINCIPAL_NAME',
    value: '',
    description: 'Principal name',
    category: 'school'
  },
  {
    key: 'PRINCIPAL_NIP',
    value: '',
    description: 'Principal NIP (ID number)',
    category: 'school'
  },
  {
    key: 'ACADEMIC_YEAR_START_MONTH',
    value: '7',
    description: 'Academic year start month (1-12)',
    category: 'academic'
  }
];

// Get all configurations
export const getAllConfigs = async (req, res) => {
  try {
    const configs = await prisma.config.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Group configs by category
    const groupedConfigs = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push({
        id: config.id,
        key: config.key,
        value: config.value,
        description: config.description,
        updatedAt: config.updatedAt
      });
      return acc;
    }, {});

    res.json({
      success: true,
      message: 'Configurations retrieved successfully',
      data: {
        configs: groupedConfigs,
        total: configs.length
      }
    });

  } catch (error) {
    console.error('Error getting configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve configurations',
      error: error.message
    });
  }
};

// Get specific configuration by key
export const getConfigByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const config = await prisma.config.findUnique({
      where: { 
        key: key.toUpperCase(),
        isActive: true 
      }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Configuration retrieved successfully',
      data: config
    });

  } catch (error) {
    console.error('Error getting config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve configuration',
      error: error.message
    });
  }
};

// Update configuration
export const updateConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const existingConfig = await prisma.config.findUnique({
      where: { key: key.toUpperCase() }
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    const updatedConfig = await prisma.config.update({
      where: { key: key.toUpperCase() },
      data: {
        value: value.toString(),
        description: description || existingConfig.description,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: updatedConfig
    });

  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      error: error.message
    });
  }
};

// Update multiple configurations
export const updateMultipleConfigs = async (req, res) => {
  try {
    const { configs } = req.body;

    if (!configs || !Array.isArray(configs)) {
      return res.status(400).json({
        success: false,
        message: 'Configs array is required'
      });
    }

    const updatePromises = configs.map(async (config) => {
      return prisma.config.upsert({
        where: { key: config.key.toUpperCase() },
        update: {
          value: config.value.toString(),
          description: config.description,
          updatedAt: new Date()
        },
        create: {
          key: config.key.toUpperCase(),
          value: config.value.toString(),
          description: config.description,
          category: config.category || 'system'
        }
      });
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Configurations updated successfully',
      data: { updated: configs.length }
    });

  } catch (error) {
    console.error('Error updating multiple configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update configurations',
      error: error.message
    });
  }
};

// Initialize system with default configurations
export const initializeSystem = async (req, res) => {
  try {
    const { 
      schoolName, 
      schoolId, 
      academicYear,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      principalName,
      principalNip 
    } = req.body;

    // Check if system is already initialized
    const systemConfig = await prisma.config.findUnique({
      where: { key: 'SYSTEM_INITIALIZED' }
    });

    if (systemConfig && systemConfig.value === 'true') {
      return res.status(400).json({
        success: false,
        message: 'System has already been initialized'
      });
    }

    // Create or update configurations
    const configsToSet = [
      {
        key: 'SCHOOL_NAME',
        value: schoolName || '',
        description: 'Official school name',
        category: 'school'
      },
      {
        key: 'DEFAULT_SCHOOL_ID',
        value: schoolId || '',
        description: 'Default school ID for new classes',
        category: 'school'
      },
      {
        key: 'SCHOOL_ADDRESS',
        value: schoolAddress || '',
        description: 'School address',
        category: 'school'
      },
      {
        key: 'SCHOOL_PHONE',
        value: schoolPhone || '',
        description: 'School phone number',
        category: 'school'
      },
      {
        key: 'SCHOOL_EMAIL',
        value: schoolEmail || '',
        description: 'School email address',
        category: 'school'
      },
      {
        key: 'PRINCIPAL_NAME',
        value: principalName || '',
        description: 'Principal name',
        category: 'school'
      },
      {
        key: 'PRINCIPAL_NIP',
        value: principalNip || '',
        description: 'Principal NIP (ID number)',
        category: 'school'
      },
      {
        key: 'DEFAULT_ACADEMIC_YEAR',
        value: academicYear || '2024/2025',
        description: 'Current academic year',
        category: 'academic'
      },
      {
        key: 'SYSTEM_INITIALIZED',
        value: 'true',
        description: 'Whether the system has been initialized',
        category: 'system'
      }
    ];

    const setupPromises = configsToSet.map(config => 
      prisma.config.upsert({
        where: { key: config.key },
        update: {
          value: config.value,
          description: config.description,
          updatedAt: new Date()
        },
        create: config
      })
    );

    await Promise.all(setupPromises);

    res.json({
      success: true,
      message: 'System initialized successfully',
      data: {
        schoolName,
        schoolId,
        schoolAddress,
        schoolPhone,
        schoolEmail,
        principalName,
        principalNip,
        academicYear,
        initialized: true
      }
    });

  } catch (error) {
    console.error('Error initializing system:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize system',
      error: error.message
    });
  }
};

// Check if system is initialized
export const checkSystemStatus = async (req, res) => {
  try {
    const systemConfig = await prisma.config.findUnique({
      where: { key: 'SYSTEM_INITIALIZED' }
    });

    const isInitialized = systemConfig?.value === 'true';

    // Get basic system info if initialized
    let systemInfo = { initialized: isInitialized };
    
    if (isInitialized) {
      const configs = await prisma.config.findMany({
        where: {
          key: { 
            in: [
              'SCHOOL_NAME', 
              'DEFAULT_ACADEMIC_YEAR', 
              'DEFAULT_SCHOOL_ID',
              'SCHOOL_ADDRESS',
              'SCHOOL_PHONE', 
              'SCHOOL_EMAIL',
              'PRINCIPAL_NAME',
              'PRINCIPAL_NIP'
            ] 
          },
          isActive: true
        }
      });

      systemInfo = configs.reduce((acc, config) => {
        acc[config.key.toLowerCase()] = config.value;
        return acc;
      }, { initialized: true });
    }

    res.json({
      success: true,
      message: 'System status retrieved successfully',
      data: systemInfo
    });

  } catch (error) {
    console.error('Error checking system status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check system status',
      error: error.message
    });
  }
};

// Helper function to get config value by key
export const getConfigValue = async (key) => {
  try {
    const config = await prisma.config.findUnique({
      where: { 
        key: key.toUpperCase(),
        isActive: true 
      }
    });
    return config?.value || null;
  } catch (error) {
    console.error('Error getting config value:', error);
    return null;
  }
};

// Initialize default configs on first run
export const seedDefaultConfigs = async () => {
  try {
    for (const defaultConfig of DEFAULT_CONFIGS) {
      await prisma.config.upsert({
        where: { key: defaultConfig.key },
        update: {}, // Don't update existing configs
        create: defaultConfig
      });
    }
    console.log('✅ Default configurations seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding default configs:', error);
  }
};

// Reset system configuration (for admin use)
export const resetSystemConfig = async (req, res) => {
  try {
    // Reset system initialization status
    await prisma.config.upsert({
      where: { key: 'SYSTEM_INITIALIZED' },
      update: {
        value: 'false',
        updatedAt: new Date()
      },
      create: {
        key: 'SYSTEM_INITIALIZED',
        value: 'false',
        description: 'Whether the system has been initialized',
        category: 'system'
      }
    });

    // Seed all default configs (including new ones)
    await seedDefaultConfigs();

    res.json({
      success: true,
      message: 'System configuration reset successfully. You can now setup again.',
      data: {
        initialized: false,
        reset: true
      }
    });

  } catch (error) {
    console.error('Error resetting system config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset system configuration',
      error: error.message
    });
  }
};
