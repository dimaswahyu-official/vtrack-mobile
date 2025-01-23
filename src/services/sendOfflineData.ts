import Toast from "react-native-toast-message";
import ActivityService from "./activityService";
import {ActivityRepository} from "../model/ActivityRepository";
import {ActivitySioModel} from "../model/ActivitySioRepository";
import {ActivityProgramModel} from "../model/ActivityProgramRepository";
import {ActivityBranchModel} from "../model/ActivityBranchRepository";
import {ActivitySogModel} from "../model/ActivitySogRepository";
import {ActivityOutletModel} from "../model/ActivityOutletRepository";
import {SQLiteDatabase} from "expo-sqlite";

export const sendOfflineData = async (activity: any, isFull: number, db: SQLiteDatabase) => {
    try {

        if (!activity) {
            throw new Error('Activity data is required');
        }

        if (isFull === 1) {
            const updateActivity = await ActivityRepository.update(db, {
                call_plan_schedule_id: activity.call_plan_schedule_id,
                status: 200
            });
        }

        // Prepare the main activity payload
        const formData = new FormData();
        const requiredFields = ['user_id', 'call_plan_id', 'call_plan_schedule_id', 'area', 'region', 'brand', 'type_sio'];

        if (isFull === 1) {
            formData.append("status", '200');
        } else {
            formData.append("status", activity.status.toString());
        }

        // Validate required fields
        for (const field of requiredFields) {
            if (!activity[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
            formData.append(field, activity[field].toString());


        }


        // Optional fields
        const optionalFields = ['outlet_id', 'survey_outlet_id', 'program_id'];
        for (const field of optionalFields) {
            if (activity[field]) {
                formData.append(field, activity[field].toString());
            }
        }

        // Handle timestamps
        formData.append('start_time', activity.start_time ? new Date(activity.start_time).toISOString() : '');
        formData.append('end_time', activity.end_time ? new Date(activity.end_time).toISOString() : '');

        // Location data
        if (!activity.latitude || !activity.longitude) {
            throw new Error('Location data is required');
        }
        formData.append('latitude', activity.latitude);
        formData.append('longitude', activity.longitude);
        formData.append('sale_outlet_weekly', activity.sale_outlet_weekly?.toString() || '0');

        // Handle range facility data
        const facilityTypes = [
            'range_health_facilities',
            'range_work_place',
            'range_public_transportation_facilities',
            'range_worship_facilities',
            'range_playground_facilities',
            'range_educational_facilities'
        ];

        const rangeFacility = facilityTypes.reduce((acc, facility) => ({
            ...acc,
            [facility]: activity.activity_outlet?.includes(facility) ? 1 : 0
        }), {});

        formData.append('range_facility', JSON.stringify(rangeFacility));

        // Handle photo uploads
        const photoFields = [
            {key: 'photo_program', fileName: 'program.jpg'},
            {key: 'photos', fileName: 'photo.jpg', fieldName: 'photo'}
        ];

        for (const {key, fileName, fieldName} of photoFields) {
            const photoData = activity[fieldName || key];
            if (photoData) {
                // @ts-ignore
                formData.append(key, {
                    uri: photoData,
                    type: 'image/jpeg',
                    name: photoData.fileName || fileName,
                });
            }
        }

        // Submit main activity
        const responseActivity = await ActivityService.postActivity(formData);
        if (responseActivity.statusCode !== 200) {
            throw new Error('Failed to submit main activity');
        }

        // Update sync status for main activity
        // await Promise.all([
        //     ActivityRepository.update(db, {
        //         id: activity.id,
        //         call_plan_schedule_id: activity.call_plan_schedule_id,
        //         is_sync: 1
        //     }),
        //     ActivityOutletModel.update(db, {
        //         id: activity.activity_outlet?.id,
        //         call_plan_schedule_id: activity.call_plan_schedule_id,
        //         is_sync: 1,
        //     })
        // ]);

        console.log('activityService', JSON.stringify(activity));

        // Handle SIO data submission
        if (activity.activity_sio) {
            await Promise.all(activity.activity_sio.map(async (data: any) => {
                console.log(data);
                const formDataSio = new FormData();
                ['name', 'description', 'notes'].forEach(field =>
                    formDataSio.append(field, data[field])
                );

                ['photo_before', 'photo_after'].forEach(photo => {
                    if (data[photo]) {
                        // @ts-ignore
                        formDataSio.append(photo, {
                            uri: data[photo],
                            type: 'image/jpeg',
                            name: data[photo].fileName || 'photo.jpg',
                        });
                    }
                });

                const responseSio = ActivityService.postSio(activity.call_plan_schedule_id, formDataSio);
                // if (responseSio.statusCode === 200) {
                //     await ActivitySioModel.update(db, {
                //         id: data.id,
                //         call_plan_schedule_id: activity.call_plan_schedule_id,
                //         is_sync: 1,
                //     });
                // }
            }));
        }

        // Handle program data submission
        if (activity.activity_program) {
            await Promise.all(activity.activity_program.map(async (data: any) => {
                const formDataProgram = new FormData();
                formDataProgram.append('name', data.name);
                formDataProgram.append('description', data.description);
                if (data.photo) {
                    // @ts-ignore
                    formDataProgram.append('file', {
                        uri: data.photo,
                        type: 'image/jpeg',
                        name: data.photo.fileName || 'image.jpg',
                    });
                }

                const responseProgram = ActivityService.postProgram(activity.call_plan_schedule_id, formDataProgram);
                // if (responseProgram.statusCode === 200) {
                //     await ActivityProgramModel.update(db, {
                //         id: data.id,
                //         call_plan_schedule_id: activity.call_plan_schedule_id,
                //         is_sync: 1,
                //     });
                // }
            }));
        }

        // Handle branch data submission
        if (activity.activity_branch) {
            await Promise.all(activity.activity_branch.map(async (data: any) => {
                const jsonPayload = {
                    name: data.name,
                    description: data.description,
                    value: data.value,
                    notes: data.notes,
                };

                const responseBranch = ActivityService.postBranch(activity.call_plan_schedule_id, jsonPayload);
                // if (responseBranch.statusCode === 200) {
                //     await ActivityBranchModel.update(db, {
                //         id: data.id,
                //         call_plan_schedule_id: activity.call_plan_schedule_id,
                //         is_sync: 1,
                //     });
                // }
            }));
        }

        // Handle SOG data submission
        if (activity.activity_sog) {
            await Promise.all(activity.activity_sog.map(async (data: any) => {
                const sogData = {
                    name: data.name,
                    description: data.description,
                    value: data.value,
                    notes: data.notes,
                };

                const responseSog = ActivityService.postSog(activity.call_plan_schedule_id, sogData);
                // if (responseSog.statusCode === 200) {
                //     await ActivitySogModel.update(db, {
                //         id: data.id,
                //         call_plan_schedule_id: activity.call_plan_schedule_id,
                //         is_sync: 1,
                //     });
                // }
            }));
        }

        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Data successfully synchronized'
        });

    } catch (error: any) {
        console.error('Error submitting activity:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message || 'Failed to submit data'
        });
        throw error;
    }
};