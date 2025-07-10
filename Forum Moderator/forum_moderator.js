const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Database simulasi untuk menyimpan log
class ModerationLogger {
    constructor() {
        this.logFile = path.join(__dirname, 'moderation_logs.json');
        this.initializeLogFile();
    }

    initializeLogFile() {
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, JSON.stringify([]));
        }
    }

    log(userId, originalContent, censoredContent, detectedWords) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: userId,
            originalContent: originalContent,
            censoredContent: censoredContent,
            detectedWords: detectedWords,
            severity: this.calculateSeverity(detectedWords)
        };

        try {
            const logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
            logs.push(logEntry);
            fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Error writing log:', error);
        }
    }

    calculateSeverity(detectedWords) {
        const profanityCount = detectedWords.filter(word => 
            PROFANITY_WORDS.includes(word.toLowerCase())
        ).length;
        
        const sensitiveCount = detectedWords.filter(word => 
            SENSITIVE_WORDS.includes(word.toLowerCase())
        ).length;

        if (sensitiveCount > 0) return 'HIGH';
        if (profanityCount > 2) return 'MEDIUM';
        return 'LOW';
    }

    getLogs(userId = null, limit = 100) {
        try {
            const logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
            let filteredLogs = logs;
            
            if (userId) {
                filteredLogs = logs.filter(log => log.userId === userId);
            }
            
            return filteredLogs.slice(-limit).reverse();
        } catch (error) {
            console.error('Error reading logs:', error);
            return [];
        }
    }
}

// Daftar kata-kata kasar dan tidak pantas
const PROFANITY_WORDS = [
    'anjing', 'babi', 'bangsat', 'bodoh', 'goblok', 'idiot', 'tolol', 'kampret',
    'sialan', 'bajingan', 'brengsek', 'keparat', 'kunyuk', 'monyet', 'setan',
    'damn', 'shit', 'fuck', 'bitch', 'asshole', 'stupid', 'idiot', 'moron'
];

// Daftar kata-kata sensitif (SARA, kekerasan, dll)
const SENSITIVE_WORDS = [
    'bunuh', 'matikan', 'habisi', 'bakar', 'ledakkan', 'hancurkan',
    'cina', 'pribumi', 'kafir', 'komunis', 'teroris', 'separatis',
    'drugs', 'narkoba', 'sabu', 'ganja', 'kokain', 'heroin',
    'bom', 'senjata', 'pistol', 'senapan', 'peluru', 'granat'
];

// Kata pengganti untuk sensor total
const REPLACEMENT_WORDS = {
    'anjing': 'hewan',
    'babi': 'hewan',
    'bangsat': 'orang',
    'bodoh': 'kurang pintar',
    'goblok': 'kurang pintar',
    'idiot': 'kurang pintar',
    'tolol': 'kurang pintar',
    'stupid': 'kurang pintar',
    'moron': 'kurang pintar',
    'bunuh': 'hentikan',
    'matikan': 'hentikan',
    'habisi': 'selesaikan',
    'bakar': 'panaskan',
    'ledakkan': 'pecahkan',
    'hancurkan': 'rusak'
};

class ContentModerator {
    constructor() {
        this.logger = new ModerationLogger();
    }

    // Fungsi untuk mendeteksi kata-kata terlarang
    detectInappropriateWords(content) {
        const words = content.toLowerCase().split(/\s+/);
        const detected = [];
        
        words.forEach(word => {
            // Hapus tanda baca dari kata
            const cleanWord = word.replace(/[^\w]/g, '');
            
            if (PROFANITY_WORDS.includes(cleanWord) || SENSITIVE_WORDS.includes(cleanWord)) {
                detected.push(cleanWord);
            }
        });
        
        return detected;
    }

    // Fungsi untuk menyensor konten
    censorContent(content) {
        let censoredContent = content;
        const detectedWords = this.detectInappropriateWords(content);
        
        detectedWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            
            // Jika ada kata pengganti, gunakan kata pengganti
            if (REPLACEMENT_WORDS[word.toLowerCase()]) {
                censoredContent = censoredContent.replace(regex, REPLACEMENT_WORDS[word.toLowerCase()]);
            } else {
                // Jika tidak ada pengganti, sensor dengan bintang
                const censoredWord = word.charAt(0) + '*'.repeat(word.length - 1);
                censoredContent = censoredContent.replace(regex, censoredWord);
            }
        });
        
        return {
            content: censoredContent,
            detectedWords: detectedWords,
            isCensored: detectedWords.length > 0
        };
    }

    // Fungsi utama moderasi
    moderate(userId, content) {
        const result = this.censorContent(content);
        
        // Log jika ada kata yang disensor
        if (result.isCensored) {
            this.logger.log(userId, content, result.content, result.detectedWords);
        }
        
        return {
            userId: userId,
            originalContent: content,
            moderatedContent: result.content,
            isCensored: result.isCensored,
            detectedWords: result.detectedWords,
            timestamp: new Date().toISOString()
        };
    }
}

// Inisialisasi moderator
const moderator = new ContentModerator();

