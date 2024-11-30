import moment from 'moment';
import 'moment/locale/id';  // Import Indonesian locale

// Set the locale to Indonesian (id)
moment.locale('id');

/**
 * Helper function to reformat time to Indonesian format: "Senin 29 Desember 2024"
 *
 * @param inputDate - The date or time to format, can be a string or a Date object.
 * @param format - The desired output format (default: 'dddd DD MMMM YYYY').
 * @returns The formatted date/time as a string.
 */
export const formatDate = (inputDate: string | Date, format: string = 'dddd, DD MMM YYYY'): string => {
    // Check if inputDate is valid
    if (!inputDate) return '';
    return moment(inputDate).format(format);
};

export const formatDateWithTime = (inputDate: string | Date, format: string = 'dddd, DD MMM YYYY HH:mm'): string => {
    // Check if inputDate is valid
    if (!inputDate) return '';
    return moment(inputDate).format(format);
};
