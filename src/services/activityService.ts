import axiosInstance from "../config/axiosInstance";


class ActivityService {

    static async updateProfile(id: string, formData: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/user/${id}`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            return response.data
        } catch (error: any) {
            console.error('Profile update failed:', error);
            throw new Error('Profile update failed: ' + error.message); // Customize error message
        }
    }

    static async getListingSchedule(id: string): Promise<any> {
        try {
            const response = await axiosInstance.get(`/schedule-plan/md/${id}`);
            return response.data
        } catch (error: any) {
            console.error('Profile update failed:', error);
            throw new Error('Profile update failed: ' + error.message); // Customize error message
        }
    }
}

export default ActivityService;