// Endpoint untuk moderasi konten
app.post('/moderate', (req, res) => {
    try {
        const { userId, content } = req.body;
        
        // Validasi input
        if (!userId || !content) {
            return res.status(400).json({
                error: 'userId dan content diperlukan',
                success: false
            });
        }

        if (typeof content !== 'string') {
            return res.status(400).json({
                error: 'content harus berupa string',
                success: false
            });
        }

        // Proses moderasi
        const result = moderator.moderate(userId, content);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error in moderation:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan dalam proses moderasi',
            success: false
        });
    }
});

// Endpoint untuk mendapatkan log moderasi
app.get('/logs', (req, res) => {
    try {
        const { userId, limit } = req.query;
        const logs = moderator.logger.getLogs(userId, parseInt(limit) || 100);
        
        res.json({
            success: true,
            data: logs,
            total: logs.length
        });
        
    } catch (error) {
        console.error('Error retrieving logs:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan dalam mengambil log',
            success: false
        });
    }
});

// Endpoint untuk mendapatkan statistik moderasi
app.get('/stats', (req, res) => {
    try {
        const logs = moderator.logger.getLogs();
        const stats = {
            totalModerations: logs.length,
            highSeverity: logs.filter(log => log.severity === 'HIGH').length,
            mediumSeverity: logs.filter(log => log.severity === 'MEDIUM').length,
            lowSeverity: logs.filter(log => log.severity === 'LOW').length,
            uniqueUsers: [...new Set(logs.map(log => log.userId))].length,
            mostActiveUsers: this.getMostActiveUsers(logs),
            recentActivity: logs.slice(-10)
        };
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error retrieving stats:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan dalam mengambil statistik',
            success: false
        });
    }
});

// Fungsi helper untuk mendapatkan user paling aktif
function getMostActiveUsers(logs) {
    const userCounts = {};
    logs.forEach(log => {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
    });
    
    return Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({ userId, violations: count }));
}

// Endpoint untuk menambah kata ke daftar sensor
app.post('/add-word', (req, res) => {
    try {
        const { word, type, replacement } = req.body;
        
        if (!word || !type) {
            return res.status(400).json({
                error: 'word dan type diperlukan',
                success: false
            });
        }

        const cleanWord = word.toLowerCase().trim();
        
        if (type === 'profanity') {
            if (!PROFANITY_WORDS.includes(cleanWord)) {
                PROFANITY_WORDS.push(cleanWord);
            }
        } else if (type === 'sensitive') {
            if (!SENSITIVE_WORDS.includes(cleanWord)) {
                SENSITIVE_WORDS.push(cleanWord);
            }
        } else {
            return res.status(400).json({
                error: 'type harus "profanity" atau "sensitive"',
                success: false
            });
        }

        if (replacement) {
            REPLACEMENT_WORDS[cleanWord] = replacement;
        }
        
        res.json({
            success: true,
            message: `Kata "${word}" berhasil ditambahkan ke daftar ${type}`,
            data: { word: cleanWord, type, replacement }
        });
        
    } catch (error) {
        console.error('Error adding word:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan dalam menambah kata',
            success: false
        });
    }
});

// Endpoint untuk mendapatkan daftar kata yang disensor
app.get('/words', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                profanityWords: PROFANITY_WORDS,
                sensitiveWords: SENSITIVE_WORDS,
                replacementWords: REPLACEMENT_WORDS
            }
        });
        
    } catch (error) {
        console.error('Error retrieving words:', error);
        res.status(500).json({
            error: 'Terjadi kesalahan dalam mengambil daftar kata',
            success: false
        });
    }
});

// Endpoint untuk testing
app.post('/test', (req, res) => {
    const testCases = [
        {
            userId: 'user123',
            content: 'Halo semuanya, bagaimana kabarnya hari ini?'
        },
        {
            userId: 'user456',
            content: 'Anjing banget sih, goblok semua orang di sini!'
        },
        {
            userId: 'user789',
            content: 'Aku mau bunuh semua orang cina di sini!'
        },
        {
            userId: 'user111',
            content: 'Stupid people everywhere, damn it!'
        }
    ];

    const results = testCases.map(testCase => {
        return moderator.moderate(testCase.userId, testCase.content);
    });

    res.json({
        success: true,
        message: 'Test cases berhasil dijalankan',
        data: results
    });
});

// Middleware untuk handling error
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Terjadi kesalahan server',
        success: false
    });
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Forum Moderator Server berjalan di port ${PORT}`);
    console.log(`📝 Dokumentasi API:`);
    console.log(`   POST /moderate     - Moderasi konten`);
    console.log(`   GET  /logs         - Ambil log moderasi`);
    console.log(`   GET  /stats        - Statistik moderasi`);
    console.log(`   POST /add-word     - Tambah kata sensor`);
    console.log(`   GET  /words        - Daftar kata sensor`);
    console.log(`   POST /test         - Test moderasi`);
    console.log(`\n💡 Contoh penggunaan:`);
    console.log(`   curl -X POST http://localhost:${PORT}/moderate \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"userId": "user123", "content": "Halo semua!"}'`);
});

module.exports = app;