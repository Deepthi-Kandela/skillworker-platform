const express = require('express');
const router = express.Router();
const { getScript, VOICE_SCRIPTS } = require('../services/pollyService');

router.get('/scripts', (req, res) => res.json({ scripts: Object.keys(VOICE_SCRIPTS) }));
router.get('/:script', getScript);

module.exports = router;
