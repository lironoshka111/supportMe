import axios from 'axios';

export const analyzeMessage = async (message: string) => {

    try {
        const apiKey = process.env.REACT_APP_NINJAS_API_KEY as string;// Replace with your actual API key
        const response = await axios.get(
            `https://api.api-ninjas.com/v1/profanityfilter?text=${encodeURIComponent(message)}`,
            {
                headers: {
                    'X-Api-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        const result = response.data;
        console.log('Original:', result.original);
        console.log('Censored:', result.censored);
        console.log('Has Profanity:', result.has_profanity);

        // Optionally set the result in a state or return it
        return result;

    } catch (error) {
        console.error("Error fetching profanity analysis:", error);
    }
};

