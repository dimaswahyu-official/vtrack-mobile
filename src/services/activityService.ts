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
            throw new Error('Error: ' + error);
        }
    }

    static async syncActivity(data: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`/activity`, data);
            return response.data
        } catch (error: any) {
            throw new Error('Error: ' + error);
        }
    }

    static async postActivity(formData: any): Promise<any> {
        console.log('formData',formData);
        try {
            const response = await axiosInstance.post(`/activity`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            return response.data
        } catch (error: any) {
            throw new Error('Error: ' + error);
        }
    }

    static async postSio(id: number, formData: any): Promise<any> {
        try {
            console.log('formData',formData);
            const response = await axiosInstance.post(`activity-sio/${id}`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
            return response.data
        } catch (error: any) {
            throw new Error('Error: ' + error);
        }
    }

    static async postProgram(id: number, formData: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`activity-program/${id}`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
            return response.data
        } catch (error: any) {
            throw new Error('Error: ' + error);
        }
    }

    static async postBranch(id: number, formData:any): Promise<any> {
        try {
            console.log('branch',formData);
            const response = await axiosInstance.post(`activity-branch/${id}`, formData)
            return response.data
        } catch (error: any) {
            throw new Error('Error: ' + error);
        }
    }

    static async postSog(id: number, formData: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`activity-sog/${id}`, formData)
            return response.data
        } catch (error: any) {
            throw new Error('Error: ' + error);
        }
    }
}

export default ActivityService;
