import bookService from '../services/bookService';

export const lookupCache = {
    getGenres: async () => {
        const cached = sessionStorage.getItem('bb_genres');
        if (cached) return JSON.parse(cached);
        const data = await bookService.getGenres();
        const genres = data.data || [];
        sessionStorage.setItem('bb_genres', JSON.stringify(genres));
        return genres;
    },
    
    getLanguages: async () => {
        const cached = sessionStorage.getItem('bb_languages');
        if (cached) return JSON.parse(cached);
        const data = await bookService.getLanguages();
        const languages = data.data || [];
        sessionStorage.setItem('bb_languages', JSON.stringify(languages));
        return languages;
    },
    
    getCountries: async () => {
        const cached = sessionStorage.getItem('bb_countries');
        if (cached) return JSON.parse(cached);
        const data = await bookService.getCountries();
        const countries = data.data || [];
        sessionStorage.setItem('bb_countries', JSON.stringify(countries));
        return countries;
    }
};

export default lookupCache;
