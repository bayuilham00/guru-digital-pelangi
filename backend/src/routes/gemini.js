import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting for AI API calls
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak permintaan AI. Silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced AI template generation with structured output
const generateTemplateWithAI = async (subject, topic, duration, gradeLevel, additionalContext) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Sebagai seorang guru yang berpengalaman, buatlah template rencana pembelajaran yang lengkap dengan detail berikut:

**Informasi Dasar:**
- Mata Pelajaran: ${subject}
- Topik: ${topic}
- Durasi: ${duration} menit
- Tingkat Kelas: ${gradeLevel}
${additionalContext ? `- Konteks Tambahan: ${additionalContext}` : ''}

**Hasilkan template dalam format JSON yang terstruktur dengan komponen berikut:**

1. **learningObjectives** (array): 3-5 tujuan pembelajaran yang spesifik dan terukur
2. **templateStructure** (object) berisi:
   - **introduction** (string): Kegiatan pembukaan dan apersepsi (10-15% dari durasi)
   - **mainActivity** (string): Kegiatan inti pembelajaran yang detail (70-80% dari durasi)
   - **conclusion** (string): Kegiatan penutup dan refleksi (10-15% dari durasi)
   - **assessment** (object) berisi:
     - **type** (string): Jenis penilaian (formatif/sumatif/praktik)
     - **criteria** (string): Kriteria penilaian yang jelas
   - **resources** (array): Daftar sumber belajar dan alat yang dibutuhkan
3. **difficultyLevel** (string): Level kesulitan (BEGINNER/INTERMEDIATE/ADVANCED)
4. **keyActivities** (array): 3-5 aktivitas kunci yang akan dilakukan siswa
5. **prerequisiteSkills** (array): 2-3 keterampilan prasyarat yang harus dikuasai siswa
6. **extendedActivities** (array): 2-3 kegiatan pengayaan untuk siswa yang lebih cepat

**Format output harus dalam JSON yang valid dan dapat di-parse:**

{
  "learningObjectives": [...],
  "templateStructure": {
    "introduction": "...",
    "mainActivity": "...",
    "conclusion": "...",
    "assessment": {
      "type": "...",
      "criteria": "..."
    },
    "resources": [...]
  },
  "difficultyLevel": "...",
  "keyActivities": [...],
  "prerequisiteSkills": [...],
  "extendedActivities": [...]
}

Pastikan semua konten relevan dengan kurikulum Indonesia dan sesuai dengan karakteristik siswa Indonesia.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response tidak mengandung JSON yang valid');
    }

    const generatedTemplate = JSON.parse(jsonMatch[0]);

    // Validate generated template structure
    if (!generatedTemplate.learningObjectives || !generatedTemplate.templateStructure) {
      throw new Error('Template yang dihasilkan tidak memiliki struktur yang benar');
    }

    return generatedTemplate;
  } catch (error) {
    console.error('AI generation error:', error);
    if (error.message.includes('API key')) {
      throw new Error('Konfigurasi API key tidak valid');
    } else if (error.message.includes('quota')) {
      throw new Error('Kuota API sudah habis. Silakan coba lagi nanti.');
    } else if (error.message.includes('JSON')) {
      throw new Error('Format response AI tidak valid');
    } else {
      throw new Error('Gagal membuat template dengan AI: ' + error.message);
    }
  }
};

// Input validation schema
const validateTemplateInput = (req, res, next) => {
  const { subject, topic, duration, gradeLevel } = req.body;

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Mata pelajaran harus diisi dan berupa string yang valid' 
    });
  }

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Topik harus diisi dan berupa string yang valid' 
    });
  }

  if (!duration || typeof duration !== 'number' || duration < 30 || duration > 360) {
    return res.status(400).json({ 
      success: false, 
      message: 'Durasi harus berupa angka antara 30-360 menit' 
    });
  }

  if (!gradeLevel || typeof gradeLevel !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Tingkat kelas harus diisi' 
    });
  }

  next();
};

