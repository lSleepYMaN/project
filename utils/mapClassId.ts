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