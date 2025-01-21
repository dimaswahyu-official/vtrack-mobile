import Toast from "react-native-toast-message";
import ActivityService from "./activityService";
import {ActivityRepository} from "../model/ActivityRepository";
import {useSQLiteContext} from "expo-sqlite";
import {ActivitySioModel} from "../model/ActivitySioRepository";
import {ActivityProgramModel} from "../model/ActivityProgramRepository";
import {ActivityBranchModel} from "../model/ActivityBranchRepository";
import {ActivitySogModel} from "../model/ActivitySogRepository";
import {ActivityOutletModel} from "../model/ActivityOutletRepository";


export const sendOfflineData = async (activity: any) => {

    const db = useSQLiteContext();
    try {
        if (!activity || !activity.length) {
            throw new Error('No data to submit');
        }
        // Prepare the main activity payload
        const formData = new FormData();
        formData.append('user_id', activity.user_id);
        formData.append('call_plan_id', activity.call_plan_id.toString());
        formData.append('call_plan_schedule_id', activity.call_plan_schedule_id.toString());
        if (activity.outlet_id) formData.append('outlet_id', activity.outlet_id.toString());
        if (activity.survey_outlet_id) formData.append('survey_outlet_id', activity.survey_outlet_id.toString());
        if (activity.program_id) formData.append('program_id', activity.program_id.toString());
        formData.append('status', activity.status.toString());
        formData.append('area', activity.area);
        formData.append('region', activity.region);
        formData.append('brand', activity.brand);
        formData.append('type_sio', activity.type_sio);
        formData.append('start_time', activity.start_time ? new Date(activity.start_time).toISOString() : '');
        formData.append('end_time', activity.end_time ? new Date(activity.end_time).toISOString() : '');
        formData.append('latitude', activity.latitude);
        formData.append('longitude', activity.longitude);
        formData.append('sale_outlet_weekly', activity.sale_outlet_weekly?.toString() || '');
        formData.append('range_facility', JSON.stringify(activity.rangeFacility));

        // Add photos
        if (activity.photo_program) {
            // @ts-ignore
            formData.append('photo_program', {
                uri: activity.photo_program,
                type: 'image/jpeg',
                name: activity.photo_program.fileName || 'program.jpg',
            });
        }

        if (activity.photo) {
            // @ts-ignore
            formData.append('photos', {
                uri: activity.photo,
                type: 'image/jpeg',
                name: activity.photo.fileName || 'photo.jpg',
            });
        }

        // Post MAIN Activity
        const responseActivity = await ActivityService.postActivity(formData);
        console.log('responseActivity', responseActivity);
        if (responseActivity.statusCode === 200) {
            await ActivityRepository.update(db, {
                call_plan_schedule_id: activity.call_plan_schedule_id,
                is_sync: 1
            });
            await ActivityOutletModel.update(db, {
                call_plan_schedule_id: activity.call_plan_schedule_id,
                is_sync: 1,
            });
        }

        // Post SIO data
        if (activity.activity_sio?.length) {
            for (const data of activity.activity_sio) {
                const formDataSio = new FormData();
                formDataSio.append('name', data.name);
                formDataSio.append('description', data.description);
                formDataSio.append('notes', data.notes);
                // @ts-ignore
                formDataSio.append('photo_before', {
                    uri: data.photo_before,
                    type: 'image/jpeg',
                    name: data.photo_before.fileName || 'photo.jpg',
                });
                // @ts-ignore
                formDataSio.append('photo_after', {
                    uri: data.photo_after,
                    type: 'image/jpeg',
                    name: data.photo_after.fileName || 'photo.jpg',
                });

                const responseSio = await ActivityService.postSio(activity.call_plan_schedule_id, formDataSio);
                if (responseSio.statusCode === 200) {
                    await ActivitySioModel.update(db, {
                        call_plan_schedule_id: activity.call_plan_schedule_id,
                        is_sync: 1,
                    });
                }
            }
        }


        // Post PROGRAM data
        if (activity.activity_program?.length) {
            for (const data of activity.activity_program) {
                const formDataProgram = new FormData();
                formDataProgram.append('name', data.name);
                formDataProgram.append('description', data.description);
                // @ts-ignore
                formDataProgram.append('file', {
                    uri: data.photo,
                    type: 'image/jpeg',
                    name: data.photo.fileName || 'image.jpg',
                });

                const responseProgram = await ActivityService.postProgram(activity.call_plan_schedule_id, formDataProgram);
                if (responseProgram.statusCode === 200) {
                    await ActivityProgramModel.update(db, {
                        call_plan_schedule_id: activity.call_plan_schedule_id,
                        is_sync: 1,
                    });
                }
            }
        }

        // Post BRANCH data
        if (activity.activity_branch?.length) {
            for (const data of activity.activity_branch) {
                const jsonPayload = {
                    name: data.name,
                    description: data.description,
                    value: data.value,
                    notes: data.notes,
                };

                const responseBranch = await ActivityService.postBranch(activity.call_plan_schedule_id, jsonPayload);
                if (responseBranch.statusCode === 200) {
                    await ActivityBranchModel.update(db, {
                        call_plan_schedule_id: activity.call_plan_schedule_id,
                        is_sync: 1,
                    });
                }
            }
        }

        // Post SOG data
        if (activity.activity_sog?.length) {
            for (const data of activity.activity_sog) {
                const sogData = {
                    name: data.name,
                    description: data.description,
                    value: data.value,
                    notes: data.notes,
                };

                const responseSog = await ActivityService.postSog(activity.call_plan_schedule_id, sogData);
                if (responseSog.statusCode === 200) {
                    await ActivitySogModel.update(db, {
                        call_plan_schedule_id: activity.call_plan_schedule_id,
                        is_sync: 1,
                    });
                }
            }
        }

    } catch (error) {
        console.error('Error submitting activity:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to submit activity.',
        });
    }
};