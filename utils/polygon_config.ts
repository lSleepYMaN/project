
export const convert_to_normalize = (polygon: string, width: any, height: any) => {
    const str: string[] = []
    let point = ""
    const xy: string[] = polygon.split(" ")
    for(let i = 0; i < xy.length; i++){
        const num = xy[i].split(",")
        const num2: number = parseFloat(num[0])/width
        const num3: number = parseFloat(num[1])/height
        str.push(`${num2},${num3}`)
    }
    for(let i = 0; i < str.length; i++){
        if (i==0) {
            point = `${str[i]}`
            } else {
                    point = point.concat(" ",str[i])
            }
    }
    return point
}

export const convert_to_normal = (polygon: string, width: any, height: any) => {
    const str: string[] = []
    let point = ""
    const xy: string[] = polygon.split(" ")
    for(let i = 0; i < xy.length; i++){
        const num = xy[i].split(",")
        const num2: number = Math.round(parseFloat(num[0])*width)
        const num3: number = Math.round(parseFloat(num[1])*height)
        str.push(`${num2},${num3}`)
    }
    for(let i = 0; i < str.length; i++){
        if (i==0) {
            point = `${str[i]}`
            } else {
                    point = point.concat(" ",str[i])
            }
    }
    return point
} 

export const convert_to_normal_number = (polygon: string, width: any, height: any) => {
    const polygon_num = []
    const xy: string[] = polygon.split(" ")
    for(let i = 0; i < xy.length; i++){
        const num = xy[i].split(",")
        const num2: number = Math.round(parseFloat(num[0])*width)
        const num3: number = Math.round(parseFloat(num[1])*height)
        polygon_num.push(num2)
        polygon_num.push(num3)
    }
    return polygon_num
    
}

export const convert_to_bbox = (polygon: any[]) => {
    const xCoords = polygon.filter((_, index) => index % 2 === 0);
    const yCoords = polygon.filter((_, index) => index % 2 !== 0);
    const xMin = Math.min(...xCoords);
    const yMin = Math.min(...yCoords);
    const xMax = Math.max(...xCoords);
    const yMax = Math.max(...yCoords);

    const width = xMax - xMin
    const height = yMax - yMin
    
    return { xMin, yMin, width, height };
}