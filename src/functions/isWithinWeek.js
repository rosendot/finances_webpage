const isWithinWeek = (date) => {
    if (!date) return false;
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const itemDate = new Date(date);
    return itemDate >= today && itemDate <= oneWeekFromNow;
};

export default isWithinWeek;