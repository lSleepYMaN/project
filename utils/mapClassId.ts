import * as detectionModel from '../models/detectionModel'

export const detection_map_class = async (allClass: any, label_name: any) => {
    let i = 0
    let id = 0
    // console.log('all class : ', allClass)
    // console.log('label name : ', label_name)
    for(i; i < allClass.length; i++){
        if (label_name.class_label == allClass[i]) {
            id = i
            break
        }
    }
    return id
}

export const map_detection_import = async (class_id: any, allClass: any, idproject: any) => {
    let id = 0
    for(let i = 0; i < allClass.length; i++){
        if(class_id == allClass[i].index){
            const getClass = await detectionModel.getlabelName(idproject,allClass[i].label)
            id = getClass[0].class_id
            break
        }
    }
    return id
}