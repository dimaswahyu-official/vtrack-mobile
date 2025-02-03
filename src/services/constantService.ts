import axiosInstance from "../config/axiosInstance";


class ConstantService {

    static async getBrands(): Promise<any> {
        try {
            const response = await axiosInstance.get(`/brand/all`);
            return response.data
        } catch (error: any) {
            console.error('Get brands failed:', error);
            throw new Error('Get brands failed: ' + error.message);
        }
    }

    static async getSio(): Promise<any> {
        try {
            const response = await axiosInstance.get(`/sio/all`);
            return response.data
        } catch (error: any) {
            console.error('Get SIO failed:', error);
            throw new Error('Get SIO failed: ' + error.message);
        }
    }

    static async getDashboard(id: string): Promise<any> {
        try {
            const response = await axiosInstance.get(`/dashboard/md-dashboard`, {
                params: {
                    user_id: id
                }
            });
            return response.data
        } catch (error: any) {
            throw new Error('Error: ' + error);
        }
    }
}

export default ConstantService;
