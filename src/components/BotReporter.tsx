import axios from 'axios';
import {firebaseConfig} from "../firebase";
export const analyzeMessage = async (message: string): Promise<boolean> => {
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${firebaseConfig.apiKey}`;

    const requestData = {
        comment: { text: message },
        languages: ["en"],
        requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {}, // Add SEVERE_TOXICITY
            IDENTITY_ATTACK: {}, // Add IDENTITY_ATTACK
            THREAT: {}, // Add THREAT
        },
    };

    try {
        const response = await axios.post(url, requestData);
        const toxicityScore = response.data.attributeScores.TOXICITY.summaryScore.value;
        const severeToxicityScore = response.data.attributeScores.SEVERE_TOXICITY.summaryScore.value;
        const identityAttackScore = response.data.attributeScores.IDENTITY_ATTACK.summaryScore.value;
        const threatScore = response.data.attributeScores.THREAT.summaryScore.value;

        // Combine scores for a more comprehensive check
        return toxicityScore > 0.7 || severeToxicityScore > 0.5 || identityAttackScore > 0.5 || threatScore > 0.5;
    } catch (error) {
        console.error('Error analyzing message:', error);
        return false;
    }
};
