import axiosInstance from "../config/axiosInstance";
interface ResponseAbsence {
    statusCode: number;
    message: string;
    data: any;
}

class AbsenService {

    static async AbsenIn(formData: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/absensi`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            return response.data
        } catch (error: any) {
            console.error('Absen In failed:', error);
            throw new Error(error);
        }
    }

    static async AbsenOut(formData: any): Promise<ResponseAbsence> {
        try {
            const response = await axiosInstance.put(`/absensi`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data
        } catch (error: any) {
            throw new Error(error.response.data.message);
        }
    }

    static async findToday(userId: string): Promise<any> {
        try {
            const response = await axiosInstance.get(`/absensi/today/${userId}`);
            return response.data
        } catch (error: any) {
            throw new Error(error);
        }
    }


    static async getTimezone(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/absensi/today-timezone`, data);
            return response.data
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default AbsenService;
