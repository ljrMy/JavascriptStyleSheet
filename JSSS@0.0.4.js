var id=1;
var lowerCamelCaseReg=/^[a-z]+([A-Z][a-z]+)*$/g,
    upperCamelCaseReg=/^([A-Z][a-z]+)*$/g;

/**
 * Covert to a normal attribute name
 * 转换属性名
 * @param {String} name 
 * @returns 
 */
function toProperty(name){
    lowerCamelCaseReg.lastIndex=0;
    upperCamelCaseReg.lastIndex=0;
    if(lowerCamelCaseReg.test(name)||upperCamelCaseReg.test(name))return name.replace(/[A-Z]/g,(match)=>{
        return '-'+match.toLocaleLowerCase()
    });
    return name;
}

/**
 * Covert to a normal attribute value
 * 转换属性值
 * @param {String|Array<String>|Array<Array>} value 
 */
function toValue(value){
    if(Array.isArray(value)){
        if(value.every(Array.isArray)){
            return value.map((arr)=>{arr.join(" ")}).join(',')
        }
        return value.join(" ")
    }
    return value
}

/**
 * Covert an object to a style sheet
 * 对象转样式表
 * @param {Object} styleSheet 
 */
function object2property(styleSheet,functions=[]){
    let result="";
    for(let style of Object.keys(styleSheet)){
        let container=`${style} {`;
        for(let property of Object.keys(styleSheet[style])){
            container+=`${toProperty(property)}: ${toValue(styleSheet[style][property])};`
        }
        container+=" }";
        result+=container+"\n";
    }
    return result

}

/**
 * A class --- JavascriptStyleSheet
 * JavascriptStyleSheet类
 */
export class JSStyleSheet{
    /**
     * 初始化
     * @param {Object} stylesheet
     */
    index=0;
    constructor(styleSheet){
        // 创建样式表
        this.styleSheet=styleSheet;
        this.styleIndex=new Object()
        // 创建样式元素
        let styleElement=document.createElement("style");
        styleElement.id=`JSSS${id++}`;
        document.head.appendChild(styleElement);
        this.styleElement=styleElement;
        // 筛选变量
        this.styleValues=new Object();
        Object.keys(this.styleSheet).filter((arg)=>{
            return arg[0]=="$";
        }).forEach((item)=>{
            this.styleValues[item]=this.styleSheet[item];
            delete this.styleSheet[item];
        })
        //筛选函数
        this.styleFunctions=new Object();
        Object.keys(this.styleSheet).filter((arg)=>{
            return typeof this.styleSheet[arg]=="function"
        }).forEach((item)=>{
            this.styleFunctions[item]=this.styleSheet[item];
            delete this.styleSheet[item];
        })
        // 设置样式
        for(let ele of Object.keys(this.styleSheet)){
            this.#setStyle(ele,this.styleSheet[ele])
        }
    }
    /**
     * 设置样式
     * @param {String} elementName 
     * @param {Object} style 
     */
    #setStyle(elementName,styleSheet){
        this.styleIndex[elementName]=new Object;
        let func=(oldStyleSheet)=>{
            let newStyleSheet=styleSheet;
            console.log(styleSheet)
            for(let style of Object.keys(styleSheet)){
                let property=style,value=styleSheet[style];
                if(Object.keys(this.styleValues).includes(value)){
                    value=this.styleValues[value];
                }
                // 避免重绘
                if(oldStyleSheet[property]==newStyleSheet[property]//旧属性值等于现属性值
                    &&typeof(newStyleSheet[property])!="function" //旧属性值为函数
                    &&typeof(oldStyleSheet[property])!="function" //新属性值也为函数
                ) continue;
                // 增加标志
                if(this.styleIndex[elementName][property]!=undefined){
                    this.styleElement.sheet.deleteRule(this.styleIndex[elementName][property])
                }else{
                    if(style[0]!="&"){
                    if(this.styleIndex[elementName]==undefined) this.styleIndex[elementName]=new Object()
                    this.styleIndex[elementName][property]=this.index++;
                    }
                }
                // @规则
                if(elementName[0]=="@"){
                    let rule=`${elementName} { ${object2property(styleSheet)} }`;
                    this.styleElement.sheet.insertRule(rule);
                    continue;
                }
                // 嵌套规则
                if(style[0]=="&"){
                    this.#setStyle(style.replace(/\&/g,elementName),styleSheet[style]);
                    delete styleSheet[style];
                    continue;
                }
                // 自定义属性
                if(Object.keys(this.styleFunctions).includes(style)){
                    let rule=new Object();
                    rule[elementName]=this.styleFunctions[style](styleSheet[style]);
                    this.styleElement.sheet.insertRule(object2property(rule))
                    continue;
                }
                // 普通规则
                property=toProperty(property);
                value=toValue(value);
                this.styleElement.sheet.insertRule(`${elementName} { ${property}: ${value};}`,this.styleIndex[elementName][property])
            }
            window.requestAnimationFrame(func.bind(this,newStyleSheet))
        }
        func(new Object())
    }
}

export class CSSLocalFunction{
    static url(arg1){
        return `url("${arg1}")`
    }
    static rgb(arg1,arg2,arg3){
        return `rgb(${arg1},${arg2},${arg3})`
    }
    static hsl(arg1,arg2,arg3){
        return `hsl(${arg1},${arg2},${arg3})`
    }
    static rgba(arg1,arg2,arg3,arg4){
        return `rgb(${arg1},${arg2},${arg3},${arg4})`
    }
    static hsla(arg1,arg2,arg3,arg4){
        return `hsl(${arg1},${arg2},${arg3},${arg4})`
    }
}

export class JSSSLocalFunction{
    static quote(arg1){
        return `"${arg1}"`
    }
}
