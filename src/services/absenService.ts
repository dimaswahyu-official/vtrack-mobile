import axiosInstance from "../config/axiosInstance";


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

    static async AbsenOut(formData: any): Promise<any> {
        try {
            const response = await axiosInstance.put(`/absensi`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data
        } catch (error: any) {
            throw new Error(error);
        }
    }


    static async syncAbsen(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/absensi`, data);
            return response.data
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default AbsenService;
