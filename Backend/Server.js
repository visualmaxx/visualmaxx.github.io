const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

// Photo enhancement endpoint
app.post('/api/enhance-photo', upload.single('image'), (req, res) => {
    const file = req.file;
    const mode = req.body.mode;
    const outputPath = `outputs/${Date.now()}.png`;
    
    const python = spawn('python3', [
        'enhance.py',
        file.path,
        outputPath,
        mode
    ]);
    
    python.on('close', (code) => {
        if (code === 0) {
            res.download(outputPath, () => {
                fs.unlinkSync(file.path);
                fs.unlinkSync(outputPath);
            });
        } else {
            res.status(500).json({ error: 'Enhancement failed' });
        }
    });
});

app.listen(5000, () => console.log('API running on port 5000'));
