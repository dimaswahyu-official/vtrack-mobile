import axiosInstance from "../config/axiosInstance";


class ReimburseService {

    static async getReimburseBbmList(id:string) :Promise<any> {
        try{
            const response = await axiosInstance.get(`/reimburse-bbm/user/${id}`);
            return response.data;
        }catch (error: any) {
            throw new Error('Error: ' +error);
        }
    }

    static async initialReimburse(formData:any) :Promise<any> {
        try{
            const response = await axiosInstance.post(`/reimburse-bbm`, formData ,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            return response.data;
        }catch (error: any) {
            throw new Error('Error Initial Reimburse: ' +error);
        }
    }

    static async finalReimburse(formData:any) :Promise<any> {
        try{
            const response = await axiosInstance.post(`/reimburse-bbm`, formData ,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            return response.data;
        }catch (error: any) {
            throw new Error('Error final Reimburse:: ' +error);
        }
    }
}

export default ReimburseService;