// Generate template with AI
router.post('/generate-template', [
  aiRateLimit,
  authenticateToken, 
  authorizeRoles(['GURU', 'ADMIN']),
  validateTemplateInput
], async (req, res) => {
  const { subject, topic, duration, gradeLevel, additionalContext, saveAsTemplate } = req.body;

  try {
    console.log(`🤖 Generating AI template for: ${subject} - ${topic} (${duration}min)`);

    // Generate template using AI
    const aiTemplate = await generateTemplateWithAI(
      subject, 
      topic, 
      duration, 
      gradeLevel, 
      additionalContext
    );

    const templateName = `AI Generated: ${topic}`;
    
    // If user wants to save as template
    if (saveAsTemplate) {
      try {
        // Get subject ID from database
        const subjectRecord = await prisma.subject.findFirst({
          where: { 
            name: { 
              contains: subject, 
              mode: 'insensitive' 
            } 
          }
        });

        if (!subjectRecord) {
          return res.status(400).json({
            success: false,
            message: 'Mata pelajaran tidak ditemukan dalam database'
          });
        }

        // Save to database
        const savedTemplate = await prisma.lessonTemplate.create({
          data: {
            name: templateName,
            description: `Template yang dibuat dengan AI untuk topik ${topic}`,
            subjectId: subjectRecord.id,
            createdBy: req.user.id,
            estimatedDuration: duration,
            isPublic: false,
            learningObjectives: aiTemplate.learningObjectives || [],
            templateStructure: aiTemplate.templateStructure || {},
            difficultyLevel: aiTemplate.difficultyLevel || 'INTERMEDIATE',
            gradeLevel: gradeLevel,
            // Additional AI-generated fields
            keyActivities: aiTemplate.keyActivities || [],
            prerequisiteSkills: aiTemplate.prerequisiteSkills || [],
            extendedActivities: aiTemplate.extendedActivities || []
          },
          include: {
            subject: {
              select: { id: true, name: true, code: true }
            },
            createdByUser: {
              select: { id: true, fullName: true }
            }
          }
        });

        console.log(`✅ AI template saved with ID: ${savedTemplate.id}`);

        return res.json({
          success: true,
          message: 'Template berhasil dibuat dan disimpan',
          data: {
            template: savedTemplate,
            aiGenerated: true,
            generatedAt: new Date().toISOString()
          }
        });

      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Still return the AI-generated template even if save fails
        return res.json({
          success: true,
          message: 'Template berhasil dibuat, tetapi tidak dapat disimpan',
          data: {
            template: {
              name: templateName,
              description: `Template yang dibuat dengan AI untuk topik ${topic}`,
              estimatedDuration: duration,
              gradeLevel: gradeLevel,
              ...aiTemplate
            },
            aiGenerated: true,
            generatedAt: new Date().toISOString(),
            saveError: 'Gagal menyimpan ke database'
          }
        });
      }
    }

    // Return AI-generated template without saving
    res.json({
      success: true,
      message: 'Template berhasil dibuat dengan AI',
      data: {
        template: {
          name: templateName,
          description: `Template yang dibuat dengan AI untuk topik ${topic}`,
          estimatedDuration: duration,
          gradeLevel: gradeLevel,
          ...aiTemplate
        },
        aiGenerated: true,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ AI generation error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Gagal membuat template dengan AI';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'Konfigurasi AI tidak valid';
      statusCode = 500;
    } else if (error.message.includes('quota')) {
      errorMessage = 'Kuota AI sudah habis. Silakan coba lagi nanti.';
      statusCode = 429;
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
      statusCode = 429;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Waktu permintaan habis. Silakan coba lagi.';
      statusCode = 408;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get AI generation status/health
router.get('/status', [authenticateToken], async (req, res) => {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    
    res.json({
      success: true,
      data: {
        aiAvailable: hasApiKey,
        service: 'Google Gemini',
        model: 'gemini-pro',
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 10 // requests per window
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengecek status AI'
    });
  }
});

export default router;