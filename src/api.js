export const fetchFinances = async () => {
    try {
        const response = await fetch('/finances');
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Error fetching finances data:', err);
        throw err;
    }
};