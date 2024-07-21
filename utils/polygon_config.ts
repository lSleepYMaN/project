
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
