const express = require('express');
const router = express.Router();
const { getPatientReadmissionRisk } = require('../db/bigquery');

// GET /api/patient/:patientId/risk
router.get('/:patientId/risk', async (req, res) => {
    try {
        const patientId = req.params.patientId;
        console.log(`[API Proxy] Fetching readmission risk for patient: ${patientId}`);
        
        // Call the BigQuery client we wrote earlier
        const riskData = await getPatientReadmissionRisk(patientId);

        if (!riskData) {
            return res.status(404).json({ 
                success: false, 
                message: 'Patient risk profile not found in enterprise warehouse.' 
            });
        }

        res.status(200).json({
            success: true,
            data: riskData
        });

    } catch (error) {
        console.error('[API Proxy] Error fulfilling BigQuery proxy request:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error while fetching analytical data.' 
        });
    }
});

module.exports = router;