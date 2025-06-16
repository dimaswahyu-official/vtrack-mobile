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

    static async getDashboard(id: string, filterValue:string): Promise<any> {
        try {
            const response = await axiosInstance.get(`/dashboard/md-dashboard`, {
                params: {
                    user_id: id,
                    filter: filterValue,
                }});
            return response.data;
        } catch (error: any) {
            console.error('Get dashboard failed:', error);
            if (error.response?.status === 404) {
                throw new Error('Dashboard data not found');
            }
            throw new Error('Failed to fetch dashboard data');
        }
    }
}

export default ConstantService;
