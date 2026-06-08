const { BigQuery } = require('@google-cloud/bigquery');

// Explicitly pass the key file path, ignoring all environment variables
const bigquery = new BigQuery({
    keyFilename: './boston-hospital-pipeline-e0f20d99f871.json' 
});

const getPatientReadmissionRisk = async (patientId) => {
    const query = `
        SELECT current_age, age_bracket, primary_diagnosis_description, is_30_day_readmission 
        FROM \`boston-hospital-pipeline.gold.mart_readmissions\`
        WHERE patient_id = @patientId
    `;

    const options = {
        query: query,
        params: { patientId: patientId },
    };

    try {
        const [rows] = await bigquery.query(options);
        return rows[0] || null; // Return the specific patient record
    } catch (error) {
        console.error('[BigQuery] Failed to fetch readmission data:', error);
        throw error;
    }
};

module.exports = { getPatientReadmissionRisk };