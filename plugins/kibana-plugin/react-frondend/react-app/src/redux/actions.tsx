import {ADD_PROCESSOR} from "./actionTypes";

let nextProcessorId = 0;

export const addProcessor = (content:any) => ({
    type: ADD_PROCESSOR,
    payload: {
        id: ++nextProcessorId,
        content
    }
});